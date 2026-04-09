import Component from '../core/Component.js';
import { Router } from '../core/Router.js';
import { appStore } from '../core/Store.js';

export default class ResultView extends Component {
  template() {
    const { finalRank, selectedElectionId, isResultRevealed, coreData } = appStore.getState();
    const elecName = coreData.electionsList.find(e => e.id === selectedElectionId)?.name || '선거';

    if (finalRank.length === 0) {
      return `
        <div class="view-wrapper center-all mt-2">
          <h2>후보가 없습니다.</h2>
          <button id="restart-btn" class="btn-primary mt-2">처음으로</button>
        </div>
      `;
    }

    const topC = finalRank[0];

    // 결과 락(Lock) 화면
    if (!isResultRevealed) {
      return `
        <div class="view-wrapper slide-up result-view center-all">
          <h2 style="margin-top:2rem;">알고리즘 연산 완료!</h2>
          <p>나의 가치관과 공약을 매칭한<br>[${elecName}] 최종 순위가 도출되었습니다.</p>
          <div class="result-hidden mt-2">
            <div class="result-lock-icon">🔒</div>
            <h3 style="color:var(--text); margin-bottom:1.5rem;">과연 1위 후보는 누구일까요?</h3>
            <button class="btn-primary" id="btn-reveal">나의 가치관 랭킹 오픈하기</button>
          </div>
        </div>
      `;
    }

    // 결과 공개 화면
    const otherCandsHtml = finalRank.slice(1).map((c, idx) => `
      <div class="other-cand">
        <div style="display:flex; align-items:center; gap:0.8rem;">
          <img src="${c.imageUrl}" class="other-profile" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=f1f5f9&color=475569&size=128'">
          <div class="other-info">
            <span style="font-size:0.8rem; font-weight:800; color:var(--primary);">순위 ${idx + 2}</span>
            <span class="other-name">${c.name} <span style="font-size:0.8rem;font-weight:600;color:gray;">(${c.party})</span></span>
          </div>
        </div>
        <div class="other-rate">${c.matchRate}%</div>
      </div>
    `).join('');

    return `
      <div class="view-wrapper slide-up result-view center-all">
        <div class="match-header fade-in">
          <div class="confetti">🎉</div>
          <h3 style="color: var(--primary); font-size: 1.1rem; font-weight: 800; margin-bottom: 0.5rem;">[${elecName}] 부문 나의 첫 번째 픽!</h3>
        </div>
        
        <div class="result-card mt-2 slide-up">
          <div class="match-rate">최종 핏팅률 <span>${topC.matchRate}%</span></div>
          <div class="result-card-header" style="display:flex; flex-direction:column; align-items:center; margin-top:1rem;">
            <img src="${topC.imageUrl}" alt="프로필" class="cand-profile" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(topC.name)}&background=f1f5f9&color=475569&size=128'">
            <div class="party-badge">${topC.party}</div>
            <h1 class="cand-name">${topC.name}</h1>
            <p class="cand-bio">${topC.bio}</p>
          </div>
          <div style="background:#f1f5f9; padding:1rem; border-radius:12px; font-size:0.9rem; margin-top:1rem;">"${topC.desc || '혁신적인 시정으로 보답하겠습니다.'}"</div>
        </div>
        
        ${finalRank.length > 1 ? `
        <h3 class="other-title slide-up" style="margin-top:2rem; font-size:1.1rem; text-align:left;">상세 순위표 (2~${finalRank.length}위)</h3>
        <div class="other-list slide-up">
          ${otherCandsHtml}
        </div>` : ''}
        
        <div class="slide-up" style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom: 2rem; margin-top:1.5rem; width:100%;">
          <button id="try-other-btn" class="btn-primary">동일 구역의 다른 선거 또 해보기</button>
          <button id="restart-btn" class="btn-secondary">처음부터 다시하기 (질문 초기화)</button>
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
      // view 자체는 유지하므로 수동 리렌더링 (또는 Router.navigate('result'))
      this.render();
    });

    this.target.querySelector('#try-other-btn')?.addEventListener('click', () => {
      appStore.setState({ blindAnswers: [], isResultRevealed: false });
      Router.navigate('electionList');
    });
  }
}
