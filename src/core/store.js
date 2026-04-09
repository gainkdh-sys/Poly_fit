export class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  // 상태 변경 감시자 등록
  subscribe(listener) {
    this.listeners.push(listener);
  }

  // 상태 변경 및 리스너 알림
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  // 현재 상태 가져오기 (읽기 전용 동결)
  getState() {
    return Object.freeze({ ...this.state });
  }
}

// 애플리케이션 전역 상태 인스턴스
export const appStore = new Store({
  view: 'intro',
  district: '',
  prefAnswers: [], // { category: 'welfare', score: 5 }
  selectedElectionId: null,
  blindAnswers: [], // { candId: 101, catId: 'welfare' }
  finalRank: [],
  isResultRevealed: false,
  // 공통 데이터 (초기 로딩 시 채워짐)
  coreData: null,
  candidates: [],
  locations: []
});
