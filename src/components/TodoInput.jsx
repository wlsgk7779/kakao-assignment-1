import React, { useState } from 'react';

const TodoInput = ({ categories, onAdd, onAddCategory, onDeleteCategory }) => {
  const [text, setText] = useState('');
  const [categoryId, setCategoryId] = useState('general');
  const [showError, setShowError] = useState(false);

  const handleAdd = () => {
    if (text.trim() === '') {
      setShowError(true);
      return;
    }
    onAdd(text.trim(), categoryId);
    setText('');
    setShowError(false);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    
    if (value === 'add_new_trigger') {
      const name = prompt('새로운 카테고리 이름을 입력하세요 (예: 💻 운영체제):');
      if (name && name.trim() !== '') {
        const newId = onAddCategory(name);
        setCategoryId(newId);
      } else {
        setCategoryId('general');
      }
    } else if (value === 'delete_trigger') {
      // 삭제 팝업 로직
      const customCats = categories.filter(c => c.id !== 'general');
      if (customCats.length === 0) {
        alert('⚠️ 삭제할 커스텀 카테고리가 없습니다.');
        setCategoryId('general');
        return;
      }

      let msg = '❌ 삭제할 카테고리 번호를 입력하세요:\n\n';
      customCats.forEach((c, i) => msg += `${i + 1}. ${c.name}\n`);
      
      const input = prompt(msg);
      const idx = parseInt(input) - 1;

      if (!isNaN(idx) && idx >= 0 && idx < customCats.length) {
        onDeleteCategory(customCats[idx].id);
      }
      setCategoryId('general');
    } else {
      setCategoryId(value);
    }
  };

  return (
    <section>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-3 border-2 border-border-main rounded-xl text-[1rem] outline-none bg-card-bg text-text-main focus:border-primary"
          placeholder="둥둥아 이거 먼저 해야 해..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (showError) setShowError(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <select 
          className="px-2 py-3 border-2 border-border-main rounded-xl text-[0.95rem] font-bold bg-card-bg text-text-main outline-none cursor-pointer w-[110px] flex-shrink-0 focus:border-primary"
          value={categoryId}
          onChange={handleCategoryChange}
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
          <option value="add_new_trigger">➕ 카테고리 추가...</option>
          <option value="delete_trigger">❌ 카테고리 삭제...</option>
        </select>
        <button className="px-5 py-3 bg-primary text-white border-none rounded-xl text-[1rem] font-bold cursor-pointer whitespace-nowrap hover:bg-primary-hover" onClick={handleAdd}>추가</button>
      </div>
      <p className={`text-danger text-[0.85rem] mt-2 font-semibold ${showError ? '' : 'hidden'}`}>
        ⚠️ 할 일을 입력해야 둥둥이가 춤을 춰요!
      </p>
    </section>
  );
};

export default TodoInput;
