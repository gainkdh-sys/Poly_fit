/* app.js */
import { categories, questions, candidates } from './data.js';

const DOM = { app: document.getElementById('app') };

const state = {
  view: 'intro', district: '',
  preferences: { welfare: 1, education: 1, transport: 1, culture: 1, housing: 1, environment: 1 },
  currentPrefQuestion: 0, currentBlindCat: 0,
  candidateScores: { 1: 0, 2: 0, 3: 0 },
  finalRank: []
};

function navigate(view) { state.view = view; render(); }

// 지도의 투표 권역을 클릭했을 때 작동하는 글로벌 함수
window.selectRegion = (regionName) => {
  state.district = "진주시 " + regionName;
  navigate('preference');
};

function render() {
  DOM.app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'container fade-in';
  
  if (state.view === 'intro') container.appendChild(renderIntro());
  if (state.view === 'district') container.appendChild(renderDistrict());
  if (state.view === 'preference') container.appendChild(renderPreference());
  if (state.view === 'blind') container.appendChild(renderBlind());
  if (state.view === 'loading') {
      container.appendChild(renderLoading());
      setTimeout(() => { calculateMatch(); navigate('result'); }, 2500);
  }
  if (state.view === 'result') container.appendChild(renderResult());

  DOM.app.appendChild(container);
  window.scrollTo(0,0);
}

function createEl(tag, className, innerHTML = '') {
  const el = document.createElement(tag);
  if(className) el.className = className;
  if(innerHTML) el.innerHTML = innerHTML;
  return el;
}

function renderIntro() {
  const wrapper = createEl('div', 'view-wrapper intro-view center-all');
  wrapper.innerHTML = `
    <div class="hero">
      <div class="badge">Poly Fit x 2026 선거 핏팅</div>
      <h1>진주시 지역 맞춤형<br><span class="highlight">정치 매칭 앱, Poly Fit</span></h1>
      <p>얼굴과 당적에 속지 마세요.<br>나의 가치관과 거주지에 꼭 맞는 진짜 후보를 찾아드립니다.</p>
    </div>
  `;
  const btn = createEl('button', 'btn-primary mt-2', '초정밀 테스트 시작하기');
  btn.onclick = () => navigate('district');
  wrapper.appendChild(btn);
  return wrapper;
}

function renderDistrict() {
  const wrapper = createEl('div', 'view-wrapper slide-up center-all');
  
  // Poly Fit 네이밍에 맞는 다각형(Polygon) 스타일 SVG 진주시 지도 삽입
  wrapper.innerHTML = `
    <h2>Poly Fit 진주시<br>거주 구역 터치</h2>
    <p>본인의 읍/면/동이 위치한 블록을 지도에서 골라주세요.</p>
    <div class="map-container">
      <svg viewBox="-10 -10 130 110" xmlns="http://www.w3.org/2000/svg" class="jinju-svg">
        <g class="jinju-path" onclick="selectRegion('북부권 (명석/대곡/미천)')">
          <path d="M 50 0 L 80 15 L 65 35 L 35 35 L 20 15 Z" />
          <text x="50" y="22" text-anchor="middle" class="jinju-label">북부권</text>
        </g>
        <g class="jinju-path" onclick="selectRegion('서부권 (평거/판문/신안)')">
          <path d="M 20 15 L 35 35 L 30 65 L 0 50 Z" />
          <text x="18" y="42" text-anchor="middle" class="jinju-label">서부권</text>
        </g>
        <g class="jinju-path" onclick="selectRegion('혁신도시 (충무공/금산)')">
          <path d="M 65 35 L 90 40 L 85 70 L 60 55 Z" />
          <text x="75" y="55" text-anchor="middle" class="jinju-label">혁신/금산</text>
        </g>
        <g class="jinju-path" onclick="selectRegion('원도심권 (중앙/상봉/초장)')">
          <path d="M 35 35 L 65 35 L 60 55 L 30 65 Z" />
          <text x="47" y="50" text-anchor="middle" class="jinju-label">원도심</text>
        </g>
        <g class="jinju-path" onclick="selectRegion('남부권 (가호/천전/내동)')">
          <path d="M 0 50 L 30 65 L 60 55 L 45 90 L 10 85 Z" />
          <text x="32" y="73" text-anchor="middle" class="jinju-label">남부/가호</text>
        </g>
        <g class="jinju-path" onclick="selectRegion('동부외곽 (진성/이반성)')">
          <path d="M 90 40 L 115 45 L 95 85 L 85 70 Z" />
          <text x="96" y="62" text-anchor="middle" class="jinju-label">동부외곽</text>
        </g>
      </svg>
    </div>
  `;
  return wrapper;
}

function renderPreference() {
  const wrapper = createEl('div', 'view-wrapper slide-up');
  const qInfo = questions[state.currentPrefQuestion];
  
  wrapper.innerHTML = `
    <div class="step-indicator">가치관 파악 질문 ${state.currentPrefQuestion + 1} / ${questions.length}</div>
    <h2 class="q-title">${qInfo.title}</h2>
  `;
  const optionsList = createEl('div', 'options-list');
  const shuffledOps = [...qInfo.options].sort(() => 0.5 - Math.random());

  shuffledOps.forEach((opt, idx) => {
    const btn = createEl('button', 'option-btn', opt.text);
    btn.style.animationDelay = `${idx * 0.1}s`;
    btn.onclick = () => {
      state.preferences[opt.category] += 10;
      if (state.currentPrefQuestion < questions.length - 1) {
        state.currentPrefQuestion++; navigate('preference');
      } else { navigate('blind'); }
    };
    optionsList.appendChild(btn);
  });
  
  wrapper.appendChild(optionsList);
  return wrapper;
}

function renderBlind() {
  const wrapper = createEl('div', 'view-wrapper slide-up');
  const cat = categories[state.currentBlindCat];
  
  wrapper.innerHTML = `
    <div class="step-indicator">Poly Fit 스피드게임 ${state.currentBlindCat + 1} / ${categories.length}</div>
    <div class="cat-badge">${cat.icon} ${cat.name} 핵심 공약</div>
    <h2 class="q-title">다음 중 가장 진주시에 필요하다고 생각되는 공약은?</h2>
    <p class="subtitle">후보자의 당적, 이름은 완전히 블라인드 처리되었습니다.</p>
  `;
  
  const pledgeList = createEl('div', 'pledge-list');
  let cands = [...candidates].sort(() => 0.5 - Math.random());
  
  cands.forEach((cand, idx) => {
    const card = createEl('div', 'pledge-card');
    card.style.animationDelay = `${idx * 0.15}s`;
    card.innerHTML = `<div class="pledge-text">"${cand.pledges[cat.id]}"</div>`;
    card.onclick = () => {
      const weight = state.preferences[cat.id];
      state.candidateScores[cand.id] += weight;
      if (state.currentBlindCat < categories.length - 1) {
        state.currentBlindCat++; navigate('blind');
      } else { navigate('loading'); }
    }
    pledgeList.appendChild(card);
  });
  
  wrapper.appendChild(pledgeList);
  return wrapper;
}

function renderLoading() {
  const wrapper = createEl('div', 'view-wrapper center-all fade-in mt-2');
  wrapper.innerHTML = `
    <br><br><br><div class="loader"></div>
    <h2 style="font-size: 1.8rem; margin-top: 1rem;">진주시 정책 알고리즘 분석 중...</h2>
    <p>나의 가치관과 진주시장 유력 후보군 간의 Poly Fit(매칭)을 계산합니다</p>
  `;
  return wrapper;
}

function calculateMatch() {
  const totalWeight = Object.values(state.preferences).reduce((sum, weight) => sum + weight, 0);
  state.finalRank = candidates.map(c => {
    const matchScore = state.candidateScores[c.id];
    let matchPercent = Math.round((matchScore / totalWeight) * 100);
    return { ...c, matchRate: matchPercent };
  }).sort((a,b) => b.matchRate - a.matchRate);
}

function renderResult() {
  const wrapper = createEl('div', 'view-wrapper slide-up result-view center-all');
  const topCandidate = state.finalRank[0];
  
  wrapper.innerHTML = `
    <div class="match-header">
      <div class="confetti">🎉</div>
      <h3 style="color: #cbd5e1; font-size: 1.2rem;">${state.district} 주민과 가장 Poly Fit🔥한 정치인은</h3>
    </div>
    <div class="result-card glass mt-2">
      <div class="match-rate">최종 일치율 <span>${topCandidate.matchRate}</span>%</div>
      <div class="party-badge">${topCandidate.party}</div>
      <h1 class="cand-name">${topCandidate.name} <span class="cand-title">후보</span></h1>
      <p class="cand-bio">${topCandidate.bio}</p>
      <div class="cand-desc">"${topCandidate.desc}"</div>
    </div>
    <h3 class="other-title">다른 진주시장 후보군과의 일치율</h3>
    <div class="other-list">
      ${state.finalRank.slice(1).map(c => `
        <div class="other-cand">
          <div class="other-info"><span class="other-party">${c.party}</span><span class="other-name">${c.name} 후보</span></div>
          <div class="other-rate">${c.matchRate}%</div>
        </div>
      `).join('')}
    </div>
    <button class="btn-primary" style="margin-bottom: 1rem;" onclick="location.reload()">새로운 기준으로 핏팅해보기</button>
  `;
  return wrapper;
}

document.addEventListener('DOMContentLoaded', render);
if (document.readyState === 'interactive' || document.readyState === 'complete') render();
