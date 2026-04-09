import Component from '../core/Component.js';
import { Router } from '../core/Router.js';

export default class IntroView extends Component {
  template() {
    return `
      <div class="view-wrapper intro-view center-all">
        <div class="hero mt-2">
          <div class="badge">Poly Fit v5.0 (모듈형 아키텍처)</div>
          <h1>나의 가치관을 관통하는<br><span class="highlight">최적의 블라인드 매칭</span></h1>
          <p>가치관 설문으로 중요도를 파악하고,<br>익명의 블라인드 공약을 골라 최고의 후보를 찾습니다.</p>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.8rem; margin-top:2.5rem;">
          <button id="start-btn" class="btn-primary">🔥 블라인드 매칭 시스템 시작</button>
          <button id="mbti-btn" class="btn-secondary">🧠 정치 MBTI 테스트 (준비 중)</button>
        </div>
      </div>
    `;
  }

  setEvent() {
    this.target.querySelector('#start-btn').addEventListener('click', () => {
      Router.navigate('district');
    });

    this.target.querySelector('#mbti-btn').addEventListener('click', () => {
      alert('정치 MBTI 테스트는 현재 기능 고도화 개발 중입니다! 조금만 기다려주세요.');
    });
  }
}
