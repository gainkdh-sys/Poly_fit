import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';
import { calculateMatch } from '../utils/matcher.js';

export default class LoadingView extends Component {
  setup() {
    const { prefAnswers, blindAnswers, regionData, selectedElectionId, district, coreData } = appStore.getState();

    // 엣지 케이스: 필수 데이터 누락 시 결과 없이 이전 화면으로
    if (!regionData || !selectedElectionId || !coreData) {
      console.error('[LoadingView] 필수 상태 누락:', { regionData: !!regionData, selectedElectionId, coreData: !!coreData });
      setTimeout(() => Router.navigate('electionList'), 500);
      return;
    }

    // 선거 종류별 후보 목록 추출
    let targetCandidates = [];
    if (selectedElectionId === 'governor') {
      targetCandidates = regionData.governor || [];
    } else if (selectedElectionId === 'superintendent') {
      targetCandidates = regionData.superintendent || [];
    } else {
      // 기초 단위 선거 — 선택된 district에서 추출
      const distData = (regionData.districts || {})[district] || {};
      targetCandidates = distData[selectedElectionId] || [];
    }

    // 엣지 케이스: 후보가 없는 경우
    if (targetCandidates.length === 0) {
      console.warn('[LoadingView] 후보 없음 → electionList로 이동');
      setTimeout(() => Router.navigate('electionList'), 800);
      return;
    }

    // 매칭 알고리즘 실행 후 결과 화면으로 이동
    setTimeout(() => {
      const finalRank = calculateMatch(prefAnswers, blindAnswers, targetCandidates, coreData);
      appStore.setState({ finalRank });
      Router.navigate('result');
    }, 2200);
  }

  template() {
    return `
      <div class="view-wrapper center-all fade-in mt-2">
        <br><br><br><div class="loader"></div>
        <h2 style="font-size: 1.5rem; margin-top: 1rem;">최종 매칭 알고리즘 가동 중...</h2>
        <p style="font-size:0.95rem;">'가치관 가중치'와 '선택한 블라인드 공약'을<br>조합하여 입체적으로 연산하고 있습니다.</p>
      </div>
    `;
  }
}
