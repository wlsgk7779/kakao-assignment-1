import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ todos, filter, onToggle, onDelete, onSaveEdit, categories, onFilterChange, onAddCategory }) => {
  return (
    <>
      <section className="flex gap-1.5 bg-[#f1f3f9] rounded-xl p-1">
        <button 
          className={`flex-1 py-2 rounded-lg text-[0.9rem] font-semibold cursor-pointer transition-all ${
            filter === 'all' ? 'bg-card-bg text-primary shadow-[0_2px_8px_rgba(0,0,0,0.05)]' : 'bg-transparent text-text-muted hover:text-primary'
          }`}
          onClick={() => onFilterChange('all')}
        >
          전체
        </button>
        <button 
          className={`flex-1 py-2 rounded-lg text-[0.9rem] font-semibold cursor-pointer transition-all ${
            filter === 'active' ? 'bg-card-bg text-primary shadow-[0_2px_8px_rgba(0,0,0,0.05)]' : 'bg-transparent text-text-muted hover:text-primary'
          }`}
          onClick={() => onFilterChange('active')}
        >
          진행 중
        </button>
        <button 
          className={`flex-1 py-2 rounded-lg text-[0.9rem] font-semibold cursor-pointer transition-all ${
            filter === 'completed' ? 'bg-card-bg text-primary shadow-[0_2px_8px_rgba(0,0,0,0.05)]' : 'bg-transparent text-text-muted hover:text-primary'
          }`}
          onClick={() => onFilterChange('completed')}
        >
          완료
        </button>
      </section>

      <section className="min-h-[380px] flex flex-col">
        {todos.length === 0 ? (
          <div className="text-center py-10 px-5">
            <div className="w-[320px] max-w-[85%] h-auto mx-auto mb-5 inline-block">
              <img src="/image/empty_image.png" alt="할 일 끝난 둥둥" className="w-full h-auto object-contain" />
            </div>
            <p className="text-text-muted font-bold text-[1rem] leading-relaxed">
              {filter === 'active' ? '✅ 해야 할 일은 다 끝났어요! 둥둥이랑 둥가둥가 놀아볼까요?' :
               filter === 'completed' ? '📋 아직 완료된 할 일이 없어요! 둥둥이와 함께 힘내봐요!' :
               '📋 할 일이 없어요! 새로운 할 일을 추가해보세요!'}
            </p>
          </div>
        ) : (
          <ul className="list-none flex flex-col gap-2">
            {todos.map(todo => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onToggle={onToggle}
                onDelete={onDelete}
                onSaveEdit={onSaveEdit}
                categories={categories}
                onAddCategory={onAddCategory}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
};

export default TodoList;
