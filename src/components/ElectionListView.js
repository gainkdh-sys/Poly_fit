import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';
import {
  buildBlindEvaluationQueue,
  getAvailableElections,
  getCandidatesForElection
} from '../utils/elections.js';

export default class ElectionListView extends Component {
  setup() {
    const { regionData, district } = appStore.getState();
    this.availableElections = getAvailableElections(regionData, district);
  }

  template() {
    const { district, regionData } = appStore.getState();
    const metroName = regionData?.metro || '';

    if (this.availableElections.length === 0) {
      return `
        <div class="view-wrapper center-all mt-2">
          <h2>후보 데이터가 없습니다</h2>
          <p>${metroName} ${district}의 선거 데이터가 아직 준비되지 않았습니다.</p>
          <button id="back-btn" class="btn-secondary mt-2">지역 다시 선택</button>
        </div>
      `;
    }

    const electionsHtml = this.availableElections.map((elec, idx) => `
      <button class="election-card slide-up" style="animation-delay: ${idx * 0.06}s" data-id="${elec.id}">
        <div>
          <div class="election-title">${elec.name}</div>
          <div class="election-desc">${elec.desc} · 후보 ${elec.count}명</div>
        </div>
        <div class="election-arrow">›</div>
      </button>
    `).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">${metroName} ${district}</div>
        <h2>평가할 선거 유형을<br>선택하세요</h2>
        <p>선택한 선거의 후보자 이름과 정당은 평가가 끝날 때까지 가려집니다.</p>
        <div class="election-grid mt-2">
          ${electionsHtml}
        </div>
      </div>
    `;
  }

  setEvent() {
    this.target.querySelector('#back-btn')?.addEventListener('click', () => {
      Router.navigate('district');
    });

    this.target.querySelectorAll('.election-card[data-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        const elecId = e.currentTarget.dataset.id;
        const { coreData, regionData, district } = appStore.getState();
        const candidates = getCandidatesForElection(regionData, district, elecId);
        const blindQueue = buildBlindEvaluationQueue(coreData, candidates);

        appStore.setState({
          selectedElectionId: elecId,
          blindQueue,
          blindAnswers: [],
          finalRank: [],
          isResultRevealed: false
        });
        Router.navigate('blindPledge');
      });
    });
  }
}
