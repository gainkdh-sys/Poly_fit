import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';
import { calculatePreferencePercentages } from '../utils/preferences.js';

export default class PrefSummaryView extends Component {
  template() {
    const { prefAnswers, coreData } = appStore.getState();

    const sortedCats = calculatePreferencePercentages(prefAnswers, coreData)
      .sort((a, b) => b.pct - a.pct);

    const summaryHtml = sortedCats.map(c => `
      <div class="summary-item">
        <div class="summary-label"><span>${c.name}</span><span>${c.pctLabel}</span></div>
        <div class="summary-bar-bg">
          <div class="summary-bar-fill slide-up" style="width: ${c.pct}%"></div>
        </div>
      </div>
    `).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">가치관 진단 완료</div>
        <h2 class="q-title">나의 정책 중요도 랭킹</h2>
        <p>문항 수 차이를 보정해 산출한 정책 분야별 비중입니다.</p>
        <div class="summary-list mt-2">
          ${summaryHtml}
        </div>
        <button id="next-btn" class="btn-primary mt-2">이 중요도로 선거 유형 고르기</button>
      </div>
    `;
  }

  setEvent() {
    this.target.querySelector('#next-btn').addEventListener('click', () => {
      Router.navigate('electionList');
    });
  }
}
