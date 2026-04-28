import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';
import { fetchRegionData } from '../utils/api.js';

export default class DistrictView extends Component {
  setup() {
    const { metro, regionData } = appStore.getState();

    // preference에서 뒤로올 때 → 이미 선택된 광역/기초가 있으면 2단계로 복원
    if (metro && regionData) {
      this.step = 'district';
      this.selectedMetro = { slug: metro, name: regionData.metro };
      this.regionData = regionData;
    } else {
      this.step = 'metro';
      this.selectedMetro = null;
      this.regionData = null;
    }
    this.isLoading = false;
  }

  template() {
    const { locations } = appStore.getState();

    if (this.step === 'metro') {
      // ─── 1단계: 광역자치단체 선택 ───────────────────────
      const metroHtml = locations.map((m, idx) => `
        <button class="election-card slide-up"
                style="animation-delay: ${idx * 0.04}s"
                data-slug="${m.slug}"
                data-name="${m.name}">
          <div>
            <div class="election-title">${m.name}</div>
          </div>
          <div class="election-arrow">→</div>
        </button>
      `).join('');

      return `
        <div class="view-wrapper slide-up center-all">
          <h2>지역을 선택하세요</h2>
          <p>광역자치단체를 먼저 선택하면<br>해당 기초자치단체 목록이 나타납니다.</p>
          <div class="election-grid mt-2">
            ${metroHtml}
          </div>
        </div>
      `;
    }

    // ─── 2단계: 기초자치단체 선택 ────────────────────────
    if (this.isLoading) {
      return `
        <div class="view-wrapper center-all mt-2">
          <div class="loader"></div>
          <p style="margin-top:1rem">${this.selectedMetro.name} 데이터 불러오는 중...</p>
        </div>
      `;
    }

    if (!this.regionData) return '';

    const districts = Object.keys(this.regionData.districts);
    const hasDataSet = new Set(
      districts.filter(d => Object.keys(this.regionData.districts[d]).length > 0)
    );

    const districtHtml = districts.map((dist, idx) => {
      const hasData = hasDataSet.has(dist);
      return `
        <button class="election-card slide-up ${hasData ? '' : 'district-empty'}"
                style="animation-delay: ${idx * 0.025}s"
                data-district="${dist}"
                ${hasData ? '' : 'data-empty="true"'}>
          <div>
            <div class="election-title">${dist}</div>
            <div class="election-desc">${hasData ? '후보 데이터 있음' : '아직 데이터 없음'}</div>
          </div>
          <div class="election-arrow">${hasData ? '→' : '—'}</div>
        </button>
      `;
    }).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">📍 ${this.selectedMetro.name}</div>
        <h2>기초자치단체를<br>선택하세요</h2>
        <p style="font-size:0.9rem; margin-bottom:0.5rem">
          총 ${districts.length}개 시·군·구 중 
          <strong>${hasDataSet.size}개</strong>에 후보 데이터가 있습니다.
        </p>
        <div class="election-grid mt-2">
          ${districtHtml}
        </div>
      </div>
    `;
  }

  setEvent() {
    // 광역 카드 클릭 → 기초 목록 로드
    this.target.querySelectorAll('.election-card[data-slug]').forEach(card => {
      card.addEventListener('click', async (e) => {
        const slug = e.currentTarget.dataset.slug;
        const name = e.currentTarget.dataset.name;
        this.selectedMetro = { slug, name };
        this.step = 'district';
        this.isLoading = true;
        this.render(); // 로딩 UI 표시

        // 광역 데이터 Lazy Load
        const data = await fetchRegionData(slug);
        this.isLoading = false;

        // 엣지 케이스: 로드 실패
        if (!data) {
          this.step = 'metro';
          this.render();
          return;
        }

        this.regionData = data;
        appStore.setState({ metro: slug, regionData: data });
        this.render(); // 기초 목록 표시
        this.setEvent(); // 이벤트 재바인딩
      });
    });

    // 기초자치단체 카드 클릭
    this.target.querySelectorAll('.election-card[data-district]').forEach(card => {
      card.addEventListener('click', (e) => {
        // 데이터 없는 기초 클릭 시 안내
        if (e.currentTarget.dataset.empty === 'true') {
          alert('해당 기초자치단체의 후보 데이터가 아직 준비되지 않았습니다.\n다른 지역을 선택해 주세요.');
          return;
        }

        const district = e.currentTarget.dataset.district;
        appStore.setState({ district });
        Router.navigate('preference');
      });
    });
  }
}
