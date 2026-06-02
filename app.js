// ===== 데이터 저장소 =====
// todos 배열: 모든 Todo 항목을 저장하는 배열
// 각 항목은 { id, text, completed, date } 형태의 객체
let todos = [];

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

// querySelectorAll(): 해당 선택자에 매칭되는 모든 요소를 NodeList로 가져옴
const filterBtns = document.querySelectorAll('.filter-btn');


// ===== 로컬스토리지 저장 =====
// todos 배열이 바뀔 때마다 이 함수를 호출해서 브라우저 창고에 저장
function saveTodos() {
  // JSON.stringify: 배열/객체 → 문자열로 변환 (로컬스토리지는 문자열만 저장 가능)
  localStorage.setItem('todos', JSON.stringify(todos));
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


// ===== 이번 주 월요일 날짜 계산 (새로 추가) =====
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


// ===== 주간 뷰 렌더링 (새로 추가) =====
// weekBaseDate 기준으로 해당 주 월~일을 화면에 그림
function renderWeekView() {
  // 기준 날짜가 속한 주의 월요일 구하기
  const monday = getMonday(weekBaseDate);
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


// ===== 주 이동 (새로 추가) =====
// weeks: 1이면 다음 주, -1이면 이전 주
function moveWeek(weeks) {
  // 7일 단위로 weekBaseDate 이동
  weekBaseDate.setDate(weekBaseDate.getDate() + weeks * 7);
  renderWeekView(); // 주간 뷰 다시 그리기
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

  // 새 Todo 객체 생성
  const newTodo = {
    id: generateId(),               // 고유 ID
    text: text,                     // 입력한 텍스트
    completed: false,               // 처음엔 완료되지 않은 상태
    date: formatDate(selectedDate), // 현재 선택된 날짜를 문자열로 저장
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
function enableEdit(targetId, currentText) {
  // 해당 id를 가진 li 요소 찾기
  const listItem = document.querySelector(`[data-id="${targetId}"]`);

  // 기존 텍스트 span을 input으로 교체
  const textSpan = listItem.querySelector('.todo-text');
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = currentText;
  listItem.replaceChild(editInput, textSpan);

  // 버튼 그룹을 "저장" 버튼으로 교체
  const btnGroup = listItem.querySelector('.btn-group');
  btnGroup.innerHTML = `
    <button class="btn btn-save" onclick="saveEdit(${targetId})">저장</button>
  `;

  // 수정 input에 포커스 이동
  editInput.focus();
}


// ===== Todo 수정 저장 =====
function saveEdit(targetId) {
  const listItem = document.querySelector(`[data-id="${targetId}"]`);
  const editInput = listItem.querySelector('.edit-input');
  const newText = editInput.value.trim();

  // 빈 값이면 저장하지 않고 원래대로 복원
  if (newText === '') {
    renderTodos();
    return;
  }

  // 해당 id의 Todo 텍스트 업데이트
  todos = todos.map(todo => {
    if (todo.id === targetId) {
      return { ...todo, text: newText };
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
      emptyState.querySelector('p').textContent = '✅ 진행 중인 할 일이 없어요!';
    } else if (currentFilter === 'completed') {
      emptyState.querySelector('p').textContent = '📋 완료된 할 일이 없어요!';
    } else {
      emptyState.querySelector('p').textContent = '📋 할 일이 없어요. 새로운 할 일을 추가해보세요!';
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

    // li 내부 HTML 구성
    // 완료 여부에 따라 버튼 텍스트 변경
    li.innerHTML = `
      <span class="todo-text">${todo.text}</span>
      <div class="btn-group">
        <button class="btn btn-complete" onclick="toggleComplete(${todo.id})">
          ${todo.completed ? '되돌리기' : '완료'}
        </button>
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


// ===== 초기 실행 =====
// 페이지 로드 시 로컬스토리지에서 데이터 불러오기 → 날짜 표시 → 화면 그리기
loadTodos();         // 저장된 todos 복원
updateDateDisplay(); // 오늘 날짜 화면에 표시
renderWeekView();    // 주간 뷰 그리기
renderTodos();       // 복원된 데이터로 화면 그리기