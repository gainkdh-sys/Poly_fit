import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';
import { fetchRegionData } from '../utils/api.js';

const GEO_BOUNDS = [
  { slug: 'seoul', lat: [37.41, 37.72], lng: [126.76, 127.19] },
  { slug: 'busan', lat: [35.02, 35.40], lng: [128.78, 129.32] },
  { slug: 'daegu', lat: [35.75, 36.02], lng: [128.35, 128.77] },
  { slug: 'incheon', lat: [37.33, 37.65], lng: [126.35, 126.85] },
  { slug: 'gwangju', lat: [35.05, 35.27], lng: [126.70, 127.02] },
  { slug: 'daejeon', lat: [36.20, 36.50], lng: [127.25, 127.55] },
  { slug: 'ulsan', lat: [35.38, 35.72], lng: [129.00, 129.48] },
  { slug: 'sejong', lat: [36.40, 36.72], lng: [127.12, 127.38] },
  { slug: 'gyeonggi', lat: [36.90, 38.35], lng: [126.35, 127.85] },
  { slug: 'gangwon', lat: [37.00, 38.65], lng: [127.55, 129.35] },
  { slug: 'chungbuk', lat: [36.00, 37.35], lng: [127.25, 128.65] },
  { slug: 'chungnam', lat: [35.95, 37.10], lng: [126.05, 127.65] },
  { slug: 'jeonbuk', lat: [35.30, 36.20], lng: [126.40, 127.90] },
  { slug: 'jeonnam', lat: [33.90, 35.45], lng: [125.90, 127.85] },
  { slug: 'gyeongbuk', lat: [35.55, 37.55], lng: [128.00, 130.00] },
  { slug: 'gyeongnam', lat: [34.55, 35.95], lng: [127.55, 129.25] },
  { slug: 'jeju', lat: [33.10, 33.65], lng: [126.10, 126.95] }
];

const REGION_ALIASES = {
  seoul: ['서울'],
  busan: ['부산'],
  daegu: ['대구'],
  incheon: ['인천'],
  gwangju: ['광주'],
  daejeon: ['대전'],
  ulsan: ['울산'],
  sejong: ['세종'],
  gyeonggi: ['경기', '경기도'],
  gangwon: ['강원'],
  chungbuk: ['충북', '충청북도'],
  chungnam: ['충남', '충청남도'],
  jeonbuk: ['전북', '전라북도'],
  jeonnam: ['전남', '전라남도'],
  gyeongbuk: ['경북', '경상북도'],
  gyeongnam: ['경남', '경상남도'],
  jeju: ['제주']
};

function normalizeText(value) {
  return value.replace(/\s/g, '').toLowerCase();
}

function findMetroFromQuery(query, locations) {
  const normalized = normalizeText(query);

  return locations.find((location) => {
    const fullName = normalizeText(location.name);
    const shortName = fullName
      .replace('특별자치도', '')
      .replace('특별자치시', '')
      .replace('특별시', '')
      .replace('광역시', '')
      .replace('도', '');

    const aliases = REGION_ALIASES[location.slug] || [];

    return normalized.includes(fullName)
      || normalized.includes(shortName)
      || normalized.includes(location.slug)
      || aliases.some(alias => normalized.includes(normalizeText(alias)));
  });
}

function findMetroFromCoords(latitude, longitude, locations) {
  const matched = GEO_BOUNDS.find((bound) => (
    latitude >= bound.lat[0]
    && latitude <= bound.lat[1]
    && longitude >= bound.lng[0]
    && longitude <= bound.lng[1]
  ));

  return matched
    ? locations.find(location => location.slug === matched.slug)
    : null;
}

export default class DistrictView extends Component {
  setup() {
    const { metro, regionData } = appStore.getState();

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
      const metroHtml = locations.map((m, idx) => `
        <button class="election-card slide-up"
                style="animation-delay: ${idx * 0.03}s"
                data-slug="${m.slug}"
                data-name="${m.name}">
          <div>
            <div class="election-title">${m.name}</div>
            <div class="election-desc">단계별 선거구 선택</div>
          </div>
          <div class="election-arrow">›</div>
        </button>
      `).join('');

      return `
        <div class="view-wrapper slide-up">
          <div class="step-indicator">선거구 설정</div>
          <h2>주소나 지역명으로<br>선거구를 찾으세요</h2>
          <p>광역자치단체를 먼저 찾고, 다음 화면에서 기초자치단체를 고릅니다.</p>
          <div class="district-tools">
            <div class="search-container">
              <input id="address-search" class="search-input" type="search" placeholder="예: 서울 강남구, 세종특별자치시" autocomplete="off">
            </div>
            <div class="tool-button-row">
              <button id="address-btn" class="btn-secondary compact-btn" type="button">주소로 찾기</button>
              <button id="gps-btn" class="btn-secondary compact-btn" type="button">현재 위치</button>
            </div>
            <p id="district-status" class="form-status" aria-live="polite"></p>
          </div>
          <div class="section-label">광역자치단체</div>
          <div class="election-grid">
            ${metroHtml}
          </div>
        </div>
      `;
    }

    if (this.isLoading) {
      return `
        <div class="view-wrapper center-all mt-2">
          <div class="loader"></div>
          <p style="margin-top:1rem">${this.selectedMetro.name} 데이터를 불러오는 중입니다.</p>
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
                style="animation-delay: ${idx * 0.02}s"
                data-district="${dist}"
                ${hasData ? '' : 'data-empty="true"'}>
          <div>
            <div class="election-title">${dist}</div>
            <div class="election-desc">${hasData ? '후보 데이터 있음' : '후보 데이터 준비 중'}</div>
          </div>
          <div class="election-arrow">${hasData ? '›' : ''}</div>
        </button>
      `;
    }).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">${this.selectedMetro.name}</div>
        <h2>기초자치단체를<br>선택하세요</h2>
        <p style="font-size:0.95rem; margin-bottom:0.75rem">
          총 ${districts.length}개 지역 중 <strong>${hasDataSet.size}개</strong>에 후보 데이터가 있습니다.
        </p>
        <div class="district-tools">
          <div class="search-container">
            <input id="district-search" class="search-input" type="search" placeholder="선거구 검색" autocomplete="off">
          </div>
          <button id="metro-reset-btn" class="btn-ghost" type="button">광역자치단체 다시 선택</button>
        </div>
        <div class="election-grid mt-2" id="district-list">
          ${districtHtml}
        </div>
      </div>
    `;
  }

  setStatus(message, tone = '') {
    const status = this.target.querySelector('#district-status');
    if (!status) return;

    status.textContent = message;
    status.className = `form-status ${tone}`;
  }

  async selectMetro(slug, name) {
    this.selectedMetro = { slug, name };
    this.step = 'district';
    this.isLoading = true;
    this.render();
    this.setEvent();

    const data = await fetchRegionData(slug);
    this.isLoading = false;

    if (!data) {
      this.step = 'metro';
      this.render();
      this.setEvent();
      return;
    }

    this.regionData = data;
    appStore.setState({
      metro: slug,
      district: '',
      regionData: data,
      selectedElectionId: null,
      blindQueue: [],
      blindAnswers: [],
      finalRank: [],
      isResultRevealed: false
    });
  }

  handleAddressSearch() {
    const { locations } = appStore.getState();
    const input = this.target.querySelector('#address-search');
    const query = input?.value.trim() || '';

    if (!query) {
      this.setStatus('주소나 광역자치단체 이름을 입력해 주세요.', 'warn');
      return;
    }

    const location = findMetroFromQuery(query, locations);

    if (!location) {
      this.setStatus('입력한 주소에서 광역자치단체를 찾지 못했습니다. 예: 서울 강남구', 'warn');
      return;
    }

    this.setStatus(`${location.name} 후보 데이터를 불러옵니다.`, 'success');
    this.selectMetro(location.slug, location.name);
  }

  handleGpsSearch() {
    const { locations } = appStore.getState();

    if (!navigator.geolocation) {
      this.setStatus('이 브라우저에서는 위치 권한을 사용할 수 없습니다.', 'warn');
      return;
    }

    this.setStatus('현재 위치 권한을 확인하는 중입니다.');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = findMetroFromCoords(latitude, longitude, locations);

        if (!location) {
          this.setStatus('현재 좌표와 일치하는 광역자치단체를 찾지 못했습니다. 직접 선택해 주세요.', 'warn');
          return;
        }

        this.setStatus(`${location.name}으로 이동합니다.`, 'success');
        this.selectMetro(location.slug, location.name);
      },
      () => {
        this.setStatus('위치 권한을 확인하지 못했습니다. 주소 검색이나 단계별 선택을 이용해 주세요.', 'warn');
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
    );
  }

  filterDistrictCards(query) {
    const normalized = normalizeText(query);
    this.target.querySelectorAll('.election-card[data-district]').forEach((card) => {
      const district = normalizeText(card.dataset.district || '');
      card.hidden = normalized.length > 0 && !district.includes(normalized);
    });
  }

  setEvent() {
    this.target.querySelector('#address-btn')?.addEventListener('click', () => {
      this.handleAddressSearch();
    });

    this.target.querySelector('#address-search')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleAddressSearch();
    });

    this.target.querySelector('#gps-btn')?.addEventListener('click', () => {
      this.handleGpsSearch();
    });

    this.target.querySelector('#district-search')?.addEventListener('input', (e) => {
      this.filterDistrictCards(e.target.value);
    });

    this.target.querySelector('#metro-reset-btn')?.addEventListener('click', () => {
      appStore.setState({ metro: '', district: '', regionData: null });
      this.step = 'metro';
      this.selectedMetro = null;
      this.regionData = null;
      this.render();
      this.setEvent();
    });

    this.target.querySelectorAll('.election-card[data-slug]').forEach(card => {
      card.addEventListener('click', (e) => {
        const slug = e.currentTarget.dataset.slug;
        const name = e.currentTarget.dataset.name;
        this.selectMetro(slug, name);
      });
    });

    this.target.querySelectorAll('.election-card[data-district]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.currentTarget.dataset.empty === 'true') {
          alert('해당 기초자치단체의 후보 데이터가 아직 준비되지 않았습니다. 다른 지역을 선택해 주세요.');
          return;
        }

        const district = e.currentTarget.dataset.district;
        appStore.setState({
          district,
          selectedElectionId: null,
          blindQueue: [],
          blindAnswers: [],
          finalRank: [],
          isResultRevealed: false
        });
        Router.navigate('preference');
      });
    });
  }
}
