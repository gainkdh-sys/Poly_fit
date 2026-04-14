import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';

export default class BlindPledgeView extends Component {
  setup() {
    const { blindAnswers, coreData, district, selectedElectionId, candidates } = appStore.getState();
    this.catIdx = blindAnswers.length;
    this.currentCat = coreData.categories[this.catIdx];
    
    // 유효성 검사 및 필터링
    this.targetCandidates = candidates.filter(c => {
      return c.electionType === selectedElectionId && 
             c.region.some(r => district.includes(r));
    });

    // 셔플된 공약 리스트 생성
    this.shuffledCands = [...this.targetCandidates].sort(() => Math.random() - 0.5);
  }

  template() {
    if (!this.currentCat) return '';

    const { coreData, blindAnswers } = appStore.getState();
    
    // 현재 그룹의 몇 번째 질문인지 계산
    const sameGroupCats = coreData.categories.filter(c => c.group === this.currentCat.group);
    const qNumInGroup = sameGroupCats.findIndex(c => c.id === this.currentCat.id) + 1;

    const pledgesHtml = this.shuffledCands.map((cand, idx) => {
      // 1. 대분류 기반 원본 공약 가져오기
      const rawPledge = cand.pledges[this.currentCat.id] || cand.pledges[this.currentCat.group] || "해당 분야 공약 스크래핑 대기 중";
      
      // 2. 지능형 분할 로직 (Smart Splitting)
      // 마운트된 문장이나 '및', '|' 기준으로 분리
      const parts = rawPledge.split(/[.및|]/).map(s => s.trim()).filter(s => s.length > 5);
      
      let displayPledge = rawPledge;
      if (parts.length >= 2) {
        // 그룹 내 순서에 따라 분할된 문구 매칭 (첫 번째 질문 -> 앞부분, 두 번째 -> 뒷부분)
        const partIdx = (qNumInGroup - 1) % parts.length;
        displayPledge = parts[partIdx];
        
        // 너무 짧으면 다음 파트와 합침
        if (displayPledge.length < 10 && parts[partIdx + 1]) {
          displayPledge += " " + parts[partIdx + 1];
        }
      }

      return `
        <button class="pledge-card" style="animation-delay: ${idx * 0.08}s" data-cand-id="${cand.id}">
          "${displayPledge}"
        </button>
      `;
    }).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">2단계 : 진짜 공약 고르기 (${this.catIdx + 1} / ${coreData.categories.length})</div>
        <div class="cat-badge"># ${this.currentCat.name} 부문 (${qNumInGroup}/${sameGroupCats.length})</div>
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
