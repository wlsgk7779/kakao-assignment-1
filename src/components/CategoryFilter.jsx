import React from 'react';

const CategoryFilter = ({ categories, selectedCategoryId, onSelectCategory }) => {
  return (
    <section className="px-1">
      <div className="flex gap-2 overflow-x-auto pb-2 [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button 
          className={`whitespace-nowrap px-4 py-2 rounded-[20px] text-[0.9rem] font-bold cursor-pointer transition-all flex-shrink-0 ${
            selectedCategoryId === 'all' 
              ? 'bg-primary text-white border-primary shadow-[0_4px_12px_rgba(242,74,36,0.2)]' 
              : 'bg-[#f1f3f9] text-text-muted border-2 border-transparent hover:bg-primary-light hover:text-primary'
          }`}
          onClick={() => onSelectCategory('all')}
        >
          📂 전체
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`whitespace-nowrap px-4 py-2 rounded-[20px] text-[0.9rem] font-bold cursor-pointer transition-all flex-shrink-0 ${
              selectedCategoryId === cat.id 
                ? 'bg-primary text-white border-primary shadow-[0_4px_12px_rgba(242,74,36,0.2)]' 
                : 'bg-[#f1f3f9] text-text-muted border-2 border-transparent hover:bg-primary-light hover:text-primary'
            }`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryFilter;
