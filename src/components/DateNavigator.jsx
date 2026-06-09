import React from 'react';
import { formatDate, formatDateKorean, getMonday } from '../utils/dateUtils';

const DateNavigator = ({ selectedDate, onDateChange, weekBaseDate, onWeekBaseDateChange, todos, selectedCategoryId, onOpenCalendar }) => {
  // 주간 뷰 날짜 목록 생성
  const renderWeekDays = () => {
    const monday = getMonday(weekBaseDate);
    const days = [];
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    const todayStr = formatDate(new Date());
    const selectedStr = formatDate(selectedDate);

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayStr = formatDate(day);
      
      // 해당 날짜 및 선택된 카테고리의 Todo 개수 계산
      const count = todos.filter(todo => {
        const isSameDate = todo.date === dayStr;
        if (!isSameDate) return false;
        
        if (selectedCategoryId !== 'all') {
          const todoCatId = todo.categoryId || 'general';
          if (todoCatId !== selectedCategoryId) return false;
        }
        return true;
      }).length;

      days.push(
        <div 
          key={dayStr}
          className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-lg cursor-pointer transition-colors border-2 ${
            dayStr === selectedStr ? 'bg-card-bg border-primary' : 'border-transparent hover:bg-white/50'
          }`}
          onClick={() => onDateChange(new Date(day))}
        >
          <span className="text-[0.7rem] text-text-muted font-semibold">{dayNames[i]}</span>
          <span className={`text-[0.95rem] font-bold text-text-main ${
            dayStr === todayStr ? 'bg-accent-yellow w-[26px] h-[26px] rounded-full flex items-center justify-center' : ''
          }`}>
            {day.getDate()}
          </span>
          <span className="text-[0.7rem] text-primary font-bold min-h-[14px]">{count > 0 ? `${count}개` : ''}</span>
        </div>
      );
    }
    return days;
  };

  const moveDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    onDateChange(newDate);
  };

  const moveWeek = (weeks) => {
    const newDate = new Date(weekBaseDate);
    newDate.setDate(weekBaseDate.getDate() + weeks * 7);
    onWeekBaseDateChange(newDate);
  };

  // 주간 뷰 타이틀 (월요일-일요일 월 표시)
  const monday = getMonday(weekBaseDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const weekTitle = monday.getMonth() !== sunday.getMonth()
    ? `${monday.getFullYear()}년 ${monday.getMonth() + 1}월 - ${sunday.getMonth() + 1}월`
    : `${monday.getFullYear()}년 ${monday.getMonth() + 1}월`;

  return (
    <>
      <div className="flex justify-between items-center px-1">
        <div className="text-center text-[1.15rem] font-extrabold text-primary tracking-tight">{weekTitle}</div>
        <button 
          className="bg-primary-light border border-border-main rounded-lg px-2 py-1 cursor-pointer text-[1rem] transition-transform hover:scale-110" 
          title="달력 보기" 
          onClick={onOpenCalendar}
        >
          📅
        </button>
      </div>

      <section className="flex items-center gap-1 bg-primary-light rounded-xl p-2">
        <button className="bg-none border-none text-[1.1rem] text-primary cursor-pointer px-1.5 py-1 rounded-md transition-colors hover:bg-primary/10" onClick={() => moveWeek(-1)}>&#8592;</button>
        <div className="flex flex-1 gap-1">
          {renderWeekDays()}
        </div>
        <button className="bg-none border-none text-[1.1rem] text-primary cursor-pointer px-1.5 py-1 rounded-md transition-colors hover:bg-primary/10" onClick={() => moveWeek(1)}>&#8594;</button>
      </section>

      <section className="flex items-center justify-between bg-primary-light rounded-xl py-2.5 px-4">
        <button className="bg-none border-none text-[1.2rem] text-primary cursor-pointer px-2.5 py-0.5 rounded-md transition-colors hover:bg-primary/10" onClick={() => moveDate(-1)}>&#8592;</button>
        <span className="text-[1rem] font-bold text-text-main">{formatDateKorean(selectedDate)}</span>
        <button className="bg-none border-none text-[1.2rem] text-primary cursor-pointer px-2.5 py-0.5 rounded-md transition-colors hover:bg-primary/10" onClick={() => moveDate(1)}>&#8594;</button>
      </section>
    </>
  );
};

export default DateNavigator;
