/**
 * 날짜 포맷팅 유틸리티 (YYYY-MM-DD)
 * @param {Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 한국어 날짜 포맷팅 (YYYY년 M월 D일 (요일))
 * @param {Date} date 
 * @returns {string}
 */
export const formatDateKorean = (date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
};

/**
 * 이번 주 월요일 구하기
 * @param {Date} date 
 * @returns {Date}
 */
export const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};
