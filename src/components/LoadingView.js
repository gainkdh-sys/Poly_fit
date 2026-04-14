import Component from '../core/Component.js';
import { Router } from '../core/Router.js';
import { appStore } from '../core/Store.js';
import { calculateMatch } from '../utils/matcher.js';

export default class LoadingView extends Component {
  setup() {
    const { prefAnswers, blindAnswers, candidates, selectedElectionId, district } = appStore.getState();
    
    // 해당 선거구 후보자 필터링
    const targetCandidates = candidates.filter(c => {
      return c.electionType === selectedElectionId && 
             c.region.some(r => district.includes(r));
    });

    // 매칭 알고리즘 가동
    const finalRank = calculateMatch(prefAnswers, blindAnswers, targetCandidates, coreData);

    // 가상 가동 시간 부여 후 결과창 이동
    setTimeout(() => {
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
