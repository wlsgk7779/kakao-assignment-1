import React, { useState } from 'react';

const TodoItem = ({ todo, onToggle, onDelete, onSaveEdit, categories, onAddCategory }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editCategory, setEditCategory] = useState(todo.categoryId || 'general');

  const handleSave = () => {
    if (editText.trim() === '') return;
    onSaveEdit(todo.id, editText, editCategory);
    setIsEditing(false);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'add_new_trigger') {
      const name = prompt('새로운 카테고리 이름을 입력하세요 (예: 💻 운영체제):');
      if (name && name.trim() !== '') {
        const newId = onAddCategory(name);
        setEditCategory(newId);
      }
    } else {
      setEditCategory(value);
    }
  };

  const targetCategory = categories?.find(c => c.id === todo.categoryId) || { name: '📂 일반' };

  return (
    <li className={`bg-todo-item-bg border border-[#bedfff] rounded-xl p-3.5 flex items-center gap-3 transition-all hover:translate-y-[-1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] ${todo.completed ? 'opacity-60 grayscale-[0.3]' : ''}`}>
      {isEditing ? (
        <div className="flex flex-col flex-1">
          <input 
            type="text" 
            className="flex-1 px-2.5 py-1.5 border-2 border-primary rounded-lg text-[1rem] outline-none" 
            value={editText} 
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <select 
            className="w-[120px] mt-1 p-1 border-2 border-border-main rounded-lg text-[0.9rem] outline-none focus:border-primary" 
            value={editCategory}
            onChange={handleCategoryChange}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            <option value="add_new_trigger">➕ 카테고리 추가...</option>
          </select>
          <div className="flex gap-1 mt-2">
            <button className="px-2.5 py-1 bg-success text-white border-none rounded-md text-[0.8rem] font-bold cursor-pointer hover:bg-success-hover" onClick={handleSave}>저장</button>
            <button className="px-2.5 py-1 bg-danger text-white border-none rounded-md text-[0.8rem] font-bold cursor-pointer hover:bg-danger-hover" onClick={() => setIsEditing(false)}>취소</button>
          </div>
        </div>
      ) : (
        <>
          <input
            type="checkbox"
            className="w-5 h-5 accent-primary cursor-pointer"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
          />
          <div className="flex flex-col flex-1 ml-2.5">
            <span className={`text-[0.95rem] font-semibold leading-snug break-all ${todo.completed ? 'line-through text-text-muted' : 'text-text-main'}`}>
              {todo.text}
            </span>
            <span className="text-[0.75rem] text-text-muted font-medium mt-0.5">
              {targetCategory.name}
            </span>
          </div>
          <div className="flex gap-1 shrink-0">
            <button className="px-2.5 py-1 bg-edit text-white border-none rounded-md text-[0.8rem] font-bold cursor-pointer hover:bg-edit-hover" onClick={() => setIsEditing(true)}>수정</button>
            <button className="px-2.5 py-1 bg-danger text-white border-none rounded-md text-[0.8rem] font-bold cursor-pointer hover:bg-danger-hover" onClick={() => onDelete(todo.id)}>삭제</button>
          </div>
        </>
      )}
    </li>
  );
};

export default TodoItem;
