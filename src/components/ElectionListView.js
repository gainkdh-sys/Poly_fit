import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';
import {
  buildBlindEvaluationQueue,
  getAvailableElections,
  getCandidatesForElection,
  getConstituencyDetail
} from '../utils/elections.js';
import { escapeHtml } from '../utils/helpers.js';

function normalizeText(value) {
  return String(value || '').replace(/\s/g, '').toLowerCase();
}

export default class ElectionListView extends Component {
  setup() {
    const { constituencyAreas, metro, regionData, district } = appStore.getState();
    this.availableElections = getAvailableElections(regionData, district)
      .map((election) => ({
        ...election,
        areaDetail: getConstituencyDetail(
          constituencyAreas,
          metro,
          district,
          election.id,
          election.constituency
        )
      }));
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

    const electionsHtml = this.availableElections.map((elec, idx) => {
      const constituencyHtml = elec.constituency
        ? `<span class="election-chip">${escapeHtml(elec.constituency)}</span>`
        : '';
      const areaHtml = elec.constituency
        ? `<div class="election-area">${elec.areaDetail?.areas
          ? `<strong>관할</strong> ${escapeHtml(elec.areaDetail.areas)}`
          : '<strong>관할</strong> 선관위 선거구역 정보 확인 중'}</div>`
        : '';
      const seatsText = /\d/.test(elec.areaDetail?.seats || '')
        ? ` · 정수 ${elec.areaDetail.seats}명`
        : '';
      const desc = elec.constituency
        ? `${elec.desc} · 이 선거구 후보 ${elec.count}명${seatsText}`
        : `${elec.desc} · 후보 ${elec.count}명`;
      const searchText = [
        elec.name,
        elec.constituency,
        elec.areaDetail?.areas,
        elec.areaDetail?.localName,
        elec.areaDetail?.committee
      ].filter(Boolean).join(' ');

      return `
      <button class="election-card slide-up" style="animation-delay: ${idx * 0.06}s" data-index="${idx}" data-search-text="${escapeHtml(searchText)}">
        <div>
          <div class="election-title">${escapeHtml(elec.name)}</div>
          ${constituencyHtml}
          <div class="election-desc">${escapeHtml(desc)}</div>
          ${areaHtml}
        </div>
        <div class="election-arrow">›</div>
      </button>
    `;
    }).join('');

    const constituencySearchHtml = this.availableElections.some(elec => elec.constituency)
      ? `
        <div class="district-tools">
          <div class="search-container">
            <input id="constituency-search" class="search-input" type="search" placeholder="동·읍·면으로 선거구 찾기" autocomplete="off">
          </div>
        </div>
      `
      : '';

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">${metroName} ${district}</div>
        <h2>평가할 선거와<br>선거구를 선택하세요</h2>
        <p>의원 선거는 실제 선거구 단위로 나누어 보여드립니다. 후보자 이름과 정당은 평가가 끝날 때까지 가려집니다.</p>
        ${constituencySearchHtml}
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

    this.target.querySelector('#constituency-search')?.addEventListener('input', (e) => {
      const query = normalizeText(e.target.value);

      this.target.querySelectorAll('.election-card[data-search-text]').forEach((card) => {
        const searchable = normalizeText(card.dataset.searchText || '');
        card.hidden = query.length > 0 && !searchable.includes(query);
      });
    });

    this.target.querySelectorAll('.election-card[data-index]').forEach(card => {
      card.addEventListener('click', (e) => {
        const electionIndex = Number(e.currentTarget.dataset.index);
        const selectedElection = this.availableElections[electionIndex];
        if (!selectedElection) return;

        const elecId = selectedElection.id;
        const constituency = selectedElection.constituency || '';
        const { coreData, regionData, district, metro, partyPolicyFallbacks } = appStore.getState();
        const candidates = getCandidatesForElection(regionData, district, elecId, constituency);
        const blindQueue = buildBlindEvaluationQueue(coreData, candidates, {
          metro,
          district,
          partyPolicyFallbacks
        });

        appStore.setState({
          selectedElectionId: elecId,
          selectedConstituency: constituency,
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
