/* app.js */
import { categories, questions, electionsList, candidates } from './data.js';

const DOM = { app: document.getElementById('app') };

// V2 전면 개편 상태 관리 로직
const state = {
  view: 'intro', 
  district: '', // 검색된 지역구 이름
  // 6대 카테고리 18문항에 대한 가중치 총합 (5점 척도 누적)
  preferences: { welfare: 0, education: 0, transport: 0, culture: 0, housing: 0, environment: 0 },
  currentPrefQuestion: 0,
  selectedElectionId: null, // 다중 선거 선택 결과
  finalRank: []
};

// 뷰 라우팅(엔진)
function navigate(view) { 
  state.view = view; 
  render(); 
}

function getCategoryName(catId) {
  const c = categories.find(x => x.id === catId);
  return c ? c.name : '';
}

function render() {
  DOM.app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'container fade-in';
  
  if (state.view === 'intro') container.appendChild(renderIntro());
  if (state.view === 'district') container.appendChild(renderDistrict());
  if (state.view === 'preference') container.appendChild(renderPreference());
  if (state.view === 'electionList') container.appendChild(renderElectionList());
  if (state.view === 'loading') {
      container.appendChild(renderLoading());
      setTimeout(() => { calculateMatch(); navigate('result'); }, 2000);
  }
  if (state.view === 'result') container.appendChild(renderResult());

  DOM.app.appendChild(container);
  window.scrollTo(0, 0);
}

function createEl(tag, className, innerHTML = '') {
  const el = document.createElement(tag);
  if(className) el.className = className;
  if(innerHTML) el.innerHTML = innerHTML;
  return el;
}

// 1. 인트로 (MBTI 등 듀얼 모드 분할)
function renderIntro() {
  const wrapper = createEl('div', 'view-wrapper intro-view center-all');
  wrapper.innerHTML = `
    <div class="hero">
      <div class="badge">Poly Fit v2.0</div>
      <h1>나의 가치관에 딱 맞는<br><span class="highlight">최적의 정치인 찾기</span></h1>
      <p>18개의 디테일한 질문을 통해<br>나에게 가장 필요한 정책을 펼칠 후보를 뽑아줍니다.</p>
    </div>
    <div class="dual-mode-grid">
      <button class="btn-primary" id="btn-match">정치인 매칭 시스템 시작하기</button>
      <button class="btn-secondary" id="btn-mbti">나의 정치 MBTI 알아보기 (준비 중)</button>
    </div>
  `;
  setTimeout(() => {
    document.getElementById('btn-match').onclick = () => navigate('district');
    document.getElementById('btn-mbti').onclick = () => alert("정치 MBTI 기능은 현재 열심히 준비 중입니다! 우선 매칭 시스템을 이용해 주세요.");
  }, 0);
  return wrapper;
}

// 전국구 더미 검색 데이터셋
const DUMMY_LOCATIONS = [
  "서울특별시 강남구 역삼동", "서울특별시 마포구 서교동", "부산광역시 해운대구 우동",
  "인천광역시 연수구 송도동", "세종특별자치시 보람동", "경기도 성남시 분당구 정자동",
  "경기도 과천시 중앙동", "충청남도 천안시 서북구 쌍용동", "전북특별자치도 전주시 완산구 효자동",
  "경상북도 포항시 남구 효자동", "경상남도 진주시 가호동", "경상남도 진주시 평거동",
  "경상남도 진주시 충무공동", "경상남도 창원시 성산구 상남동", "제주특별자치도 제주시 노형동"
];

// 2. 전국구 지역 검색 (네이버 API 대체 텍스트 검색 모듈)
function renderDistrict() {
  const wrapper = createEl('div', 'view-wrapper slide-up center-all');
  wrapper.innerHTML = `
    <h2>어느 동네에<br>거주하고 계신가요?</h2>
    <p>거주지에 출마할 선거 목록을 불러옵니다.<br>(동 단위로 지역를 검색해보세요)</p>
    <div class="search-container">
      <input type="text" id="district-search" class="search-input" placeholder="예: 가호동, 서교동, 정자동" autocomplete="off">
      <div id="autocomplete-list" class="autocomplete-dropdown"></div>
    </div>
    <p style="font-size:0.85rem; color:#94a3b8; margin-top:2rem;">네이버 지도 연동 전, 전국 텍스트 기반<br>자동완성 모의 버전으로 동작합니다.</p>
  `;
  
  setTimeout(() => {
    const input = document.getElementById('district-search');
    const list = document.getElementById('autocomplete-list');
    
    input.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      list.innerHTML = '';
      if (!val) { list.classList.remove('active'); return; }
      
      const matches = DUMMY_LOCATIONS.filter(loc => loc.includes(val));
      if (matches.length > 0) {
        list.classList.add('active');
        matches.forEach(match => {
          const div = createEl('div', 'autocomplete-item', match);
          div.onclick = () => {
            state.district = match;
            navigate('preference');
          };
          list.appendChild(div);
        });
      } else {
        list.classList.remove('active');
      }
    });

    // 엔터키 직접 입력으로 없는 동네 강제 지정 가능
    input.addEventListener('keypress', (e) => {
      if(e.key === 'Enter' && input.value.trim().length > 1) {
        state.district = input.value.trim() + " 일대";
        navigate('preference');
      }
    });
  }, 0);

  return wrapper;
}

// 3. 18문항 5점 리커트 척도 설문 루프
function renderPreference() {
  const wrapper = createEl('div', 'view-wrapper slide-up');
  const qInfo = questions[state.currentPrefQuestion];
  
  wrapper.innerHTML = `
    <div class="step-indicator">가치관 핏팅 질문 ${state.currentPrefQuestion + 1} / ${questions.length}</div>
    <div class="cat-badge"># ${getCategoryName(qInfo.category)}</div>
    <h2 class="q-title">${qInfo.text}</h2>
  `;
  
  const likertGrid = createEl('div', 'likert-grid');
  const scales = [
    { text: "매우 중요함", score: 5 },
    { text: "중요함", score: 4 },
    { text: "보통임", score: 3 },
    { text: "덜 중요함", score: 2 },
    { text: "전혀 중요하지 않음", score: 1 }
  ];

  scales.forEach((scale, idx) => {
    const btn = createEl('button', 'likert-btn slide-up');
    btn.innerHTML = scale.text;
    btn.style.animationDelay = `${idx * 0.05}s`;
    
    btn.onclick = () => {
      // 해당 카테고리에 점수 즉시 누적
      state.preferences[qInfo.category] += scale.score;
      
      if (state.currentPrefQuestion < questions.length - 1) {
        state.currentPrefQuestion++;
        navigate('preference');
      } else {
        navigate('electionList');
      }
    };
    likertGrid.appendChild(btn);
  });
  
  wrapper.appendChild(likertGrid);
  return wrapper;
}

// 4. 설문 완료 후 [다중 선거 종류] 선택 라우터
function renderElectionList() {
  const wrapper = createEl('div', 'view-wrapper slide-up');
  wrapper.innerHTML = `
    <h2 style="font-size:1.4rem;">${state.district}<br>선거구를 위한 정치인 목록</h2>
    <p>나의 가치관 데이터 수집이 끝났습니다!<br>매칭 결과를 조회할 선거 분류를 골라주세요.</p>
    <div class="election-grid"></div>
  `;
  
  const grid = wrapper.querySelector('.election-grid');
  electionsList.forEach((elec, idx) => {
    const card = createEl('div', 'election-card slide-up');
    card.style.animationDelay = `${idx * 0.08}s`;
    card.onclick = () => {
      state.selectedElectionId = elec.id;
      navigate('loading');
    };
    card.innerHTML = `
      <div>
        <div class="election-title">${elec.name}</div>
        <div class="election-desc">내 가치관과 일치하는 핏(Fit) 보기</div>
      </div>
      <div class="election-arrow">→</div>
    `;
    grid.appendChild(card);
  });
  
  return wrapper;
}

// 5. 로딩 (알고리즘 연산 시간 확보)
function renderLoading() {
  const wrapper = createEl('div', 'view-wrapper center-all fade-in mt-2');
  wrapper.innerHTML = `
    <br><br><br><div class="loader"></div>
    <h2 style="font-size: 1.6rem; margin-top: 1rem;">가치관 알고리즘 매치 중...</h2>
    <p>18종의 가치관 스코어를 분석해 후보자의<br>공약 벡터와 일치율을 계산하고 있습니다</p>
  `;
  return wrapper;
}

// 6. 100% 매칭 수식 (5점 척도 스케일링 보정)
function calculateMatch() {
  // 사용자가 고른 선거(예: 도지사)에 해당하는 후보들만 필터링
  const targetCandidates = candidates.filter(c => c.electionId === state.selectedElectionId);
  
  // 사용자의 총점을 10점 만점 단위로 정규화 스케일링 변환 
  // (3문제이므로 각 분야 최소 3점, 최대 15점) -> 이를 0~10 구간으로 변환
  const normalizedUser = {};
  categories.forEach(cat => {
    const rawScore = state.preferences[cat.id];
    let norm = ((rawScore - 3) / 12) * 10;
    if(norm < 0) norm = 0;
    normalizedUser[cat.id] = norm;
  });

  state.finalRank = targetCandidates.map(c => {
    let totalDiff = 0;
    // 거리가 가까울수록(차이가 적을수록) 매칭률이 높음
    categories.forEach(cat => {
      totalDiff += Math.abs(normalizedUser[cat.id] - c.policyVector[cat.id]);
    });
    
    // 최대 편차 60점 기준으로 100분위 환산
    let matchRate = Math.round(100 - (totalDiff / 60) * 100);
    if(matchRate < 0) matchRate = 0;
    if(matchRate > 99) matchRate = 99; // 만점 방어
    
    return { ...c, matchRate };
  }).sort((a,b) => b.matchRate - a.matchRate);
}

// 7. 결과 화면 및 "다른 선거 다시 고르기" 회귀 로직
function renderResult() {
  const wrapper = createEl('div', 'view-wrapper slide-up result-view center-all');
  const elecObj = electionsList.find(e => e.id === state.selectedElectionId);
  const elecName = elecObj ? elecObj.name : '선거';
  
  if(state.finalRank.length === 0) {
    wrapper.innerHTML = `<h2>아직 해당 선거구의 데이터가 부족합니다.</h2><button class="btn-primary mt-2" onclick="location.reload()">처음으로</button>`;
    return wrapper;
  }

  const topCandidate = state.finalRank[0];
  
  wrapper.innerHTML = `
    <div class="match-header">
      <div class="confetti">🎉</div>
      <h3 style="color: var(--primary); font-size: 1.1rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.05em;">[${elecName}] 부문 베스트 솔루션</h3>
      <p style="color: var(--text-muted); font-size: 0.95rem;">${state.district} 주민과 가장 핏(Fit)한 인물은</p>
    </div>
    
    <div class="result-card mt-2">
      <div class="match-rate">가치관 스코어 일치율 <span>${topCandidate.matchRate}%</span></div>
      <div class="party-badge">${topCandidate.party}</div>
      <h1 class="cand-name">${topCandidate.name} <span class="cand-title">후보</span></h1>
      <p class="cand-bio">${topCandidate.bio}</p>
      <div class="cand-desc">"${topCandidate.desc}"</div>
    </div>
    
    ${state.finalRank.length > 1 ? `
    <h3 class="other-title">다른 예상 후보군과의 일치율 비교</h3>
    <div class="other-list">
      ${state.finalRank.slice(1).map(c => `
        <div class="other-cand">
          <div class="other-info"><span class="other-party">${c.party}</span><span class="other-name">${c.name} 후보</span></div>
          <div class="other-rate">${c.matchRate}%</div>
        </div>
      `).join('')}
    </div>` : ''}
    
    <div style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom: 2rem; width:100%;">
      <button class="btn-primary" id="btn-other-elec">👉 같은 지역구 **다른 선거** 결과도 매칭하기</button>
      <button class="btn-secondary" onclick="location.reload()">테스트 아예 처음부터 다시하기 (질문지 초기화)</button>
    </div>
  `;
  
  // 회귀 로직 연결장치 (새고로침 없이 선거 셀렉트 화면으로 바로 복귀)
  setTimeout(() => {
    document.getElementById('btn-other-elec').onclick = () => {
      navigate('electionList');
    };
  }, 0);

  return wrapper;
}

// 브라우저 렌더링 동기화용 이중 안전 구조
document.addEventListener('DOMContentLoaded', render);
if (document.readyState === 'interactive' || document.readyState === 'complete') render();
