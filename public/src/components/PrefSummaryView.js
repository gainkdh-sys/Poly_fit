import Component from '../core/Component.js';
import { Router } from '../core/Router.js';
import { appStore } from '../core/Store.js';

export default class PrefSummaryView extends Component {
  template() {
    const { prefAnswers, coreData } = appStore.getState();
    
    // 카테고리별 가중치 합산
    const prefs = coreData.categories.reduce((acc, cat) => {
      acc[cat.id] = 0;
      return acc;
    }, {});
    
    prefAnswers.forEach(ans => {
      if (prefs[ans.category] !== undefined) {
        prefs[ans.category] += ans.score;
      }
    });

    const total = Object.values(prefs).reduce((a, b) => a + b, 0);

    // 높은 가중치 순으로 정렬된 리스트 생성
    const sortedCats = coreData.categories.map(c => ({
      name: c.name,
      pct: total > 0 ? Math.round((prefs[c.id] / total) * 100) : 0
    })).sort((a, b) => b.pct - a.pct);

    const summaryHtml = sortedCats.map(c => `
      <div class="summary-item">
        <div class="summary-label"><span>${c.name}</span><span>${c.pct}%</span></div>
        <div class="summary-bar-bg">
          <div class="summary-bar-fill slide-up" style="width: ${c.pct}%"></div>
        </div>
      </div>
    `).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">가치관 진단 완료</div>
        <h2 class="q-title">나의 정책 중요도 랭킹</h2>
        <p>18문항의 응답을 분석하여 산출된 각 정책 분야별 비중 백분율입니다.</p>
        <div class="summary-list mt-2">
          ${summaryHtml}
        </div>
        <button id="next-btn" class="btn-primary mt-2">이 중요도를 들고 선거 고르러 가기 →</button>
      </div>
    `;
  }

  setEvent() {
    this.target.querySelector('#next-btn').addEventListener('click', () => {
      Router.navigate('electionList');
    });
  }
}
