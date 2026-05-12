import Component from '../core/component.js';

const TERMS = [
  { term: '광역자치단체장', desc: '시·도 전체 행정과 예산 방향을 책임지는 시장 또는 도지사입니다.' },
  { term: '기초자치단체장', desc: '시·군·구의 생활 행정과 지역 사업을 책임지는 시장, 군수, 구청장입니다.' },
  { term: '교육감', desc: '지역의 학교 교육 정책, 예산, 교육 행정을 책임지는 선출직입니다.' },
  { term: '지방의회의원', desc: '지방정부 예산과 조례를 심의하고 행정을 감시하는 대표자입니다.' },
  { term: '공약', desc: '후보자가 당선 뒤 추진하겠다고 유권자에게 약속하는 정책입니다.' },
  { term: '비례대표', desc: '정당 득표율에 따라 의석을 배분하는 대표 방식입니다.' }
];

const VOTING_STEPS = [
  '선거인명부 등재 여부와 투표소 위치를 확인합니다.',
  '신분증을 지참하고 지정 투표소 또는 사전투표소에 방문합니다.',
  '선거별 투표용지를 받아 기표소에서 한 후보 또는 정당을 선택합니다.',
  '투표지를 접어 투표함에 넣고 절차를 마칩니다.'
];

export default class LearningCenterView extends Component {
  template() {
    const termHtml = TERMS.map(item => `
      <article class="learning-term" data-term="${item.term}">
        <h3>${item.term}</h3>
        <p>${item.desc}</p>
      </article>
    `).join('');

    const stepsHtml = VOTING_STEPS.map((step, idx) => `
      <li>
        <span>${idx + 1}</span>
        <p>${step}</p>
      </li>
    `).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">정치 학습 센터</div>
        <h2>선거를 이해하는<br>짧은 기준들</h2>
        <div class="search-container mt-2">
          <input id="term-search" class="search-input" type="search" placeholder="정치 용어 검색" autocomplete="off">
        </div>

        <section class="learning-section">
          <h3>정치 용어 사전</h3>
          <div class="learning-list" id="term-list">
            ${termHtml}
          </div>
        </section>

        <section class="learning-section">
          <h3>지방선거 제도</h3>
          <p>지방선거에서는 광역단체장, 기초단체장, 교육감, 지방의회의원을 함께 뽑습니다. 후보의 역할이 다르므로 같은 공약이라도 권한과 실행 범위를 따져보는 것이 중요합니다.</p>
        </section>

        <section class="learning-section">
          <h3>투표 절차</h3>
          <ol class="voting-steps">
            ${stepsHtml}
          </ol>
        </section>
      </div>
    `;
  }

  setEvent() {
    this.target.querySelector('#term-search')?.addEventListener('input', (e) => {
      const query = e.target.value.replace(/\s/g, '').toLowerCase();

      this.target.querySelectorAll('.learning-term').forEach(card => {
        const term = (card.dataset.term || '').replace(/\s/g, '').toLowerCase();
        const text = card.textContent.replace(/\s/g, '').toLowerCase();
        card.hidden = query.length > 0 && !term.includes(query) && !text.includes(query);
      });
    });
  }
}
