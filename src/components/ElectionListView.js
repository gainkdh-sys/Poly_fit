import Component from '../core/component.js';
import { Router } from '../core/router.js';
import { appStore } from '../core/store.js';

export default class ElectionListView extends Component {
  template() {
    const { district, coreData } = appStore.getState();
    const electionsHtml = coreData.electionsList.map((elec, idx) => `
      <div class="election-card slide-up" style="animation-delay: ${idx * 0.08}s" data-id="${elec.id}">
        <div>
          <div class="election-title">${elec.name}</div>
          <div class="election-desc">후보자 리스트 호출 및 블라인드 매칭</div>
        </div>
        <div class="election-arrow">→</div>
      </div>
    `).join('');

    return `
      <div class="view-wrapper slide-up">
        <h2>${district}<br>선거 종류를 고르세요!</h2>
        <p>아래 메뉴 중 하나를 탭하시면 <b>입력하신 지역에 맞는 실제 출마 선언자</b>들의 공약이 셔플되어 나타납니다.</p>
        <div class="election-grid mt-2">
          ${electionsHtml}
        </div>
      </div>
    `;
  }

  setEvent() {
    const { district, candidates } = appStore.getState();

    this.target.querySelectorAll('.election-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const elecId = e.currentTarget.dataset.id;
        const elecName = e.currentTarget.querySelector('.election-title').textContent;

        // 선택 시 미리 지역별 후보자가 존재하는지 검사 (필터링 로직 강화)
        const targetCands = candidates.filter(c => {
          return c.electionType === elecId && 
                 c.region.some(r => district.includes(r));
        });

        if (targetCands.length === 0) {
          alert(`알림: 현재 입력하신 지역(${district})의 [${elecName}] 부문에는 아직 선관위에 공식 등록(또는 언론 유력 조사)된 출마 예정자 명단이 없습니다.\n다른 선거를 선택해 주세요.`);
          return;
        }

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
