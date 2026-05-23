import Component from '../core/component.js';
import { Router } from '../core/router.js';

export default class IntroView extends Component {
  template() {
    return `
      <div class="view-wrapper intro-view center-all">
        <div class="hero mt-2">
          <div class="badge">2026 지방선거 정책 매칭</div>
          <h1>Poly-Fit</h1>
          <p>블라인드 처리된 정책을 보고 맞춤 후보자를 추천할게요!</p>
        </div>
        <div class="intro-action-stack">
          <button id="start-btn" class="btn-primary">블라인드 정책 매칭 시작</button>
          <button id="learning-btn" class="btn-secondary">정치 학습 센터</button>
          <button id="community-btn" class="btn-secondary">익명 정책 게시판</button>
          <button id="mbti-btn" class="btn-ghost">정치 MBTI 테스트 열기</button>
        </div>
      </div>
    `;
  }

  setEvent() {
    this.target.querySelector('#start-btn').addEventListener('click', () => {
      Router.navigate('district');
    });

    this.target.querySelector('#learning-btn').addEventListener('click', () => {
      Router.navigate('learning');
    });

    this.target.querySelector('#community-btn').addEventListener('click', () => {
      Router.navigate('community');
    });

    this.target.querySelector('#mbti-btn').addEventListener('click', () => {
      window.location.href = 'https://political-mbti.vercel.app/';
    });
  }
}
