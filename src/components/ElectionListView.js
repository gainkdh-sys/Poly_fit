import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';

// 선거 종류별 한국어 레이블 매핑
const ELECTION_LABELS = {
  governor: '광역지방자치단체장 (도지사/시장 등)',
  superintendent: '시·도 교육감',
  mayor: '기초지방자치단체장 (구청장/시장/군수 등)',
  provincial_council: '광역지방의회의원 (도/시의원 등)',
  city_council: '기초지방의회의원 (시/구/군의원 등)'
};

// 표시 우선 순위
const ELECTION_ORDER = ['governor', 'superintendent', 'mayor', 'provincial_council', 'city_council'];

export default class ElectionListView extends Component {
  setup() {
    const { regionData, district } = appStore.getState();

    // 선택된 기초에 실제 존재하는 선거 종류 계산
    this.availableElections = [];

    if (!regionData) return;

    // 광역 단위 선거 (governor, superintendent)
    if ((regionData.governor || []).length > 0) {
      this.availableElections.push({ id: 'governor', name: ELECTION_LABELS['governor'] });
    }
    if ((regionData.superintendent || []).length > 0) {
      this.availableElections.push({ id: 'superintendent', name: ELECTION_LABELS['superintendent'] });
    }

    // 기초 단위 선거 (선택된 district 기준)
    const distData = (regionData.districts || {})[district] || {};
    ELECTION_ORDER.filter(t => !['governor', 'superintendent'].includes(t)).forEach(etype => {
      if ((distData[etype] || []).length > 0) {
        this.availableElections.push({ id: etype, name: ELECTION_LABELS[etype] });
      }
    });
  }

  template() {
    const { district, regionData } = appStore.getState();
    const metroName = regionData?.metro || '';

    if (this.availableElections.length === 0) {
      return `
        <div class="view-wrapper center-all mt-2">
          <h2>😔 후보 데이터 없음</h2>
          <p>${metroName} ${district}의 선거 데이터가<br>아직 준비되지 않았습니다.</p>
          <button id="back-btn" class="btn-secondary mt-2">← 지역 다시 선택</button>
        </div>
      `;
    }

    const electionsHtml = this.availableElections.map((elec, idx) => `
      <div class="election-card slide-up" style="animation-delay: ${idx * 0.08}s" data-id="${elec.id}">
        <div>
          <div class="election-title">${elec.name}</div>
          <div class="election-desc">블라인드 매칭 시작</div>
        </div>
        <div class="election-arrow">→</div>
      </div>
    `).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">📍 ${metroName} ${district}</div>
        <h2>선거 종류를<br>고르세요!</h2>
        <p>아래 메뉴 중 하나를 탭하시면 <b>실제 출마 선언자</b>들의<br>공약이 블라인드로 출제됩니다.</p>
        <div class="election-grid mt-2">
          ${electionsHtml}
        </div>
      </div>
    `;
  }

  setEvent() {
    // 후보 데이터 없을 때 뒤로가기
    this.target.querySelector('#back-btn')?.addEventListener('click', () => {
      Router.navigate('district');
    });

    this.target.querySelectorAll('.election-card[data-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        const elecId = e.currentTarget.dataset.id;
        appStore.setState({
          selectedElectionId: elecId,
          blindAnswers: [],
          isResultRevealed: false
        });
        Router.navigate('blindPledge');
      });
    });
  }
}
