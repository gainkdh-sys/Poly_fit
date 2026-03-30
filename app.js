/* app.js */
import { categories, questions, electionsList, candidates } from './data.js';

const DOM = { app: document.getElementById('app') };

const state = {
  view: 'intro', 
  district: '', 
  
  // Phase 1 (18문항) - 뒤로 가기 복구를 위해 배열로 기록
  prefAnswers: [], // { category: 'welfare', score: 5 }
  
  selectedElectionId: null, // 도지사, 시장 등
  
  // Phase 2 (블라인드 6문항) - 뒤로 가기 복구를 위해 배열로 기록
  blindAnswers: [], // { candId: 101, catId: 'welfare' }
  
  finalRank: [],
  isResultRevealed: false
};

// ================= [Core Engine] =================
function navigate(view) { 
  state.view = view; 
  render(); 
}

// 18문항 배열 값을 현재 가중치 객체로 환산
function getPreferences() {
  const prefs = { welfare: 0, education:0, transport:0, culture:0, housing:0, environment:0 };
  state.prefAnswers.forEach(ans => prefs[ans.category] += ans.score);
  return prefs;
}

function getCategoryName(catId) {
  const c = categories.find(x => x.id === catId);
  return c ? c.name : '';
}

function render() {
  DOM.app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'container fade-in';
  
  // 네비게이션 헤더 렌더링 (intro, loading 제외)
  if (!['intro', 'loading'].includes(state.view)) {
    const header = document.createElement('div');
    header.className = 'nav-header';
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back';
    backBtn.innerHTML = '<i>←</i> 이전으로';
    backBtn.onclick = handleBack;
    header.appendChild(backBtn);
    DOM.app.appendChild(header);
  }

  // 뷰 마운트
  if (state.view === 'intro') container.appendChild(renderIntro());
  if (state.view === 'district') container.appendChild(renderDistrict());
  if (state.view === 'preference') container.appendChild(renderPreference());
  if (state.view === 'prefSummary') container.appendChild(renderPrefSummary());
  if (state.view === 'electionList') container.appendChild(renderElectionList());
  if (state.view === 'blindPledge') container.appendChild(renderBlindPledge());
  if (state.view === 'loading') {
      container.appendChild(renderLoading());
      setTimeout(() => { calculateMatch(); navigate('result'); }, 2200);
  }
  if (state.view === 'result') container.appendChild(renderResult());

  DOM.app.appendChild(container);
  window.scrollTo(0, 0);
}

// 공통 뒤로 가기 라우터
function handleBack() {
  if (state.view === 'district') navigate('intro');
  else if (state.view === 'preference') {
    if (state.prefAnswers.length > 0) { state.prefAnswers.pop(); navigate('preference'); }
    else navigate('district');
  }
  else if (state.view === 'prefSummary') {
    state.prefAnswers.pop(); // 마지막 문제 다시 풀기
    navigate('preference');
  }
  else if (state.view === 'electionList') navigate('prefSummary');
  else if (state.view === 'blindPledge') {
    if (state.blindAnswers.length > 0) { state.blindAnswers.pop(); navigate('blindPledge'); }
    else navigate('electionList');
  }
  else if (state.view === 'result') {
    state.blindAnswers = [];
    state.isResultRevealed = false;
    navigate('electionList');
  }
}

function createEl(tag, className, innerHTML = '') {
  const el = document.createElement(tag);
  if(className) el.className = className;
  if(innerHTML) el.innerHTML = innerHTML;
  return el;
}

const DUMMY_LOCATIONS = [
  "서울특별시 강남구 역삼동", "서울특별시 마포구 서교동", "서울특별시 종로구 평창동", "서울특별시 영등포구 여의도동",
  "부산광역시 해운대구 우동", "부산광역시 동래구 사직동", "인천광역시 연수구 송도동", "인천광역시 부평구 부평동",
  "대구광역시 수성구 범어동", "광주광역시 북구 용봉동", "대전광역시 서구 둔산동", "울산광역시 남구 삼산동", 
  "세종특별자치시 도담동", "경기도 성남시 분당구 정자동", "경기도 수원시 영통구 광교동", "강원특별자치도 춘천시 퇴계동", 
  "충청북도 청주시 흥덕구 복대동", "충청남도 천안시 서북구 쌍용동", "전북특별자치도 전주시 완산구 효자동", 
  "전라남도 여수시 웅천동", "경상북도 포항시 남구 지곡동", "경상남도 창원시 성산구 상남동", "제주특별자치도 제주시 노형동",
  // 진주시 읍면동 상세 (최우선 요청)
  "경상남도 진주시 문산읍", "경상남도 진주시 내동면", "경상남도 진주시 정촌면", "경상남도 진주시 금곡면", "경상남도 진주시 진성면",
  "경상남도 진주시 일반성면", "경상남도 진주시 이반성면", "경상남도 진주시 사봉면", "경상남도 진주시 지수면", "경상남도 진주시 대곡면",
  "경상남도 진주시 금산면", "경상남도 진주시 집현면", "경상남도 진주시 미천면", "경상남도 진주시 명석면", "경상남도 진주시 대평면",
  "경상남도 진주시 수곡면", "경상남도 진주시 가호동", "경상남도 진주시 평거동", "경상남도 진주시 충무공동", "경상남도 진주시 판문동",
  "경상남도 진주시 신안동", "경상남도 진주시 이현동", "경상남도 진주시 상평동", "경상남도 진주시 하대동", "경상남도 진주시 초장동"
];

// ================= [Views] =================

function renderIntro() {
  const wrapper = createEl('div', 'view-wrapper intro-view center-all');
  wrapper.innerHTML = `
    <div class="hero mt-2">
      <div class="badge">Poly Fit v3.0</div>
      <h1>나의 가치관을 관통하는<br><span class="highlight">최적의 블라인드 매칭</span></h1>
      <p>가치관 설문으로 중요도를 파악하고,<br>익명의 블라인드 공약을 골라 최고의 후보를 찾습니다.</p>
    </div>
    <div style="display:flex; flex-direction:column; gap:1rem; margin-top:2.5rem;">
      <button class="btn-primary" onclick="window.navigateState('district')">매칭 시스템 시작하기</button>
      <button class="btn-secondary" onclick="alert('정치 MBTI 기능은 현재 데이터를 준비 중입니다! 매칭 시스템을 이용해 주세요.')">나의 정치 MBTI 알아보기 (준비 중)</button>
    </div>
  `;
  window.navigateState = navigate;
  return wrapper;
}

function renderDistrict() {
  const wrapper = createEl('div', 'view-wrapper slide-up center-all');
  wrapper.innerHTML = `
    <h2>가장 궁금한 선거가 치러질<br>지역을 검색하세요</h2>
    <p>전국의 읍, 면, 동 단위를 편하게 입력해주세요.</p>
    <div class="search-container mt-2">
      <input type="text" id="district-search" class="search-input" placeholder="예: 가호동, 집현면, 서교동" autocomplete="off">
      <div id="autocomplete-list" class="autocomplete-dropdown"></div>
    </div>
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
          div.onclick = () => { state.district = match; navigate('preference'); };
          list.appendChild(div);
        });
      } else list.classList.remove('active');
    });

    input.addEventListener('keypress', (e) => {
      if(e.key === 'Enter' && input.value.trim().length > 1) {
        state.district = input.value.trim() + " 일대";
        navigate('preference');
      }
    });
  }, 0);
  return wrapper;
}

function renderPreference() {
  const wrapper = createEl('div', 'view-wrapper slide-up');
  const qIdx = state.prefAnswers.length;
  const qInfo = questions[qIdx];
  
  wrapper.innerHTML = `
    <div class="step-indicator">1단계 : 정책 가중치 판별 (${qIdx + 1} / ${questions.length})</div>
    <div class="cat-badge"># ${getCategoryName(qInfo.category)}</div>
    <h2 class="q-title">${qInfo.text}</h2>
  `;
  
  const likertGrid = createEl('div', 'likert-grid mt-2');
  const scales = [
    { text: "매우 중요함", score: 5 }, { text: "중요함", score: 4 }, { text: "보통임", score: 3 },
    { text: "덜 중요함", score: 2 }, { text: "전혀 중요하지 않음", score: 1 }
  ];

  scales.forEach((scale, idx) => {
    const btn = createEl('button', 'likert-btn slide-up');
    btn.innerHTML = scale.text;
    btn.style.animationDelay = `${idx * 0.05}s`;
    btn.onclick = () => {
      state.prefAnswers.push({ category: qInfo.category, score: scale.score });
      if (state.prefAnswers.length < questions.length) navigate('preference');
      else navigate('prefSummary');
    };
    likertGrid.appendChild(btn);
  });
  
  wrapper.appendChild(likertGrid);
  return wrapper;
}

function renderPrefSummary() {
  const wrapper = createEl('div', 'view-wrapper slide-up');
  const prefs = getPreferences();
  let total = Object.values(prefs).reduce((a,b) => a+b, 0);
  
  wrapper.innerHTML = `
    <div class="step-indicator">가치관 진단 완료</div>
    <h2 class="q-title">나의 정책 중요도 랭킹</h2>
    <p>18문항의 응답을 분석하여 산출된 각 정책 분야별 비중 백분율입니다.</p>
    <div class="summary-list mt-2"></div>
    <button class="btn-primary mt-2" onclick="window.navigateState('electionList')">이 중요도를 들고 선거 고르러 가기 →</button>
  `;
  
  const sList = wrapper.querySelector('.summary-list');
  // 높은 가중치 순으로 정렬 표시
  const sortedCats = categories.map(c => ({
    name: c.name, pct: total > 0 ? Math.round((prefs[c.id]/total)*100) : 0
  })).sort((a,b) => b.pct - a.pct);
  
  sortedCats.forEach(c => {
    sList.innerHTML += `
      <div class="summary-item">
        <div class="summary-label"><span>${c.name}</span><span>${c.pct}%</span></div>
        <div class="summary-bar-bg"><div class="summary-bar-fill slide-up" style="width: ${c.pct}%"></div></div>
      </div>
    `;
  });
  
  return wrapper;
}

function renderElectionList() {
  const wrapper = createEl('div', 'view-wrapper slide-up');
  wrapper.innerHTML = `
    <h2>${state.district}<br>선거 종류를 고르세요!</h2>
    <p>본격적인 <b>이름을 가린 진짜 공약</b> 블라인드 선택이 이어집니다!</p>
    <div class="election-grid mt-2"></div>
  `;
  
  const grid = wrapper.querySelector('.election-grid');
  electionsList.forEach((elec, idx) => {
    const card = createEl('div', 'election-card slide-up');
    card.style.animationDelay = `${idx * 0.08}s`;
    card.onclick = () => {
      state.selectedElectionId = elec.id;
      state.blindAnswers = []; // 초기화
      state.isResultRevealed = false;
      navigate('blindPledge');
    };
    card.innerHTML = `
      <div>
        <div class="election-title">${elec.name}</div>
        <div class="election-desc">후보자 리스트 호출 및 블라인드 매칭</div>
      </div>
      <div class="election-arrow">→</div>
    `;
    grid.appendChild(card);
  });
  return wrapper;
}


// ================= [블라인드 2-Stage 로직] =================
function renderBlindPledge() {
  const wrapper = createEl('div', 'view-wrapper slide-up');
  const catIdx = state.blindAnswers.length;
  const currentCat = categories[catIdx];
  
  // 선택한 선거의 예비 후보 5명을 모두 가져옴
  const targetCandidates = candidates.filter(c => c.electionId === state.selectedElectionId);
  // 누구 공약인지 모르도록 랜덤 셔플
  const shuffledCands = [...targetCandidates].sort(() => Math.random() - 0.5);
  
  wrapper.innerHTML = `
    <div class="step-indicator">2단계 : 진짜 공약 고르기 (${catIdx + 1} / ${categories.length})</div>
    <div class="cat-badge"># ${currentCat.name} 부문</div>
    <h2 class="q-title" style="font-size:1.3rem;">후보자들의 실제 ${currentCat.name} 공약입니다.<br>가장 마음에 드는 것을 고르세요!</h2>
    <p style="font-size:0.9rem">선택지 순서는 무작위로 계속 섞여서 제공됩니다.</p>
    <div class="pledge-list mt-2"></div>
  `;
  
  const list = wrapper.querySelector('.pledge-list');
  shuffledCands.forEach((cand, idx) => {
    // 공약 텍스트
    const pledgeText = cand.pledges[currentCat.id] || "해당 분야 공약 정보 없음";
    const card = createEl('button', 'pledge-card');
    card.innerHTML = `"${pledgeText}"`;
    card.style.animationDelay = `${idx * 0.08}s`;
    
    card.onclick = () => {
      state.blindAnswers.push({ candId: cand.id, catId: currentCat.id });
      if (state.blindAnswers.length < categories.length) navigate('blindPledge');
      else navigate('loading');
    };
    list.appendChild(card);
  });
  
  return wrapper;
}

function renderLoading() {
  const wrapper = createEl('div', 'view-wrapper center-all fade-in mt-2');
  wrapper.innerHTML = `
    <br><br><br><div class="loader"></div>
    <h2 style="font-size: 1.5rem; margin-top: 1rem;">최종 매칭 알고리즘 가동 중...</h2>
    <p style="font-size:0.95rem;">'가치관 가중치'와 '선택한 블라인드 공약'을<br>조합하여 입체적으로 연산하고 있습니다.</p>
  `;
  return wrapper;
}

// V3.0 투스텝 곱셈 엔진 로직
function calculateMatch() {
  const prefs = getPreferences();
  const targetCandidates = candidates.filter(c => c.electionId === state.selectedElectionId);
  const scoreMap = {};
  targetCandidates.forEach(c => scoreMap[c.id] = 0);
  
  // 사용자가 각 6개 챕터에서 블라인드로 선택한 공약의 주인(candId)에게,
  // 앞서 환산해둔 해당 챕터(catId)의 '가치관 점수'를 통째로 부과함.
  state.blindAnswers.forEach(ans => {
    const catWeight = prefs[ans.catId] || 0;
    if (scoreMap[ans.candId] !== undefined) {
      scoreMap[ans.candId] += catWeight;
    }
  });
  
  // 사용자가 만약 모든 문제에서 1명의 후보 공약을 싹 다 골랐을 때 그 후보가 받는 '만점'
  // (즉, 모든 분야 가치관 점수의 총합)
  let maxScore = Object.values(prefs).reduce((a,b)=>a+b, 0);
  
  state.finalRank = targetCandidates.map(c => {
    let rawScore = scoreMap[c.id] || 0;
    let matchRate = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
    return { ...c, matchRate };
  }).sort((a,b) => b.matchRate - a.matchRate);
}

function renderResult() {
  const wrapper = createEl('div', 'view-wrapper slide-up result-view center-all');
  const elecObj = electionsList.find(e => e.id === state.selectedElectionId);
  const elecName = elecObj ? elecObj.name : '선거';
  
  if(state.finalRank.length === 0) {
    wrapper.innerHTML = `<h2>후보가 없습니다.</h2><button class="btn-primary mt-2" onclick="location.reload()">처음으로</button>`;
    return wrapper;
  }

  const topC = state.finalRank[0];
  
  if (!state.isResultRevealed) {
    wrapper.innerHTML = `
      <h2 style="margin-top:2rem;">알고리즘 연산 완료!</h2>
      <p>나의 가치관과 공약을 매칭한<br>[${elecName}] 최종 순위가 도출되었습니다.</p>
      <div class="result-hidden mt-2">
        <div class="result-lock-icon">🔒</div>
        <h3 style="color:var(--text); margin-bottom:1.5rem;">과연 1위 후보는 누구일까요?</h3>
        <button class="btn-primary" id="btn-reveal">나의 가치관 랭킹 오픈하기</button>
      </div>
    `;
    setTimeout(() => {
      document.getElementById('btn-reveal').onclick = () => {
        state.isResultRevealed = true;
        navigate('result');
      };
    }, 0);
    return wrapper;
  }

  wrapper.innerHTML = `
    <div class="match-header fade-in">
      <div class="confetti">🎉</div>
      <h3 style="color: var(--primary); font-size: 1.1rem; font-weight: 800; margin-bottom: 0.5rem;">[${elecName}] 부문 나의 원픽!</h3>
    </div>
    
    <div class="result-card mt-2 slide-up">
      <div class="match-rate">최종 핏팅률 <span>${topC.matchRate}%</span></div>
      <div class="party-badge">${topC.party}</div>
      <h1 class="cand-name">${topC.name} <span class="cand-title"></span></h1>
      <p class="cand-bio">${topC.bio}</p>
      <div style="background:#f1f5f9; padding:1rem; border-radius:12px; font-size:0.9rem; margin-top:1rem;">"${topC.desc}"</div>
    </div>
    
    <h3 class="other-title slide-up" style="margin-top:2rem; font-size:1.1rem; text-align:left;">상세 순위표 (2~5위)</h3>
    <div class="other-list slide-up">
      ${state.finalRank.slice(1).map((c, idx) => `
        <div class="other-cand">
          <div class="other-info">
            <span style="font-size:0.8rem; font-weight:800; color:var(--primary);">순위 ${idx + 2}</span>
            <span class="other-name">${c.name} <span style="font-size:0.8rem;font-weight:600;color:gray;">(${c.party})</span></span>
          </div>
          <div class="other-rate">${c.matchRate}%</div>
        </div>
      `).join('')}
    </div>
    
    <div class="slide-up" style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom: 2rem; width:100%;">
      <button class="btn-primary" onclick="window.navigateState('electionList')">동일 구역의 다른 선거 또 해보기</button>
      <button class="btn-secondary" onclick="location.reload()">처음부터 다시하기 (질문 초기화)</button>
    </div>
  `;
  return wrapper;
}

document.addEventListener('DOMContentLoaded', render);
if (document.readyState === 'interactive' || document.readyState === 'complete') render();
