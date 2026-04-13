import Component from '../core/Component.js';
import { Router } from '../core/Router.js';
import { filterCandidatesByDistrict } from '../utils/api.js';

export default class BlindPledgeView extends Component {
  setup() {
    const { blindAnswers, coreData, district, selectedElectionId, candidates } = appStore.getState();
    this.catIdx = blindAnswers.length;
    this.currentCat = coreData.categories[this.catIdx];
    
    // 유효성 검사 및 필터링 (개선된 필터 사용)
    this.targetCandidates = filterCandidatesByDistrict(candidates, district, selectedElectionId);

    // 셔플된 공약 리스트 생성
    this.shuffledCands = [...this.targetCandidates].sort(() => Math.random() - 0.5);
  }

  template() {
    if (!this.currentCat) return '';

    const { coreData } = appStore.getState();
    const pledgesHtml = this.shuffledCands.map((cand, idx) => {
      const pledgeText = cand.pledges[this.currentCat.id] || "해당 분야 공약 스크래핑 대기 중";
      return `
        <button class="pledge-card" style="animation-delay: ${idx * 0.08}s" data-cand-id="${cand.id}">
          "${pledgeText}"
        </button>
      `;
    }).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">2단계 : 진짜 공약 고르기 (${this.catIdx + 1} / ${coreData.categories.length})</div>
        <div class="cat-badge"># ${this.currentCat.name} 부문</div>
        <h2 class="q-title" style="font-size:1.3rem;">실제 유력 출마자들의 ${this.currentCat.name} 공약입니다.<br>가장 마음에 드는 것을 고르세요!</h2>
        <p style="font-size:0.9rem">이름은 철저히 가려지며, 선택지 순서는 무작위로 계속 섞입니다.<br>(현재 해당 지역 실제 후보 수: ${this.targetCandidates.length}명)</p>
        <div class="pledge-list mt-2">
          ${pledgesHtml}
        </div>
      </div>
    `;
  }

  setEvent() {
    const { blindAnswers, coreData } = appStore.getState();

    this.target.querySelectorAll('.pledge-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const candId = parseInt(e.currentTarget.dataset.candId);
        const newBlindAnswers = [...blindAnswers, { candId, catId: this.currentCat.id }];
        
        appStore.setState({ blindAnswers: newBlindAnswers });

        if (newBlindAnswers.length < coreData.categories.length) {
          Router.navigate('blindPledge');
        } else {
          Router.navigate('loading');
        }
      });
    });
  }
}
