// ===== 데이터 저장소 =====
// todos 배열: 모든 Todo 항목을 저장하는 배열
// 각 항목은 { id, text, completed, date } 형태의 객체
let todos = [];

// ===== 카테고리 데이터 저장소 =====
// 기본 카테고리로 '📂 일반'을 배열 객체로 들고 시작합니다.
let categories = [
  { id: 'general', name: '📂 일반' }
];

// 현재 선택된 필터 상태 (기본값: 전체)
// 'all' | 'active' | 'completed' 세 가지 값 중 하나
let currentFilter = 'all';

// 현재 선택된 날짜 (기본값: 오늘)
// Date 객체로 관리하고, 화면 표시와 저장은 문자열로 변환해서 사용
let selectedDate = new Date();

// 주간 뷰 기준 날짜 (새로 추가)
// 이 날짜가 속한 주를 주간 뷰에 표시
// 처음엔 오늘 날짜 기준으로 시작
let weekBaseDate = new Date();

// 🎯 [달력 추가] 달력 모달 안에서 월을 이동할 때 기준이 되는 날짜
let calendarCurrentDate = new Date();


// ===== HTML 요소 참조 =====
// document.getElementById()로 HTML 요소를 JS에서 조작할 수 있게 가져옴
const todoInput          = document.getElementById('todo-input');          // 텍스트 입력창
const addBtn             = document.getElementById('add-btn');             // 추가 버튼
const todoList           = document.getElementById('todo-list');           // Todo 목록 ul
const errorMessage       = document.getElementById('error-message');       // 에러 메시지
const emptyState         = document.getElementById('empty-state');         // 빈 상태 메시지
const currentDateDisplay = document.getElementById('current-date-display'); // 날짜 표시 텍스트
const prevDateBtn        = document.getElementById('prev-date-btn');       // 이전 날짜 버튼
const nextDateBtn        = document.getElementById('next-date-btn');       // 다음 날짜 버튼
const weekDaysContainer  = document.getElementById('week-days');           // 주간 요일 칸 컨테이너
const prevWeekBtn        = document.getElementById('prev-week-btn');       // 이전 주 버튼
const nextWeekBtn        = document.getElementById('next-week-btn');       // 다음 주 버튼
const weekMonthDisplay   = document.getElementById('week-month-display');    // 주간 컨테이너에서 몇월인지 나타냄
const todoCategorySelect = document.getElementById('todo-category-select');

// 🎯 [달력 추가] 달력 HTML 요소 참조들
const calendarModal      = document.getElementById('calendar-modal');       // 달력 모달 전체 창
const openCalendarBtn    = document.getElementById('open-calendar-btn');   // 달력 열기 📅 버튼
const closeCalendarBtn   = document.getElementById('close-calendar-btn');  // 달력 닫기 버튼
const calPrevMonthBtn    = document.getElementById('cal-prev-month');       // 달력 이전 달 버튼
const calNextMonthBtn    = document.getElementById('cal-next-month');       // 달력 다음 달 버튼
const calMonthYearTitle  = document.getElementById('cal-month-year-title'); // 달력 상단 제목 (연도/월)
const calendarGrid       = document.getElementById('calendar-grid');       // 달력 날짜 격자(Grid) container

// querySelectorAll(): 해당 선택자에 매칭되는 모든 요소를 NodeList로 가져옴
const filterBtns = document.querySelectorAll('.filter-btn');


// ===== 로컬스토리지 저장 =====
// todos 배열이 바뀔 때마다 이 함수를 호출해서 브라우저 창고에 저장
function saveTodos() {
  // JSON.stringify: 배열/객체 → 문자열로 변환 (로컬스토리지는 문자열만 저장 가능)
  localStorage.setItem('todos', JSON.stringify(todos));
}
// categories 배열이 바뀔 때마다 로컬스토리지에 저장하는 함수
function saveCategories() {
  localStorage.setItem('categories', JSON.stringify(categories));
}


// ===== 로컬스토리지 불러오기 =====
// 페이지 로드 시 브라우저 창고에서 todos를 꺼내와서 복원
function loadTodos() {
  // getItem(): 저장된 값을 문자열로 가져옴 (없으면 null 반환)
  const savedTodos = localStorage.getItem('todos');

  if (savedTodos) {
    // JSON.parse: 문자열 → 배열/객체로 변환 (저장할 때의 반대 과정)
    todos = JSON.parse(savedTodos);
  }
  // savedTodos가 null이면 todos는 빈 배열 [] 그대로 유지

  // 🎯 [새로 추가] 로컬스토리지에서 카테고리 데이터 꺼내와서 복원
  const savedCategories = localStorage.getItem('categories');
  if (savedCategories) {
    categories = JSON.parse(savedCategories);
  }
}


// ===== 고유 ID 생성 =====
// 각 Todo를 구별하기 위한 고유 번호 생성
// Date.now()는 현재 시간(밀리초)을 숫자로 반환 → 항상 다른 값
function generateId() {
  return Date.now();
}


// ===== 날짜를 'YYYY-MM-DD' 문자열로 변환 =====
// Date 객체를 "2025-06-03" 형태의 문자열로 변환
// 날짜 비교/저장 시 문자열로 통일해서 사용 (시간대 문제 방지)
function formatDate(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1, 한 자리면 앞에 0 붙임
  const day   = String(date.getDate()).padStart(2, '0');       // 한 자리면 앞에 0 붙임
  return `${year}-${month}-${day}`; // ex) "2025-06-03"
}


// ===== 날짜를 한국어 형식으로 표시 =====
// "2025년 6월 3일 (월)" 형태로 변환해서 화면에 보여줌
function formatDateKorean(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토']; // 요일 배열 (0=일요일)
  const year  = date.getFullYear();
  const month = date.getMonth() + 1;
  const day   = date.getDate();
  const dayOfWeek = days[date.getDay()]; // getDay()는 0~6 반환
  return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
}


// ===== 날짜 표시 업데이트 =====
// 화면 상단의 날짜 텍스트를 현재 selectedDate 기준으로 갱신
function updateDateDisplay() {
  currentDateDisplay.textContent = formatDateKorean(selectedDate);
}


// ===== 날짜 이동 (일간 뷰) =====
// days: 양수면 다음 날짜, 음수면 이전 날짜로 이동
function moveDate(days) {
  selectedDate.setDate(selectedDate.getDate() + days);

  // 선택된 날짜가 현재 주간 뷰 범위를 벗어나면 주간 뷰도 같이 이동
  weekBaseDate = new Date(selectedDate);

  updateDateDisplay(); // 날짜 텍스트 갱신
  renderWeekView();    // 주간 뷰 갱신 (선택 표시 업데이트)
  renderTodos();       // 새 날짜의 Todo 목록으로 다시 그리기
}


// ===== 이번 주 월요일 날짜 계산 =====
// 기준 날짜(date)가 속한 주의 월요일을 반환
function getMonday(date) {
  const d = new Date(date);           // 원본 날짜 복사 (원본 변경 방지)
  const day = d.getDay();             // 0=일, 1=월, 2=화 ... 6=토
  // 월요일(1)을 기준으로 현재 요일과의 차이를 계산
  // 일요일(0)은 -6으로 처리 (일요일이 주의 마지막이므로)
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

// 🎯 카테고리 select 박스의 옵션들을 동적으로 그려주는 함수
function renderCategorySelect() {
  if (!todoCategorySelect) return;

  // 기존 옵션들 초기화
  todoCategorySelect.innerHTML = '';

  // 1. 현재 categories 배열에 있는 항목들 채우기
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    todoCategorySelect.appendChild(option);
  });

  // 2. 맨 마지막에 "추가하기" 트리거 옵션 강제 결합
  const addOption = document.createElement('option');
  addOption.value = 'add_new_trigger';
  addOption.textContent = '➕ 카테고리 추가...';
  todoCategorySelect.appendChild(addOption);

  // 🎯맨 마지막에 "삭제하기" 트리거 옵션 강제 결합
  const deleteOption = document.createElement('option');
  deleteOption.value = 'delete_trigger';
  deleteOption.textContent = '❌ 카테고리 삭제...';
  todoCategorySelect.appendChild(deleteOption);
}

// ===== 주간 뷰 렌더링 =====
// weekBaseDate 기준으로 해당 주 월~일을 화면에 그림
function renderWeekView() {
  const monday = getMonday(weekBaseDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // 월요일의 월(Month)과 일요일의 월(Month)이 다르면 "X월 - Y월" 형태로 표시
  if (weekMonthDisplay) {
    if (monday.getMonth() !== sunday.getMonth()) {
      // 만약 연도까지 바뀌는 주(예: 12월 말 ~ 1월 초)라면 연도 표시가 꼬이지 않게 월요일 기준으로 출력
      weekMonthDisplay.textContent = `${monday.getFullYear()}년 ${monday.getMonth() + 1}월 - ${sunday.getMonth() + 1}월`;
    } else {
      weekMonthDisplay.textContent = `${monday.getFullYear()}년 ${monday.getMonth() + 1}월`;
    }
  }
  
  // 기준 날짜가 속한 주의 월요일 구하기
  
  const todayStr = formatDate(new Date()); // 오늘 날짜 문자열 (오늘 강조용)
  const selectedStr = formatDate(selectedDate); // 현재 선택된 날짜 문자열

  // 주간 뷰 컨테이너 초기화
  weekDaysContainer.innerHTML = '';

  // 월요일부터 7일(월~일) 반복
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i); // i=0: 월, i=1: 화 ... i=6: 일
    const dayStr = formatDate(day);

    // 해당 날짜의 Todo 개수 계산
    const count = todos.filter(todo => todo.date === dayStr).length;

    // 요일 이름 배열 (월요일부터 시작)
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

    // 날짜 칸 div 생성
    const dayEl = document.createElement('div');

    // 클래스 조합: 기본 + 오늘이면 'today' + 선택된 날짜면 'selected'
    let classNames = 'week-day';
    if (dayStr === todayStr) classNames += ' today';
    if (dayStr === selectedStr) classNames += ' selected';
    dayEl.className = classNames;

    // 날짜 칸 내부 HTML: 요일 이름 / 날짜 숫자 / Todo 개수
    dayEl.innerHTML = `
      <span class="week-day-name">${dayNames[i]}</span>
      <span class="week-day-date">${day.getDate()}</span>
      <span class="week-day-count">${count > 0 ? count + '개' : ''}</span>
    `;

    // 날짜 칸 클릭 시 해당 날짜로 이동
    dayEl.addEventListener('click', function () {
      selectedDate = new Date(day); // 클릭한 날짜로 selectedDate 업데이트
      updateDateDisplay();          // 일간 뷰 날짜 텍스트 갱신
      renderWeekView();             // 주간 뷰 선택 표시 갱신
      renderTodos();                // 해당 날짜의 Todo 목록 표시
    });

    weekDaysContainer.appendChild(dayEl); // 컨테이너에 추가
  }
}


// ===== 주 이동 =====
// weeks: 1이면 다음 주, -1이면 이전 주
function moveWeek(weeks) {
  // 7일 단위로 weekBaseDate 이동
  weekBaseDate.setDate(weekBaseDate.getDate() + weeks * 7);
  renderWeekView(); // 주간 뷰 다시 그리기
}


// 🎯 ===== [새로 추가] 대형 한달 달력 팝업창 알고리즘 렌더링 =====
// calendarCurrentDate 기준으로 한 달 치 달력을 모달 그리드에 그림
function renderCalendarModal() {
  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth();

  // 달력 모달 헤더에 현재 보고 있는 연도와 월 설정
  calMonthYearTitle.textContent = `${year}년 ${month + 1}월`;

  // 기존 격자 칸들 초기화
  calendarGrid.innerHTML = '';

  // 알고리즘 기본 1: 이번 달 1일이 무슨 요일인지 인덱스 구하기 (0: 일요일 ~ 6: 토요일)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // 알고리즘 기본 2: 이번 달 마지막 날짜(말일)가 며칠인지 자동 계산 (다음 달의 0번째 날)
  const lastDate = new Date(year, month + 1, 0).getDate();

  const todayStr = formatDate(new Date());
  const selectedStr = formatDate(selectedDate);

  // 1. 1일이 시작하기 전 빈 공간 채우기
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-cell empty';
    calendarGrid.appendChild(emptyCell);
  }

  // 2. 1일부터 말일까지 보드판 채우기 (For 문 순회 알고리즘)
  for (let date = 1; date <= lastDate; date++) {
    const cellDate = new Date(year, month, date);
    const cellDateStr = formatDate(cellDate);

    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    cell.textContent = date;

    // 오늘 날짜 하이라이트 스타일 추가
    if (cellDateStr === todayStr) cell.classList.add('today-cell');
    // 현재 메인 화면에 선택된 날짜 하이라이트 스타일 추가
    if (cellDateStr === selectedStr) cell.classList.add('selected-cell');
    
    // 해당 날짜에 할 일이 존재하는지 검사해서 점(닷) 표시용 클래스 추가
    const hasTodo = todos.some(todo => todo.date === cellDateStr);
    if (hasTodo) cell.classList.add('has-todo');

    // 달력 내부의 개별 날짜 칸을 클릭했을 때 일어나는 동적 이벤트 바인딩
    cell.addEventListener('click', function() {
      selectedDate = new Date(year, month, date); // 선택된 날짜 갱신
      weekBaseDate = new Date(selectedDate);       // 주간 뷰 포커스 맞추기
      
      updateDateDisplay(); // 일간 네비게이터 글자 변경
      renderWeekView();    // 주간 캘린더 트랙 새로 그리기
      renderTodos();       // 클릭한 날짜의 할 일 목록 새로고침
      closeCalendar();     // 달력 창 자동으로 닫기
    });

    calendarGrid.appendChild(cell);
  }
}

// 🎯 달력 모달 제어용 서브 열기/닫기 함수들
function openCalendar() {
  // 모달을 열었을 때, 현재 메인에서 선택된 날짜를 기준으로 달력이 열리도록 동기화
  calendarCurrentDate = new Date(selectedDate);
  renderCalendarModal();
  calendarModal.classList.remove('hidden'); // hidden 클래스를 제거하여 화면에 노출
}

function closeCalendar() {
  calendarModal.classList.add('hidden'); // hidden 클래스를 추가하여 숨김 처리
}

// 달력 안에서 이전 달 / 다음 달 버튼을 눌렀을 때의 월 이동 계산 알고리즘
function moveCalendarMonth(months) {
  // -1이면 이전 달로, 1이면 다음 달로 객체의 월 정보를 가감
  calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + months);
  renderCalendarModal();
}


// ===== Todo 추가 =====
function addTodo() {
  // trim(): 앞뒤 공백 제거 후 값 가져오기
  const text = todoInput.value.trim();

  // 입력값이 비어있으면 에러 메시지 표시하고 함수 종료
  if (text === '') {
    showError();
    return;
  }

  // 🎯 [오타 수정] 드롭다운 셀렉트 박스에서 현재 선택된 카테고리 ID 가져오기
  const selectedCategory = todoCategorySelect.value;

  // 새 Todo 객체 생성
  const newTodo = {
    id: generateId(),               // 고유 ID
    text: text,                     // 입력한 텍스트
    completed: false,               // 처음엔 완료되지 않은 상태
    date: formatDate(selectedDate), // 현재 선택된 날짜를 문자열로 저장
    categoryId: selectedCategory    // 🎯 어느 카테고리인지 외래키 기록!
  };

  // todos 배열에 새 항목 추가
  todos.push(newTodo);

  // 입력창 초기화 및 에러 메시지 숨기기
  todoInput.value = '';
  hideError();

  saveTodos();      // 변경된 todos를 로컬스토리지에 저장
  renderWeekView(); // 주간 뷰 Todo 개수 갱신
  renderTodos();    // 화면 다시 그리기
}




// ===== Todo 삭제 =====
// targetId: 삭제할 Todo의 id
function deleteTodo(targetId) {
  // filter(): 해당 id가 아닌 항목만 남겨서 새 배열 생성
  todos = todos.filter(todo => todo.id !== targetId);
  saveTodos();      // 변경된 todos를 로컬스토리지에 저장
  renderWeekView(); // 주간 뷰 Todo 개수 갱신
  renderTodos();
}


// ===== Todo 완료 토글 =====
// 완료 상태를 true ↔ false로 전환
function toggleComplete(targetId) {
  // map(): 배열을 순회하면서 해당 id의 항목만 completed 값 반전
  todos = todos.map(todo => {
    if (todo.id === targetId) {
      return { ...todo, completed: !todo.completed }; // 스프레드 연산자로 나머지 값 유지
    }
    return todo;
  });
  saveTodos();   // 변경된 todos를 로컬스토리지에 저장
  renderTodos();
}


// ===== Todo 수정 모드 전환 =====
// 텍스트를 input 요소로 교체해서 수정할 수 있게 함
function enableEdit(targetId) { // 인자를 targetId 1개만 받도록 깔끔하게 정돈!
  // 해당 id를 가진 li 요소 찾기
  const listItem = document.querySelector(`[data-id="${targetId}"]`);

  // 변수로 넘어오던 텍스트 대신, todos 배열에서 해당 id를 가진 Todo 객체를 직접 찾습니다.
  const targetTodo = todos.find(todo => todo.id === targetId);
  if (!targetTodo) return; // 만약 찾지 못했다면 예외 처리로 탈출

  // 🎯 [카테고리 수정 추가] 기존 텍스트 구역(todo-content-wrapper) 전체를 통째로 교체합니다.
  const contentWrapper = listItem.querySelector('.todo-content-wrapper');
  
  // 1. 새로운 텍스트 입력창 생성 및 기존 텍스트 주입
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = targetTodo.text;
  editInput.style.width = '100%';

  // 2. 새로운 카테고리 선택 드롭다운 생성 및 옵션 채우기 (알고리즘식 동적 복사)
  const editSelect = document.createElement('select');
  editSelect.className = 'todo-category-select';
  editSelect.style.width = '120px';
  editSelect.style.marginTop = '4px';
  editSelect.style.padding = '4px';

  // 🎯 [실시간 동적 카테고리 생성 알고리즘] 
  // 수정 창 안의 드롭다운 목록을 렌더링하는 전용 내부 함수를 선언합니다.
  // 이렇게 분리해 두면 수정 모드 도중에 카테고리가 추가되어도 드롭다운만 쏙 새로고침할 수 있습니다.
  function populateEditSelect(selectedValue) {
    editSelect.innerHTML = ''; // 기존 옵션 청소

    // 현재 시스템에 등록된 카테고리 목록들을 옵션으로 그대로 이식
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      editSelect.appendChild(option);
    });

    // 🎯 [핵심 추가] 메인창과 똑같이 수정 드롭다운 맨 아래에도 "추가하기" 트리거 옵션 강제 결합
    const addOption = document.createElement('option');
    addOption.value = 'add_new_trigger';
    addOption.textContent = '➕ 카테고리 추가...';
    editSelect.appendChild(addOption);

    // 지정된 카테고리가 자동 선택되도록 포커싱
    editSelect.value = selectedValue;
  }

  // 처음 켜질 때는 이 투두가 원래 가지고 있던 카테고리로 셋업
  populateEditSelect(targetTodo.categoryId || 'general');

  // 🎯 [핵심 추가] 수정 모드 안의 드롭다운에서 "카테고리 추가"를 눌렀을 때의 감시 리스너 연결
  editSelect.addEventListener('change', function() {
    if (editSelect.value === 'add_new_trigger') {
      const newCategoryName = prompt('새로운 카테고리 이름을 입력하세요 (예: 💻 운영체제):');
      
      // 취소 혹은 공백 방어선
      if (!newCategoryName || newCategoryName.trim() === '') {
        editSelect.value = targetTodo.categoryId || 'general'; // 원래대로 롤백
        return;
      }

      // 새 고유 ID 생성 및 상위 배열 데이터 동기화
      const newId = 'cat_' + Date.now();
      categories.push({ id: newId, name: newCategoryName.trim() });
      
      // 데이터가 확장되었으니 로컬스토리지 영구 저장 호출
      saveCategories();
      
      // 🎯 상단 메인 입력창의 카테고리 드롭다운도 실시간 동기화하여 앱 전체 싱크 맞추기
      renderCategorySelect();

      // 현재 수정 모드 안의 드롭다운 목록도 새로 고치고 방금 만든 카테고리를 자동 선택!
      populateEditSelect(newId);
    }
  });

  // 3. 기존의 텍스트/배지 구역을 지우고, [입력창 + 드롭다운]을 세로로 이쁘게 묶어 교체 배치
  const editContainer = document.createElement('div');
  editContainer.className = 'todo-edit-container';
  editContainer.style.display = 'flex';
  editContainer.style.flexDirection = 'column';
  editContainer.style.flex = '1';
  editContainer.appendChild(editInput);
  editContainer.appendChild(editSelect);

  listItem.replaceChild(editContainer, contentWrapper);

  // 버튼 그룹을 "저장" 버튼으로 교체
  const btnGroup = listItem.querySelector('.btn-group');
  btnGroup.innerHTML = `
    <button class="btn btn-save" onclick="saveEdit(${targetId})">저장</button>
  `;

  // [수정 완료 편의 기능] 텍스트 입력 후 엔터 키 처리
  editInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      saveEdit(targetId);
    }
  });

  // 수정 input에 포커스 이동
  editInput.focus();
}


// ===== Todo 수정 저장 =====
function saveEdit(targetId) {
  const listItem = document.querySelector(`[data-id="${targetId}"]`);
  
  // 🎯 [카테고리 수정 추가] 수정 중인 컨테이너 안에서 입력창과 드롭다운을 각각 타겟팅해서 값을 긁어옵니다.
  const editInput = listItem.querySelector('.edit-input');
  const editSelect = listItem.querySelector('.todo-category-select');
  
  const newText = editInput.value.trim();
  const newCategoryId = editSelect.value; // 🎯 사용자가 수정한 새 카테고리 ID 추출

  // 빈 값이면 저장하지 않고 원래대로 복원
  if (newText === '') {
    renderTodos();
    return;
  }

  // 해당 id의 Todo 텍스트와 카테고리 ID를 모두 업데이트 (멀티 필드 세팅 알고리즘)
  todos = todos.map(todo => {
    if (todo.id === targetId) {
      return { ...todo, text: newText, categoryId: newCategoryId }; // 🎯 두 변수 모두 변경 사항 적용
    }
    return todo;
  });

  saveTodos();   // 변경된 todos를 로컬스토리지에 저장
  renderTodos();
}


// ===== 날짜 + 필터 조건에 맞는 Todo 목록 반환 =====
// 1단계: 선택된 날짜의 Todo만 추림
// 2단계: currentFilter 값에 따라 추가로 걸러냄
function getFilteredTodos() {
  // 현재 선택된 날짜를 문자열로 변환 (Todo의 date 필드와 비교하기 위해)
  const todayStr = formatDate(selectedDate);

  // 1단계: 날짜 필터 - 선택된 날짜와 일치하는 항목만 추림
  const todayTodos = todos.filter(todo => todo.date === todayStr);

  // 2단계: 상태 필터 적용
  if (currentFilter === 'active') {
    return todayTodos.filter(todo => !todo.completed); // 진행 중
  }
  if (currentFilter === 'completed') {
    return todayTodos.filter(todo => todo.completed);  // 완료
  }
  return todayTodos; // 전체
}


// ===== 화면에 Todo 목록 그리기 =====
// todos 배열을 읽어서 HTML로 변환 후 화면에 표시
function renderTodos() {
  // 기존 목록 초기화
  todoList.innerHTML = '';

  // 날짜 + 필터 조건에 맞는 항목만 가져옴
  const filteredTodos = getFilteredTodos();

  // 필터링된 결과가 없으면 빈 상태 메시지 표시
  if (filteredTodos.length === 0) {
    emptyState.classList.remove('hidden');

    // 필터에 맞는 안내 메시지를 다르게 표시
    if (currentFilter === 'active') {
      emptyState.querySelector('p').textContent = '✅ 해야 할 일은 다 끝났어요! 둥둥이랑 둥가둥가 놀아볼까요?';
    } else if (currentFilter === 'completed') {
      emptyState.querySelector('p').textContent = '📋 아직 완료된 할 일이 없어요! 둥둥이와 함께 힘내봐요!';
    } else {
      emptyState.querySelector('p').textContent = '📋 할 일이 없어요! 새로운 할 일을 추가해보세요!';
    }
    return;
  }

  // todos가 있으면 빈 상태 메시지 숨기기
  emptyState.classList.add('hidden');

  // 필터링된 항목만 화면에 그리기
  // todos 배열을 순회하면서 각 항목을 li 요소로 만들어 목록에 추가
  filteredTodos.forEach(todo => {
    const li = document.createElement('li');           // li 요소 생성
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`; // 완료 시 클래스 추가
    li.setAttribute('data-id', todo.id);              // id를 data 속성으로 저장

    // 🛡️ [하위 호환 및 버그 수정] 기존 구형 투두에 categoryId가 없더라도 '일반' 카테고리가 매칭되게 예외 처리
    const targetCategory = categories.find(c => c.id === todo.categoryId) || { name: '📂 일반' };

    // li 내부 HTML 구성
    // 완료 여부에 따라 버튼 텍스트 변경
    // 💡 [레이아웃 디테일 업데이트] 텍스트 밑에 카테고리 이름 배지를 소형 글씨로 결합해 출력합니다
    li.innerHTML = `
      <input
        type="checkbox"
        class="todo-checkbox"
        onclick="toggleComplete(${todo.id})"
        ${todo.completed ? 'checked': ""}
      />
      <div class="todo-content-wrapper" style="display: flex; flex-direction: column; flex: 1; margin-left: 10px;">
        <span class="todo-text" style="margin-left: 0;">${todo.text}</span>
        <span class="todo-badge" style="font-size: 0.75rem; color: #888; font-weight: 500; margin-top: 2px;">
          ${targetCategory.name}
        </span>
      </div>
      <div class="btn-group">
        <button class="btn btn-edit" onclick="enableEdit(${todo.id}, '${todo.text.replace(/'/g, "\\'")}')">
          수정
        </button>
        <button class="btn btn-delete" onclick="deleteTodo(${todo.id})">삭제</button>
      </div>
    `;

    todoList.appendChild(li); // 목록에 추가
  });
}


// ===== 필터 탭 변경 =====
// 클릭된 탭의 data-filter 값을 currentFilter에 저장하고 화면을 다시 그림
function changeFilter(selectedFilter) {
  // 현재 필터 값 업데이트
  currentFilter = selectedFilter;

  // 모든 탭에서 active 클래스 제거
  filterBtns.forEach(btn => btn.classList.remove('active'));

  // 클릭된 탭에만 active 클래스 추가
  // querySelector로 data-filter가 일치하는 버튼을 찾음
  document.querySelector(`[data-filter="${selectedFilter}"]`).classList.add('active');

  // 필터 바뀐 상태로 화면 다시 그리기
  renderTodos();
}


// ===== 에러 메시지 표시/숨김 =====
function showError() {
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}


// ===== 이벤트 리스너 등록 =====

// 추가 버튼 클릭 시 addTodo 실행
addBtn.addEventListener('click', addTodo);

// 입력창에서 Enter 키 누를 시 addTodo 실행
todoInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    addTodo();
  }
});

// 입력창에 타이핑 시작하면 에러 메시지 숨기기
todoInput.addEventListener('input', function () {
  if (todoInput.value.trim() !== '') {
    hideError();
  }
});

// 🎯 카테고리 select 박스에서 무언가 선택했을 때 일어나는 이벤트
todoCategorySelect.addEventListener('change', function() {
  // 만약 맨 마지막의 '카테고리 추가...'를 클릭했다면?
  if (todoCategorySelect.value === 'add_new_trigger') {
    const newCategoryName = prompt('새로운 카테고리 이름을 입력하세요 (예: 💻 운영체제):');
    
    // 취소를 누르거나 아무것도 입력 안 한 경우 방어 코드
    if (!newCategoryName || newCategoryName.trim() === '') {
      todoCategorySelect.value = 'general'; // 다시 기본 '일반'으로 롤백
      return;
    }

    // 새로운 고유 ID 생성 (알고리즘용 해시 타임스탬프)
    const newId = 'cat_' + Date.now();
    
    // 카테고리 배열에 새 과목 객체 push
    categories.push({ id: newId, name: newCategoryName.trim() });
    
    // 🎯 [새로 추가] 새 카테고리가 배열에 반영되었으니 영구 저장!
    saveCategories();

    // 드롭다운 새로고침
    renderCategorySelect();
    
    // 방금 만든 카테고리가 자동으로 선택되어 있도록 포커스 이동
    todoCategorySelect.value = newId;
  }
  // 🎯 [새로 추가] 만약 '카테고리 삭제...'를 클릭했다면?
  else if (todoCategorySelect.value === 'delete_trigger') {
    // 기본 카테고리인 '일반'을 제외하고 사용자가 만든 커스텀 카테고리만 필터링 (삭제 후보군 추출)
    const customCategories = categories.filter(c => c.id !== 'general');

    if (customCategories.length === 0) {
      alert('⚠️ 삭제할 커스텀 카테고리가 없습니다. 먼저 카테고리를 추가해 주세요!');
      todoCategorySelect.value = 'general';
      return;
    }

    // 삭제할 대상을 고르기 위한 안내 팝업 문자열 생성
    let listMessage = '❌ 삭제할 카테고리의 번호를 입력하세요:\n(해당 카테고리의 할 일들은 모두 [📂 일반]으로 이동합니다)\n\n';
    customCategories.forEach((cat, index) => {
      listMessage += `${index + 1}. ${cat.name}\n`;
    });

    const selectedIndexInput = prompt(listMessage);
    const parsedIndex = parseInt(selectedIndexInput) - 1;

    // 입력 예외 처리 (방어선 구축)
    if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= customCategories.length) {
      alert('⚠️ 올바른 번호가 아닙니다. 삭제를 취소합니다.');
      todoCategorySelect.value = 'general';
      return;
    }

    // 진짜 삭제할 타겟 객체 선정
    const targetCategory = customCategories[parsedIndex];

    // 최종 확인 의사 묻기
    if (confirm(`정말로 [${targetCategory.name}] 카테고리를 삭제하시겠습니까?`)) {
      
      // 🛡️ [안전 보장 알고리즘] 삭제될 카테고리 ID를 지니고 있던 기존 투두들의 외래키를 'general'로 일괄 강제 이주
      todos = todos.map(todo => {
        if (todo.categoryId === targetCategory.id) {
          return { ...todo, categoryId: 'general' };
        }
        return todo;
      });

      // 데이터 저장소 배열에서 해당 카테고리 객체 쳐내기 (필터링 삭제 알고리즘)
      categories = categories.filter(c => c.id !== targetCategory.id);

      // 변화된 투두 목록과 카테고리 목록을 모두 로컬스토리지에 영구 갱신 저장!
      saveTodos();
      saveCategories();

      // UI 뷰 동기화 새로고침
      renderCategorySelect();
      renderTodos(); // 배지 이름이 '일반'으로 실시간 반영되도록 호출!

      alert(`✅ [${targetCategory.name}] 카테고리가 정상적으로 삭제되었습니다.`);
    }

    // 작업 완료 후 드롭다운 포커스를 안전하게 기본 '일반'으로 복귀
    todoCategorySelect.value = 'general';
  }
});

// 필터 탭 클릭 이벤트
// forEach로 각 탭 버튼에 클릭 이벤트 등록
filterBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    // data-filter 속성값을 읽어서 changeFilter 함수에 전달
    const selectedFilter = btn.getAttribute('data-filter');
    changeFilter(selectedFilter);
  });
});

// 이전 날짜 버튼: -1일 이동
prevDateBtn.addEventListener('click', function () {
  moveDate(-1);
});

// 다음 날짜 버튼: +1일 이동
nextDateBtn.addEventListener('click', function () {
  moveDate(1);
});

// 이전 주 버튼: -1주 이동
prevWeekBtn.addEventListener('click', function () {
  moveWeek(-1);
});

// 다음 주 버튼: +1주 이동
nextWeekBtn.addEventListener('click', function () {
  moveWeek(1);
});

// 🎯 [달력 추가] 달력 모달창 제어 전용 브라우저 리스너 바인딩
openCalendarBtn.addEventListener('click', openCalendar);
closeCalendarBtn.addEventListener('click', closeCalendar);
calPrevMonthBtn.addEventListener('click', () => moveCalendarMonth(-1));
calNextMonthBtn.addEventListener('click', () => moveCalendarMonth(1));

// [보너스 인터랙션] 흐릿한 투명 배경 오버레이를 클릭해도 자동으로 모달창이 닫히도록 마스킹
document.querySelector('.calendar-overlay').addEventListener('click', closeCalendar);


// ===== 초기 실행 =====
// 페이지 로드 시 로컬스토리지에서 데이터 불러오기 → 날짜 표시 → 화면 그리기
loadTodos();         // 저장된 todos 복원
updateDateDisplay(); // 오늘 날짜 화면에 표시
renderWeekView();    // 주간 뷰 그리기
renderCategorySelect(); // 🎯 켜지자마자 드롭다운 목록 장착!
renderTodos();       // 복원된 데이터로 화면 그리기