"use client";

import { useState } from "react";

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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  todos: Todo[];
  categories: Category[];
};

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CalendarModal({ isOpen, onClose, selectedDate, onDateSelect, todos, categories }: Props) {
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate + "T00:00:00"));
  const [modalCategoryId, setModalCategoryId] = useState("all");

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const changeMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toISODate(new Date());

  const getCount = (dateStr: string) =>
    todos.filter((t) => {
      if (t.date !== dateStr) return false;
      if (modalCategoryId !== "all" && (t.categoryId || "general") !== modalCategoryId) return false;
      return true;
    }).length;

  const cells = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(<div key={`empty-prev-${i}`} className="h-[38px]" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = toISODate(new Date(year, month, day));
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const count = getCount(dateStr);

    cells.push(
      <div
        key={day}
        className={`h-[38px] flex flex-col items-center justify-center rounded-xl cursor-pointer transition-colors text-[0.95rem] font-semibold ${
          isSelected
            ? "bg-primary text-white"
            : isToday
            ? "bg-primary-light text-primary font-bold"
            : "text-text-main hover:bg-primary-light"
        }`}
        onClick={() => {
          onDateSelect(dateStr);
          onClose();
        }}
      >
        <span>{day}</span>
        {count > 0 && (
          <span className={`text-[0.65rem] font-bold mt-[-2px] ${isSelected ? "text-white" : "text-danger"}`}>
            {count}개
          </span>
        )}
      </div>
    );
  }

  const remaining = 42 - cells.length;
  for (let i = 0; i < remaining; i++) {
    cells.push(<div key={`empty-next-${i}`} className="h-[38px]" />);
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[9999]">
      <div className="absolute inset-0 bg-[#2d3748]/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-[90%] max-w-[400px] bg-white rounded-[24px] p-6 flex flex-col">
        {/* 월 이동 */}
        <header className="flex justify-between items-center mb-5">
          <button
            className="text-[1.2rem] text-primary cursor-pointer px-2.5 py-1 rounded-lg hover:bg-primary-light"
            onClick={() => changeMonth(-1)}
          >
            ←
          </button>
          <h2 className="text-[1.25rem] font-extrabold text-text-main">
            {year}년 {month + 1}월
          </h2>
          <button
            className="text-[1.2rem] text-primary cursor-pointer px-2.5 py-1 rounded-lg hover:bg-primary-light"
            onClick={() => changeMonth(1)}
          >
            →
          </button>
        </header>

        {/* 카테고리 필터 */}
        <div className="mb-4">
          <select
            className="w-full p-1.5 border-2 border-border-main rounded-xl text-[0.9rem] font-bold outline-none focus:border-primary"
            value={modalCategoryId}
            onChange={(e) => setModalCategoryId(e.target.value)}
          >
            <option value="all">📂 전체 보기</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 text-center text-[0.85rem] font-bold text-text-muted mb-3 pb-1.5 border-b border-border-main">
          <div className="text-danger">일</div>
          <div>월</div><div>화</div><div>수</div><div>목</div><div>금</div>
          <div className="text-edit">토</div>
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-y-2 text-center">
          {cells}
        </div>

        <footer className="mt-5 flex justify-end">
          <button
            className="px-4 py-2 bg-[#edf2f7] text-[#4a5568] rounded-lg font-bold cursor-pointer"
            onClick={onClose}
          >
            닫기
          </button>
        </footer>
      </div>
    </div>
  );
}
