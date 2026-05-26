import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';

export default class PreferenceView extends Component {
  setup() {
    const { prefAnswers, coreData } = appStore.getState();
    this.qIdx = prefAnswers.length;
    this.totalQs = coreData.questions.length;
    this.qInfo = coreData.questions[this.qIdx];
  }

  template() {
    if (!this.qInfo) return '';

    const { coreData } = appStore.getState();
    const catName = coreData.categories.find(c => c.id === this.qInfo.category)?.name || '';

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">관심사 중요도 설정 (${this.qIdx + 1} / ${this.totalQs})</div>
        <div class="cat-badge"># ${catName}</div>
        <h2 class="q-title">${this.qInfo.text}</h2>
        <div class="likert-grid mt-2">
          <button class="likert-btn slide-up" data-score="5">매우 중요함</button>
          <button class="likert-btn slide-up" data-score="4">중요함</button>
          <button class="likert-btn slide-up" data-score="3">보통임</button>
          <button class="likert-btn slide-up" data-score="2">덜 중요함</button>
          <button class="likert-btn slide-up" data-score="1">전혀 중요하지 않음</button>
        </div>
        <button id="quick-complete-btn" class="btn-ghost compact-btn mt-2" type="button">가치관 선택 스킵하기</button>
      </div>
    `;
  }

  setEvent() {
    const { coreData, prefAnswers } = appStore.getState();

    this.target.querySelectorAll('.likert-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const score = parseInt(e.target.dataset.score);
        const newAnswers = [...prefAnswers, { category: this.qInfo.category, score }];
        
        appStore.setState({ prefAnswers: newAnswers });

        if (newAnswers.length < this.totalQs) {
          Router.navigate('preference');
        } else {
          Router.navigate('prefSummary');
        }
      });
    });

    this.target.querySelector('#quick-complete-btn')?.addEventListener('click', () => {
      const neutralAnswers = coreData.questions.slice(this.qIdx).map(question => ({
        category: question.category,
        score: 3
      }));

      appStore.setState({ prefAnswers: [...prefAnswers, ...neutralAnswers] });
      Router.navigate('prefSummary');
    });
  }
}
