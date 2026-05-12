import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';
import { calculateMatch } from '../utils/matcher.js';
import { getCandidatesForElection } from '../utils/elections.js';

export default class LoadingView extends Component {
  setup() {
    const { prefAnswers, blindAnswers, regionData, selectedElectionId, district, coreData } = appStore.getState();

    // 엣지 케이스: 필수 데이터 누락 시 결과 없이 이전 화면으로
    if (!regionData || !selectedElectionId || !coreData) {
      console.error('[LoadingView] 필수 상태 누락:', { regionData: !!regionData, selectedElectionId, coreData: !!coreData });
      setTimeout(() => Router.navigate('electionList'), 500);
      return;
    }

    const targetCandidates = getCandidatesForElection(regionData, district, selectedElectionId);

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
        <h2 style="font-size: 1.5rem; margin-top: 1rem;">정책 일치율을 계산 중입니다</h2>
        <p style="font-size:0.95rem;">관심사 중요도와 블라인드 공약 동의도를 조합하고 있습니다.</p>
      </div>
    `;
  }
}
