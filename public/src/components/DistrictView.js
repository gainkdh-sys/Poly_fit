import Component from '../core/Component.js';
import { Router } from '../core/Router.js';
import { appStore } from '../core/Store.js';

export default class DistrictView extends Component {
  template() {
    return `
      <div class="view-wrapper slide-up center-all">
        <h2>가장 궁금한 선거가 치러질<br>지역을 검색하세요</h2>
        <p>전국의 읍, 면, 동 단위를 편하게 입력해주세요.<br>(입력된 구역에 맞춰 후보가 자동 필터링됩니다.)</p>
        <div class="search-container mt-2">
          <input type="text" id="district-search" class="search-input" placeholder="예: 가호동, 강남구, 수영구" autocomplete="off">
          <div id="autocomplete-list" class="autocomplete-dropdown"></div>
        </div>
      </div>
    `;
  }

  setEvent() {
    const input = this.target.querySelector('#district-search');
    const list = this.target.querySelector('#autocomplete-list');
    const { locations } = appStore.getState();

    // 입력 시 자동완성 로직
    input.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      list.innerHTML = '';
      
      if (!val) {
        list.classList.remove('active');
        return;
      }
      
      const matches = locations.filter(loc => loc.includes(val)).slice(0, 10); // 최대 10개만 표출
      
      if (matches.length > 0) {
        list.classList.add('active');
        matches.forEach(match => {
          const div = document.createElement('div');
          div.className = 'autocomplete-item';
          div.textContent = match;
          div.onclick = () => {
            appStore.setState({ district: match });
            Router.navigate('preference');
          };
          list.appendChild(div);
        });
      } else {
        list.classList.remove('active');
      }
    });

    // 엔터키 직접 입력 처리
    input.addEventListener('keypress', (e) => {
      if(e.key === 'Enter' && input.value.trim().length > 1) {
        appStore.setState({ district: input.value.trim() + " 일대" });
        Router.navigate('preference');
      }
    });
  }
}
