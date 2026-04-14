/**
 * 유틸리티 헬퍼 함수들
 * XSS 방지, 성능 최적화, 포맷팅 등
 */

/**
 * HTML 이스케이핑 (XSS 방지)
 * 사용자 입력이나 외부 데이터를 innerHTML로 삽입하기 전에 호출
 * 
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} XSS-safe HTML 텍스트
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 디바운싱 (중복 호출 방지)
 * 입력 이벤트, 검색 요청 등에 사용하여 불필요한 호출 방지
 * 
 * @param {Function} func - 실행할 함수
 * @param {number} delay - 디바운스 지연 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 * 
 * @example
 * const debouncedSearch = debounce((query) => {
 *   search(query);
 * }, 300);
 * 
 * input.addEventListener('input', (e) => {
 *   debouncedSearch(e.target.value);
 * });
 */
export function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 쓰로틀링 (최소 간격 유지)
 * 스크롤, 리사이즈 이벤트처럼 빈번히 발생하는 이벤트에 사용
 * 
 * @param {Function} func - 실행할 함수
 * @param {number} interval - 최소 실행 간격 (밀리초)
 * @returns {Function} 쓰로틀된 함수
 */
export function throttle(func, interval) {
  let lastCallTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastCallTime >= interval) {
      lastCallTime = now;
      func(...args);
    }
  };
}

/**
 * 배열 중복 제거
 * @param {Array} arr - 배열
 * @returns {Array} 중복이 제거된 배열
 */
export function removeDuplicates(arr) {
  return [...new Set(arr)];
}

/**
 * 숫자를 문자열로 포맷 (천 단위 구분)
 * @param {number} num - 숫자
 * @returns {string} 포맷된 문자열
 * 
 * @example
 * formatNumber(1000) // "1,000"
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 백분율 포맷
 * @param {number} num - 0~100 범위의 숫자
 * @param {number} decimals - 소수점 자리수 (기본값: 0)
 * @returns {string} 포맷된 백분율 문자열
 * 
 * @example
 * formatPercentage(85.6) // "86%"
 * formatPercentage(85.6, 1) // "85.6%"
 */
export function formatPercentage(num, decimals = 0) {
  return `${num.toFixed(decimals)}%`;
}

/**
 * 조건부 CSS 클래스 문자열 생성
 * @param {Object} classMap - {className: boolean} 객체
 * @returns {string} 조건을 만족하는 클래스들의 공백 구분 문자열
 * 
 * @example
 * classNameIf({ 'active': isActive, 'disabled': isDisabled })
 * // 'active' (isActive가 true, isDisabled가 false인 경우)
 */
export function classNameIf(classMap) {
  return Object.entries(classMap)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(' ');
}

/**
 * 딜레이 (Promise 기반)
 * @param {number} ms - 지연 시간 (밀리초)
 * @returns {Promise<void>}
 * 
 * @example
 * await delay(1000);
 * console.log('1초 후 실행');
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 로컬 스토리지 헬퍼: 객체 저장
 * @param {string} key - 저장 키
 * @param {Object} value - 저장할 값
 */
export function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save to localStorage: ${key}`, error);
  }
}

/**
 * 로컬 스토리지 헬퍼: 객체 읽기
 * @param {string} key - 읽을 키
 * @param {*} defaultValue - 키가 없을 때 기본값
 * @returns {*} 저장된 값 또는 기본값
 */
export function getFromLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to read from localStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * 로컬 스토리지에서 삭제
 * @param {string} key - 삭제할 키
 */
export function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove from localStorage: ${key}`, error);
  }
}

/**
 * 최소값과 최대값 사이의 숫자 강제 변환
 * @param {number} value - 값
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number} min과 max 사이의 값
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 배열을 청크(묶음)로 나누기
 * @param {Array} arr - 배열
 * @param {number} chunkSize - 청크 크기
 * @returns {Array<Array>} 청크로 나뉜 배열들의 배열
 * 
 * @example
 * chunkArray([1,2,3,4,5], 2) // [[1,2], [3,4], [5]]
 */
export function chunkArray(arr, chunkSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

/**
 * 객체 깊은 복사
 * @param {Object} obj - 복사할 객체
 * @returns {Object} 깊은 복사본
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 유효성 검사 헬퍼: 빈 값 확인
 * @param {*} value - 확인할 값
 * @returns {boolean} 빈 값이면 true
 */
export function isEmpty(value) {
  if (!value) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 유효성 검사 헬퍼: 이메일 형식
 * @param {string} email - 이메일 주소
 * @returns {boolean} 유효한 이메일 형식이면 true
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 해시테이블 기반 성능 최적화 lookup
 * 대량 후보자 중 특정 ID 찾기 등에 사용
 * @param {Array} arr - 배열 [{id, ...}, ...]
 * @param {string} idField - ID 필드명
 * @returns {Map} id → object 매핑
 */
export function createLookupMap(arr, idField = 'id') {
  const map = new Map();
  arr.forEach(item => {
    map.set(item[idField], item);
  });
  return map;
}

/**
 * 헬퍼 사용 예시:
 * 
 * // XSS 방지
 * element.innerHTML = escapeHtml(userInput);
 * 
 * // 검색 디바운싱
 * const debouncedSearch = debounce((query) => performSearch(query), 300);
 * 
 * // 조건부 스타일  
 * element.className = classNameIf({
 *   'btn': true,
 *   'btn-primary': isPrimary,
 *   'btn-disabled': isDisabled
 * });
 * 
 * // 로컬 스토리지
 * saveToLocalStorage('preferences', userPrefs);
 * const prefs = getFromLocalStorage('preferences', {});
 */
