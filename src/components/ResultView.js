import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';
import { createCampaignSearchUrl, getElectionDisplayName } from '../utils/elections.js';
import { escapeHtml } from '../utils/helpers.js';
import {
  getPartyAvatarUrl,
  resolveCandidateImage,
  resolveCandidatePhotoMeta
} from '../utils/photos.js';

const FEEDBACK_FORM_URL = 'https://naver.me/GFssGifo';

const SCORE_LABELS = {
  5: '매우 동의',
  4: '동의',
  3: '보통',
  2: '비동의',
  1: '매우 비동의'
};

export default class ResultView extends Component {
  getCandidateAnswers(candidateId) {
    const { blindAnswers } = appStore.getState();

    return blindAnswers
      .filter(answer => answer.candId === candidateId)
      .sort((a, b) => b.score - a.score);
  }

  renderPledgeRecap(candidateId, limit = 5) {
    const answers = this.getCandidateAnswers(candidateId).slice(0, limit);

    if (answers.length === 0) {
      return '<p class="empty-copy">평가된 공약이 없습니다.</p>';
    }

    return answers.map(answer => `
      <li class="policy-recap-item">
        <div class="policy-recap-meta">
          <span>${escapeHtml([answer.catName, answer.sourceLabel].filter(Boolean).join(' · '))}</span>
          <strong>${SCORE_LABELS[answer.score] || '평가 완료'}</strong>
        </div>
        <p>${escapeHtml(answer.pledge)}</p>
      </li>
    `).join('');
  }

  renderCandidateRank(candidate, idx) {
    const safeName = escapeHtml(candidate.name);
    const safeParty = escapeHtml(candidate.party);
    const safeBio = escapeHtml(candidate.bio || '');
    const campaignUrl = candidate.campaignUrl || createCampaignSearchUrl(candidate);
    const { candidatePhotos } = appStore.getState();
    const imageUrl = resolveCandidateImage(candidate, candidatePhotos);
    const photoMeta = resolveCandidatePhotoMeta(candidate, candidatePhotos);

    return `
      <article class="rank-card slide-up" style="animation-delay:${idx * 0.05}s">
        <div class="rank-main">
          <img src="${imageUrl}" alt="${safeName} 프로필" class="other-profile" onerror="this.src='${getPartyAvatarUrl(candidate)}'">
          <div class="other-info">
            <span class="rank-eyebrow">순위 ${idx + 1}</span>
            <span class="other-name">${safeName}</span>
            <span class="other-party">${safeParty}</span>
          </div>
          <div class="other-rate">${candidate.matchRate}%</div>
        </div>
        <div class="match-meter" aria-hidden="true">
          <div style="width:${candidate.matchRate}%"></div>
        </div>
        <p class="rank-bio">${safeBio}</p>
        ${photoMeta ? `<p class="photo-credit">${escapeHtml(photoMeta.license)} · ${escapeHtml(photoMeta.attribution || photoMeta.source)}</p>` : ''}
        <a class="text-link" href="${campaignUrl}" target="_blank" rel="noopener">캠페인 정보 보기</a>
      </article>
    `;
  }

  template() {
    const {
      finalRank,
      selectedElectionId,
      selectedConstituency,
      isResultRevealed
    } = appStore.getState();
    const elecName = getElectionDisplayName(selectedElectionId, selectedConstituency);
    const safeElecName = escapeHtml(elecName);

    if (finalRank.length === 0) {
      return `
        <div class="view-wrapper center-all mt-2">
          <h2>후보가 없습니다</h2>
          <button id="restart-btn" class="btn-primary mt-2">처음으로</button>
        </div>
      `;
    }

    const topC = finalRank[0];

    if (!isResultRevealed) {
      return `
        <div class="view-wrapper slide-up result-view center-all">
          <h2 style="margin-top:2rem;">정책 일치율 계산 완료</h2>
          <p>${safeElecName} 후보들의 공약 평가를 바탕으로 최종 순위가 도출되었습니다.</p>
          <div class="result-hidden mt-2">
            <div class="result-lock-icon" aria-hidden="true">잠금</div>
            <h3 style="color:var(--text); margin-bottom:1.5rem;">가장 높은 정책 핏 후보를 확인하세요</h3>
            <button class="btn-primary" id="btn-reveal">결과 공개하기</button>
          </div>
        </div>
      `;
    }

    const safeTopName = escapeHtml(topC.name);
    const campaignUrl = topC.campaignUrl || createCampaignSearchUrl(topC);
    const { candidatePhotos } = appStore.getState();
    const topImageUrl = resolveCandidateImage(topC, candidatePhotos);
    const topPhotoMeta = resolveCandidatePhotoMeta(topC, candidatePhotos);
    const rankHtml = finalRank.map((candidate, idx) => this.renderCandidateRank(candidate, idx)).join('');

    return `
      <div class="view-wrapper slide-up result-view">
        <div class="match-header fade-in">
          <div class="step-indicator">${safeElecName} 매칭 결과</div>
          <h2>나와 가장 가까운<br>정책 후보</h2>
        </div>

        <section class="result-card mt-2 slide-up">
          <div class="match-rate">정책 일치율 <span>${topC.matchRate}%</span></div>
          <div class="result-card-header">
            <img src="${topImageUrl}" alt="${safeTopName} 프로필" class="cand-profile" onerror="this.src='${getPartyAvatarUrl(topC)}'">
            <div class="party-badge">${escapeHtml(topC.party)}</div>
            <h1 class="cand-name">${safeTopName}</h1>
            <p class="cand-bio">${escapeHtml(topC.bio || '')}</p>
            ${topPhotoMeta ? `<p class="photo-credit">${escapeHtml(topPhotoMeta.license)} · ${escapeHtml(topPhotoMeta.attribution || topPhotoMeta.source)}</p>` : ''}
          </div>
          <p class="candidate-desc">"${escapeHtml(topC.desc || '상세 공약 정보를 확인해 주세요.')}"</p>
          <a class="btn-link" href="${campaignUrl}" target="_blank" rel="noopener">캠페인 정보 보기</a>
        </section>

        <section class="result-section">
          <h3>매칭에 활용된 주요 공약</h3>
          <ul class="policy-recap-list">
            ${this.renderPledgeRecap(topC.id)}
          </ul>
        </section>

        <section class="result-section">
          <h3>후보자별 정책 일치율</h3>
          <div class="rank-list">
            ${rankHtml}
          </div>
        </section>

        <section class="feedback-panel">
          <a id="feedback-submit"
             class="btn-secondary compact-btn feedback-link"
             href="${FEEDBACK_FORM_URL}"
             target="_blank"
             rel="noopener noreferrer"
             role="button">피드백 제출</a>
        </section>

        <div class="slide-up result-actions">
          <button id="try-other-btn" class="btn-primary">동일 구역의 다른 선거 평가</button>
          <button id="restart-btn" class="btn-secondary">처음부터 다시하기</button>
        </div>
      </div>
    `;
  }

  setEvent() {
    this.target.querySelector('#restart-btn')?.addEventListener('click', () => {
      location.reload();
    });

    this.target.querySelector('#btn-reveal')?.addEventListener('click', () => {
      appStore.setState({ isResultRevealed: true });
    });

    this.target.querySelector('#try-other-btn')?.addEventListener('click', () => {
      appStore.setState({
        selectedElectionId: null,
        selectedConstituency: '',
        blindAnswers: [],
        blindQueue: [],
        finalRank: [],
        isResultRevealed: false
      });
      Router.navigate('electionList');
    });

  }
}
