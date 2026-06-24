"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import CalendarModal from "./CalendarModal";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
};

type Filter = "all" | "active" | "completed";

const DAY_KO = ["월", "화", "수", "목", "금", "토", "일"];

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function formatDateKorean(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const weekDates = getWeekDates(weekStart);

  const fetchTodos = useCallback(async () => {
    const res = await fetch(`/api/todos`);
    if (res.ok) setTodos(await res.json());
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch(`/api/categories`);
    if (res.ok) setCategories(await res.json());
  }, []);

  useEffect(() => {
    fetchTodos();
    fetchCategories();
  }, [fetchTodos, fetchCategories]);

  const filteredTodos = todos.filter((todo) => {
    if (todo.date !== selectedDate) return false;
    if (selectedCategoryId !== "all" && (todo.categoryId || "general") !== selectedCategoryId) return false;
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  function countForDate(date: Date) {
    return todos.filter((t) => {
      if (t.date !== toISODate(date)) return false;
      if (selectedCategoryId !== "all" && (t.categoryId || "general") !== selectedCategoryId) return false;
      return true;
    }).length;
  }

  async function handleToggle(todo: Todo) {
    await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    fetchTodos();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const newId = `cat_${Date.now()}`;
    await fetch(`/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newId, name }),
    });
    setNewCategoryName("");
    setShowCategoryInput(false);
    fetchCategories();
  }

  async function handleDeleteCategory(categoryId: string) {
    if (categoryId === "general") return;
    if (!confirm("이 카테고리를 삭제하시겠습니까?\n해당 카테고리의 할 일들은 [📂 일반]으로 이동합니다.")) return;
    await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });
    if (selectedCategoryId === categoryId) setSelectedCategoryId("all");
    fetchCategories();
    fetchTodos();
  }

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }

  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  const monday = weekDates[0];
  const sunday = weekDates[6];
  const weekTitle =
    monday.getMonth() !== sunday.getMonth()
      ? `${monday.getFullYear()}년 ${monday.getMonth() + 1}월 - ${sunday.getMonth() + 1}월`
      : `${monday.getFullYear()}년 ${monday.getMonth() + 1}월`;

  return (
    <div className="w-[560px] max-w-full mx-auto">
      {/* 헤더 */}
      <header className="mb-4 flex justify-between items-center bg-card-bg p-5 rounded-dung shadow-dung">
        <div className="flex-1">
          <h1 className="text-[2.2rem] font-extrabold text-primary tracking-tight [text-shadow:1px_1px_0px_var(--color-accent-yellow)]">
            둥둥&apos;s Todo
          </h1>
          <p className="text-[0.95rem] text-text-muted mt-1.5">오늘 할 일을 신나게 정리해보세요!</p>
        </div>
        <div className="w-[100px] h-[100px] ml-3 flex-shrink-0">
          <img src="/image/dungdung.webp" alt="아기고릴라 둥둥" className="w-full h-full object-contain animate-bounce" />
        </div>
      </header>

      <main className="bg-card-bg rounded-dung p-6 shadow-dung flex flex-col gap-5">
        {/* 주간 타이틀 + 달력 버튼 */}
        <div className="flex justify-between items-center px-1">
          <div className="text-[1.15rem] font-extrabold text-primary tracking-tight">{weekTitle}</div>
          <button
            className="bg-primary-light border border-border-main rounded-lg px-2 py-1 cursor-pointer text-[1rem] transition-transform hover:scale-110"
            title="달력 보기"
            onClick={() => setIsCalendarOpen(true)}
          >
            📅
          </button>
        </div>

        {/* 주간 뷰 */}
        <section className="flex items-center gap-1 bg-primary-light rounded-xl p-2">
          <button
            className="text-primary text-[1.1rem] cursor-pointer px-1.5 py-1 rounded-md hover:bg-primary/10"
            onClick={prevWeek}
          >
            ←
          </button>
          <div className="flex flex-1 gap-1">
            {weekDates.map((date, i) => {
              const iso = toISODate(date);
              const isSelected = iso === selectedDate;
              const isToday = iso === toISODate(new Date());
              const count = countForDate(date);
              return (
                <div
                  key={iso}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-lg cursor-pointer transition-colors border-2 ${
                    isSelected ? "bg-card-bg border-primary" : "border-transparent hover:bg-white/50"
                  }`}
                  onClick={() => setSelectedDate(iso)}
                >
                  <span className="text-[0.7rem] text-text-muted font-semibold">{DAY_KO[i]}</span>
                  <span
                    className={`text-[0.95rem] font-bold text-text-main ${
                      isToday ? "bg-accent-yellow w-[26px] h-[26px] rounded-full flex items-center justify-center" : ""
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <span className="text-[0.7rem] text-primary font-bold min-h-[14px]">
                    {count > 0 ? `${count}개` : ""}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            className="text-primary text-[1.1rem] cursor-pointer px-1.5 py-1 rounded-md hover:bg-primary/10"
            onClick={nextWeek}
          >
            →
          </button>
        </section>

        {/* 선택 날짜 표시 */}
        <section className="flex items-center justify-center bg-primary-light rounded-xl py-2.5 px-4">
          <span className="text-[1rem] font-bold text-text-main">{formatDateKorean(selectedDate)}</span>
        </section>

        {/* 카테고리 필터 */}
        <section className="px-1">
          <div className="relative flex items-center gap-1">
            <button
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[#f1f3f9] text-text-muted hover:bg-primary-light hover:text-primary transition-colors text-[0.9rem]"
              onClick={() => categoryScrollRef.current?.scrollBy({ left: -120, behavior: "smooth" })}
            >
              ←
            </button>
          <div ref={categoryScrollRef} className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1">
            <button
              className={`whitespace-nowrap px-4 py-2 rounded-[20px] text-[0.9rem] font-bold cursor-pointer transition-all flex-shrink-0 ${
                selectedCategoryId === "all"
                  ? "bg-primary text-white shadow-[0_4px_12px_rgba(242,74,36,0.2)]"
                  : "bg-[#f1f3f9] text-text-muted hover:bg-primary-light hover:text-primary"
              }`}
              onClick={() => setSelectedCategoryId("all")}
            >
              📂 전체
            </button>
            {categories.map((cat) => (
              <div key={cat.id} className="relative flex-shrink-0 flex items-center">
                <button
                  className={`whitespace-nowrap px-4 py-2 rounded-[20px] text-[0.9rem] font-bold cursor-pointer transition-all ${
                    selectedCategoryId === cat.id
                      ? "bg-primary text-white shadow-[0_4px_12px_rgba(242,74,36,0.2)]"
                      : "bg-[#f1f3f9] text-text-muted hover:bg-primary-light hover:text-primary"
                  } ${cat.id !== "general" ? "pr-7" : ""}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {cat.name}
                </button>
                {cat.id !== "general" && (
                  <button
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-[0.7rem] font-bold rounded-full bg-black/20 hover:bg-danger hover:text-white transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                    title="카테고리 삭제"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {/* 카테고리 추가 버튼 */}
            <button
              className="whitespace-nowrap px-3 py-2 rounded-[20px] text-[0.9rem] font-bold cursor-pointer flex-shrink-0 bg-[#f1f3f9] text-text-muted hover:bg-primary-light hover:text-primary transition-all"
              onClick={() => setShowCategoryInput((v) => !v)}
            >
              ➕
            </button>
          </div>
            <button
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[#f1f3f9] text-text-muted hover:bg-primary-light hover:text-primary transition-colors text-[0.9rem]"
              onClick={() => categoryScrollRef.current?.scrollBy({ left: 120, behavior: "smooth" })}
            >
              →
            </button>
          </div>

          {/* 카테고리 추가 인풋 */}
          {showCategoryInput && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                placeholder="카테고리 이름 (예: 💻 공부)"
                className="flex-1 px-3 py-2 border-2 border-border-main rounded-xl text-[0.9rem] outline-none focus:border-primary"
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-primary text-white rounded-xl text-[0.9rem] font-bold hover:bg-primary-hover transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => { setShowCategoryInput(false); setNewCategoryName(""); }}
                className="px-4 py-2 border-2 border-border-main rounded-xl text-[0.9rem] font-bold text-text-muted hover:bg-primary-light transition-colors"
              >
                취소
              </button>
            </div>
          )}
        </section>

        {/* 새 Todo 추가 버튼 */}
        <Link
          href={`/todos/new?date=${selectedDate}`}
          className="w-full py-3 bg-primary text-white rounded-xl text-[1rem] font-bold text-center hover:bg-primary-hover transition-colors"
        >
          + 새 할 일 추가
        </Link>

        {/* 필터 탭 */}
        <section className="flex gap-1.5 bg-[#f1f3f9] rounded-xl p-1">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              className={`flex-1 py-2 rounded-lg text-[0.9rem] font-semibold cursor-pointer transition-all ${
                filter === f
                  ? "bg-card-bg text-primary shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                  : "bg-transparent text-text-muted hover:text-primary"
              }`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "전체" : f === "active" ? "진행 중" : "완료"}
            </button>
          ))}
        </section>

        {/* Todo 목록 */}
        <section className="min-h-[200px] flex flex-col">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-10 px-5">
              <div className="w-[280px] max-w-[85%] h-auto mx-auto mb-5 inline-block">
                <img src="/image/empty_image.png" alt="할 일 없음" className="w-full h-auto object-contain" />
              </div>
              <p className="text-text-muted font-bold text-[1rem] leading-relaxed">
                {filter === "active"
                  ? "✅ 해야 할 일은 다 끝났어요!"
                  : filter === "completed"
                  ? "📋 아직 완료된 할 일이 없어요!"
                  : "📋 할 일이 없어요! 새로운 할 일을 추가해보세요!"}
              </p>
            </div>
          ) : (
            <ul className="list-none flex flex-col gap-2">
              {filteredTodos.map((todo) => {
                const cat = categories.find((c) => c.id === todo.categoryId) || { name: "📂 일반" };
                return (
                  <li
                    key={todo.id}
                    className={`bg-todo-item-bg border border-[#bedfff] rounded-xl p-3.5 flex items-center gap-3 transition-all hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] ${
                      todo.completed ? "opacity-60 grayscale-[0.3]" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-primary cursor-pointer"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo)}
                    />
                    <div className="flex flex-col flex-1 ml-2.5">
                      <span
                        className={`text-[0.95rem] font-semibold leading-snug break-all ${
                          todo.completed ? "line-through text-text-muted" : "text-text-main"
                        }`}
                      >
                        {todo.text}
                      </span>
                      <span className="text-[0.75rem] text-text-muted font-medium mt-0.5">{cat.name}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Link
                        href={`/todos/${todo.id}`}
                        className="px-2.5 py-1 bg-edit text-white rounded-md text-[0.8rem] font-bold hover:bg-edit-hover"
                      >
                        수정
                      </Link>
                      <button
                        className="px-2.5 py-1 bg-danger text-white rounded-md text-[0.8rem] font-bold cursor-pointer hover:bg-danger-hover"
                        onClick={() => handleDelete(todo.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onDateSelect={(date) => setSelectedDate(date)}
        todos={todos}
        categories={categories}
      />
    </div>
  );
}
