import React from 'react';

const Header = () => {
  return (
    <header className="mb-4 flex justify-between items-center bg-card-bg p-5 rounded-dung shadow-dung">
      <div className="flex-1">
        <h1 className="text-[2.2rem] font-extrabold text-primary tracking-tight [text-shadow:1px_1px_0px_var(--color-accent-yellow)]">
          둥둥's Todo
        </h1>
        <p className="text-[0.95rem] text-text-muted mt-1.5">오늘 할 일을 신나게 정리해보세요!</p>
      </div>
      <div className="w-[100px] h-[100px] ml-3 flex-shrink-0">
        <img src="/image/dungdung.webp" alt="아기고릴라 둥둥" className="w-full h-full object-contain animate-bounce" />
      </div>
    </header>
  );
};

export default Header;
