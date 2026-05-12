import Component from '../core/component.js';
import { Router } from '../core/router.js';

export default class IntroView extends Component {
  template() {
    return `
      <div class="view-wrapper intro-view center-all">
        <div class="hero mt-2">
          <div class="badge">2026 지방선거 정책 매칭</div>
          <h1>정당과 이름을 가리고<br><span class="highlight">공약만으로 먼저 판단하세요</span></h1>
          <p>내 관심사의 중요도를 정한 뒤 익명 공약에 동의도를 매기면, 정책 핏이 높은 후보를 보여드립니다.</p>
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
