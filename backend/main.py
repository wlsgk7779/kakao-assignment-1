from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv(".env.local")

# DB 설정
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# DB 모델
class Todo(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    date = Column(String, nullable=False)
    categoryId = Column(String, default="general")

class Category(Base):
    __tablename__ = "categories"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)

# Pydantic 스키마
class TodoCreate(BaseModel):
    text: str
    date: str
    categoryId: str

class TodoUpdate(BaseModel):
    text: Optional[str] = None
    completed: Optional[bool] = None
    categoryId: Optional[str] = None

class TodoResponse(BaseModel):
    id: int
    text: str
    completed: bool
    date: str
    categoryId: str

    class Config:
        from_attributes = True
        
class CategoryCreate(BaseModel):
    id: str
    name: str

class CategoryResponse(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True

# 테이블 생성
Base.metadata.create_all(bind=engine)

# FastAPI 앱 생성
app = FastAPI(title="Todo API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 앱 시작 시 기본 카테고리 초기화
@app.on_event("startup")
def startup():
    db = SessionLocal()
    try:
        if not db.query(Category).filter(Category.id == "general").first():
            db.add(Category(id="general", name="📂 일반"))
            db.commit()
    finally:
        db.close()

# ── Todo 엔드포인트 ──────────────────────────────

# GET /todos - 전체 조회
@app.get("/todos", response_model=list[TodoResponse])
def get_todos(db: Session = Depends(get_db)):
    return db.query(Todo).all()

# GET /todos/{id} - 단건 조회
@app.get("/todos/{id}", response_model=TodoResponse)
def get_todo(id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo

# POST /todos - 생성
@app.post("/todos", response_model=TodoResponse)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    new_todo = Todo(**todo.model_dump())
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

# PUT /todos/{id} - 수정
@app.put("/todos/{id}", response_model=TodoResponse)
def update_todo(id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    for key, value in todo.model_dump(exclude_none=True).items():
        setattr(db_todo, key, value)
    db.commit()
    db.refresh(db_todo)
    return db_todo

# DELETE /todos/{id} - 삭제
@app.delete("/todos/{id}")
def delete_todo(id: int, db: Session = Depends(get_db)):
    db_todo = db.query(Todo).filter(Todo.id == id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(db_todo)
    db.commit()
    return {"ok": True}

# ── Category 엔드포인트 ──────────────────────────

# GET /categories - 전체 조회
@app.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

# POST /categories - 생성
@app.post("/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.id == category.id).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    new_cat = Category(**category.model_dump())
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

# DELETE /categories/{id} - 삭제 (관련 todos는 general로 이동)
@app.delete("/categories/{id}")
def delete_category(id: str, db: Session = Depends(get_db)):
    if id == "general":
        raise HTTPException(status_code=400, detail="기본 카테고리는 삭제할 수 없습니다")
    cat = db.query(Category).filter(Category.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.query(Todo).filter(Todo.categoryId == id).update({"categoryId": "general"})
    db.delete(cat)
    db.commit()
    return {"ok": True}
