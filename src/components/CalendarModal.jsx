import React, { useState } from 'react';
import { formatDate } from '../utils/dateUtils';

const CalendarModal = ({ isOpen, onClose, selectedDate, onDateSelect, todos, categories }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const [modalCategoryId, setModalCategoryId] = useState('all');

  // 이전 렌더링 정보를 추적하여 동기화 (useEffect 대체)
  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen || selectedDate !== prevSelectedDate) {
    setPrevIsOpen(isOpen);
    setPrevSelectedDate(selectedDate);
    // 모달이 새로 열리거나 선택된 날짜가 바뀔 때만 뷰 날짜를 동기화
    if (isOpen) {
      setViewDate(new Date(selectedDate));
    }
  }

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // 이전 달/다음 달 이동
  const changeMonth = (offset) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  // 달력 데이터 생성
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0(일) ~ 6(토)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = formatDate(new Date());
  const selectedStr = formatDate(selectedDate);

  const renderCells = () => {
    const cells = [];
    
    // 이전 달 빈 칸
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-prev-${i}`} className="text-[0.95rem] font-semibold h-[38px] flex items-center justify-center rounded-xl cursor-default"></div>);
    }

    // 이번 달 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const current = new Date(year, month, day);
      const dateStr = formatDate(current);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedStr;
      
      // 선택된 카테고리에 맞는 Todo 개수 계산
      const count = todos.filter(todo => {
        if (todo.date !== dateStr) return false;
        if (modalCategoryId !== 'all') {
          const todoCatId = todo.categoryId || 'general';
          if (todoCatId !== modalCategoryId) return false;
        }
        return true;
      }).length;

      cells.push(
        <div 
          key={day} 
          className={`text-[0.95rem] font-semibold h-[38px] flex flex-col items-center justify-center rounded-xl cursor-pointer relative transition-colors ${
            isToday ? 'bg-primary-light text-primary font-bold' : isSelected ? 'bg-primary text-white' : 'text-text-main hover:bg-primary-light'
          }`}
          onClick={() => onDateSelect(current)}
        >
          <span>{day}</span>
          {count > 0 && (
            <span className={`text-[0.65rem] font-bold mt-[-2px] ${isSelected ? 'text-white' : 'text-danger'}`}>
              {count}개
            </span>
          )}
        </div>
      );
    }

    // 다음 달 빈 칸을 채워 총 42칸(6주) 고정
    const totalCells = 42;
    const remainingCells = totalCells - cells.length;
    for (let i = 0; i < remainingCells; i++) {
      cells.push(<div key={`empty-next-${i}`} className="text-[0.95rem] font-semibold h-[38px] flex items-center justify-center rounded-xl cursor-default"></div>);
    }

    return cells;
  };

  return (
    <div id="calendar-modal" className="fixed inset-0 flex justify-center items-center z-[9999]">
      <div className="absolute inset-0 bg-[#2d3748]/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-[90%] max-w-[400px] bg-white rounded-[24px] p-6 flex flex-col">
        <header className="flex justify-between items-center mb-5">
          <button className="bg-none border-none text-[1.2rem] text-primary cursor-pointer px-2.5 py-1 rounded-lg hover:bg-primary-light" onClick={() => changeMonth(-1)}>&#8592;</button>
          <h2 className="text-[1.25rem] font-extrabold text-text-main">{year}년 {month + 1}월</h2>
          <button className="bg-none border-none text-[1.2rem] text-primary cursor-pointer px-2.5 py-1 rounded-lg hover:bg-primary-light" onClick={() => changeMonth(1)}>&#8594;</button>
        </header>
        
        {/* 달력 내부 카테고리 필터 */}
        <div className="mb-4 text-center">
          <select 
            className="w-full p-1.5 border-2 border-border-main rounded-xl text-[0.9rem] font-bold outline-none focus:border-primary"
            value={modalCategoryId}
            onChange={(e) => setModalCategoryId(e.target.value)}
          >
            <option value="all">📂 전체 보기</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-7 text-center text-[0.85rem] font-bold text-text-muted mb-3 pb-1.5 border-b border-border-main">
          <div className="text-danger">일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div className="text-edit">토</div>
        </div>
        
        <div id="calendar-grid" className="grid grid-cols-7 gap-y-2 text-center">
          {renderCells()}
        </div>
        
        <footer className="mt-5 flex justify-end">
          <button className="px-4 py-2 bg-[#edf2f7] text-[#4a5568] border-none rounded-lg font-bold cursor-pointer" onClick={onClose}>닫기</button>
        </footer>
      </div>
    </div>
  );
};

export default CalendarModal;
