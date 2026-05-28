import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';
import {
  buildBlindEvaluationQueue,
  getCandidatesForElection,
  getElectionDisplayName
} from '../utils/elections.js';
import { escapeHtml } from '../utils/helpers.js';

const AGREEMENT_OPTIONS = [
  { score: 5, label: '매우 동의' },
  { score: 4, label: '동의' },
  { score: 3, label: '보통' },
  { score: 2, label: '비동의' },
  { score: 1, label: '매우 비동의' }
];

export default class BlindPledgeView extends Component {
  setup() {
    const {
      blindAnswers,
      blindQueue,
      coreData,
      district,
      selectedElectionId,
      selectedConstituency,
      regionData,
      metro,
      partyPolicyFallbacks
    } = appStore.getState();

    this.answerIdx = blindAnswers.length;
    this.queue = blindQueue;

    if ((!this.queue || this.queue.length === 0) && coreData && regionData && selectedElectionId) {
      const candidates = getCandidatesForElection(regionData, district, selectedElectionId, selectedConstituency);
      this.queue = buildBlindEvaluationQueue(coreData, candidates, {
        metro,
        district,
        partyPolicyFallbacks
      });
    }

    this.currentItem = this.queue?.[this.answerIdx] || null;

    if (!this.currentItem) {
      Router.navigate('loading');
    }
  }

  template() {
    if (!this.currentItem) return '';

    const { selectedElectionId, selectedConstituency } = appStore.getState();
    const electionName = getElectionDisplayName(selectedElectionId, selectedConstituency);
    const progressPct = Math.round((this.answerIdx / this.queue.length) * 100);
    const mergedLabel = this.currentItem.mergedCount > 1 ? ` · 후보 ${this.currentItem.mergedCount}명 공통` : '';
    const sourceLabel = `${this.currentItem.sourceLabel || '익명 후보 공약'}${mergedLabel}`;
    const agreementHtml = AGREEMENT_OPTIONS.map((option, idx) => `
      <button class="likert-btn agreement-btn slide-up"
              style="animation-delay: ${idx * 0.04}s"
              data-score="${option.score}">
        ${option.label}
      </button>
    `).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">블라인드 공약 평가 (${this.answerIdx + 1} / ${this.queue.length})</div>
        <div class="progress-rail" aria-hidden="true">
          <div class="progress-fill" style="width:${progressPct}%"></div>
        </div>
        <div class="cat-badge"># ${this.currentItem.catName}</div>
        <p class="blind-election-label">${escapeHtml(electionName)}</p>
        <div class="blind-policy-card">
          <div class="blind-chip">${escapeHtml(sourceLabel)}</div>
          <h2 class="q-title">${escapeHtml(this.currentItem.pledge)}</h2>
        </div>
        <p style="font-size:0.95rem">이 공약이 내 지역 선택 기준과 얼마나 잘 맞는지 평가해 주세요.</p>
        <div class="likert-grid agreement-grid mt-2">
          ${agreementHtml}
        </div>
      </div>
    `;
  }

  setEvent() {
    const { blindAnswers } = appStore.getState();

    this.target.querySelectorAll('.agreement-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const score = parseInt(e.currentTarget.dataset.score, 10);
        const candIds = this.currentItem.candIds || [this.currentItem.candId];
        const newBlindAnswers = [
          ...blindAnswers,
          ...candIds.map(candId => ({
            candId,
            catId: this.currentItem.catId,
            catName: this.currentItem.catName,
            group: this.currentItem.group,
            pledge: this.currentItem.pledge,
            sourceLabel: this.currentItem.sourceLabel,
            score
          }))
        ];

        appStore.setState({ blindQueue: this.queue, blindAnswers: newBlindAnswers });

        if (newBlindAnswers.length < this.queue.length) {
          Router.navigate('blindPledge');
        } else {
          Router.navigate('loading');
        }
      });
    });
  }
}
