import { appStore } from './core/Store.js';
import { Router } from './core/Router.js';
import { fetchAppData } from './utils/api.js';

// 개별 컴포넌트 임포트
import IntroView from './components/IntroView.js';
import DistrictView from './components/DistrictView.js';
import PreferenceView from './components/PreferenceView.js';
import PrefSummaryView from './components/PrefSummaryView.js';
import ElectionListView from './components/ElectionListView.js';
import BlindPledgeView from './components/BlindPledgeView.js';
import LoadingView from './components/LoadingView.js';
import ResultView from './components/ResultView.js';

const DOM = {
  app: document.getElementById('app')
};

// 뷰 매핑 객체
const viewMap = {
  intro: IntroView,
  district: DistrictView,
  preference: PreferenceView,
  prefSummary: PrefSummaryView,
  electionList: ElectionListView,
  blindPledge: BlindPledgeView,
  loading: LoadingView,
  result: ResultView
};

/**
 * 전역 앱 컨트롤러
 */
const App = {
  async init() {
    // 중복 초기화 방지
    if (this._initialized) return;
    this._initialized = true;

    // 1. 초기 데이터 로드
    const data = await fetchAppData();
    if (!data) return;

    // 2. 상태 초기화
    appStore.setState({
      coreData: data.core,
      candidates: data.candidates,
      locations: data.locations
    });

    // 3. 상태 변경 감시 (View 전환 시 렌더링)
    appStore.subscribe((state) => {
      this.render(state.view);
    });

    // 4. 초기 화면 렌더링
    this.render(appStore.getState().view);
  },

  render(viewName) {
    DOM.app.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'container fade-in';

    // 네비게이션 헤더 렌더링 (intro, loading 제외)
    if (!['intro', 'loading'].includes(viewName)) {
      const header = document.createElement('div');
      header.className = 'nav-header';
      const backBtn = document.createElement('button');
      backBtn.className = 'btn-back';
      backBtn.innerHTML = '<i>←</i> 이전으로';
      backBtn.onclick = () => Router.handleBack();
      header.appendChild(backBtn);
      DOM.app.appendChild(header);
    }

    // 해당 뷰 컴포넌트 인스턴스 생성 및 마운트
    const ViewComponent = viewMap[viewName];
    if (ViewComponent) {
      console.log(`[App] Rendering view: ${viewName}`);
      new ViewComponent(container);
    } else {
      console.warn(`[App] View component not found: ${viewName}`);
    }

    DOM.app.appendChild(container);
  }
};

// 앱 가동 (DOM 로드 후 안전하게 실행)
document.addEventListener('DOMContentLoaded', () => {
  console.log('[App] DOMContentLoaded. Initializing app...');
  App.init().catch(err => {
    console.error('[App] Critical Initialization Error:', err);
  });
});
