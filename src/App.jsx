import { useState, useEffect } from 'react';
import Header from './components/Header';
import DateNavigator from './components/DateNavigator';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import CategoryFilter from './components/CategoryFilter';
import CalendarModal from './components/CalendarModal';
import { formatDate } from './utils/dateUtils';

// 날짜 포맷팅 유틸리티

function App() {
  // 1. 상태 관리
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('todos');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('categories');
      const parsed = saved ? JSON.parse(saved) : [{ id: 'general', name: '📂 일반' }];
      return Array.isArray(parsed) ? parsed : [{ id: 'general', name: '📂 일반' }];
    } catch (e) {
      return [{ id: 'general', name: '📂 일반' }];
    }
  });
  const [filter, setFilter] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem('selectedDate');
    if (saved) {
      const date = new Date(saved);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });
  const [weekBaseDate, setWeekBaseDate] = useState(() => {
    const saved = localStorage.getItem('weekBaseDate');
    if (saved) {
      const date = new Date(saved);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 2. 통합 날짜 변경 핸들러 (연쇄 렌더링 방지)
  const handleDateChange = (date) => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      setSelectedDate(date);
      setWeekBaseDate(new Date(date)); // 두 상태를 동시에 업데이트하여 렌더링을 묶음 처리
    }
  };

  // 로컬스토리지 저장 (순수 사이드 이펙트)
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      localStorage.setItem('selectedDate', selectedDate.toISOString());
    }
  }, [selectedDate]);

  useEffect(() => {
    if (weekBaseDate instanceof Date && !isNaN(weekBaseDate.getTime())) {
      localStorage.setItem('weekBaseDate', weekBaseDate.toISOString());
    }
  }, [weekBaseDate]);

  // 3. CRUD 핸들러
  const handleAddTodo = (text, categoryId) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      date: formatDate(selectedDate),
      categoryId: categoryId || 'general'
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const handleToggle = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDelete = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleSaveEdit = (id, text, categoryId) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, text, categoryId: categoryId || 'general' } : todo
    ));
  };

  const handleDeleteCategory = (categoryId) => {
    if (categoryId === 'general') return;

    if (confirm('정말로 이 카테고리를 삭제하시겠습니까?\n해당 카테고리의 할 일들은 [📂 일반]으로 이동합니다.')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setTodos(prev => prev.map(todo => 
        (todo.categoryId === categoryId || !todo.categoryId) ? { ...todo, categoryId: 'general' } : todo
      ));
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId('all');
      }
    }
  };

  const handleAddCategory = (name) => {
    const newId = `cat_${Date.now()}`;
    const newCat = { id: newId, name: name.trim() };
    setCategories(prev => [...prev, newCat]);
    return newId;
  };

  // 4. 필터링 로직
  const filteredTodos = todos.filter(todo => {
    // 날짜 필터링
    const isSameDate = todo.date === formatDate(selectedDate);
    if (!isSameDate) return false;

    // 카테고리 필터링
    if (selectedCategoryId !== 'all') {
      const todoCatId = todo.categoryId || 'general';
      if (todoCatId !== selectedCategoryId) return false;
    }

    // 상태 필터링 (전체/진행중/완료)
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="w-[560px] max-w-full mx-auto">
      <Header />
      
      <main className="bg-card-bg rounded-dung p-6 shadow-dung flex flex-col gap-5">
        <DateNavigator 
          selectedDate={selectedDate}
          onDateChange={handleDateChange} 
          weekBaseDate={weekBaseDate}
          onWeekBaseDateChange={setWeekBaseDate}
          todos={todos}
          selectedCategoryId={selectedCategoryId}
          onOpenCalendar={() => setIsCalendarOpen(true)} 
        />
        <CategoryFilter 
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
        <TodoInput 
          categories={categories} 
          onAdd={handleAddTodo} 
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
        <TodoList 
          todos={filteredTodos} 
          filter={filter} 
          categories={categories}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onSaveEdit={handleSaveEdit}
          onFilterChange={setFilter}
          onAddCategory={handleAddCategory}
        />
      </main>

      <CalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        selectedDate={selectedDate}
        todos={todos}
        categories={categories}
        onDateSelect={(date) => {
          handleDateChange(date); 
          setIsCalendarOpen(false);
        }}
      />
    </div>
  );
}

export default App;
