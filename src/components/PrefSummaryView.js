import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';

export default class PrefSummaryView extends Component {
  template() {
    const { prefAnswers, coreData } = appStore.getState();
    
    // 1. 6대 대분류 정의 (고정)
    const categoryGroups = [
      { id: 'welfare', name: '복지' },
      { id: 'edu', name: '교육' },
      { id: 'trans', name: '교통' },
      { id: 'culture', name: '문화' },
      { id: 'housing', name: '주거' },
      { id: 'ind', name: '산업' }
    ];

    // 2. 각 그룹별 점수 합산
    const groupScores = categoryGroups.reduce((acc, g) => {
      acc[g.id] = 0;
      return acc;
    }, {});

    prefAnswers.forEach(ans => {
      const cat = coreData.categories.find(c => c.id === ans.category);
      if (cat && groupScores[cat.group] !== undefined) {
        groupScores[cat.group] += ans.score;
      }
    });

    const total = Object.values(groupScores).reduce((a, b) => a + b, 0);

    // 3. 백분율 계산 및 정렬 (무조건 6개만 노출됨)
    const sortedCats = categoryGroups.map(g => ({
      name: g.name,
      pct: total > 0 ? Math.round((groupScores[g.id] / total) * 100) : 0
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
