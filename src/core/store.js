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
  metro: '',       // 선택한 광역자치단체 슬러그 (예: 'gyeongnam')
  district: '',    // 선택한 기초자치단체명 (예: '진주시')
  regionData: null, // 해당 광역 JSON 전체 데이터 (Lazy Load)
  prefAnswers: [], // { category: 'welfare_care', score: 5 }
  selectedElectionId: null,
  blindQueue: [], // { candId: 101, catId: 'welfare_care', pledge: '...' }
  blindAnswers: [], // { candId: 101, catId: 'welfare_care', score: 5, pledge: '...' }
  finalRank: [],
  isResultRevealed: false,
  feedbacks: [],
  communityPosts: [],
  // 공통 데이터 (초기 로딩 시 채워짐)
  coreData: null,
  locations: []    // 광역자치단체 목록 [{ name, slug }]
});
