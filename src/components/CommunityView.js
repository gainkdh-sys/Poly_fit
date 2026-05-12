import Component from '../core/component.js';
import { escapeHtml, getFromLocalStorage, saveToLocalStorage } from '../utils/helpers.js';

const STORAGE_KEY = 'polyfit_community_posts';
const BLOCKED_WORDS = ['바보', '멍청', '욕설', '비방'];

function hasBlockedWord(text) {
  const normalized = text.replace(/\s/g, '').toLowerCase();
  return BLOCKED_WORDS.some(word => normalized.includes(word));
}

export default class CommunityView extends Component {
  setup() {
    this.posts = getFromLocalStorage(STORAGE_KEY, [
      {
        topic: '교통',
        body: '후보별 대중교통 공약은 비용보다 실제 노선 개선 여부를 같이 봐야 한다고 생각합니다.',
        createdAt: new Date().toISOString()
      },
      {
        topic: '주거',
        body: '재건축 속도와 세입자 보호를 동시에 설명하는 공약을 더 쉽게 비교하고 싶습니다.',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  template() {
    const postsHtml = this.posts.map(post => `
      <article class="community-post">
        <div class="post-meta">
          <strong>${escapeHtml(post.topic)}</strong>
          <span>익명</span>
        </div>
        <p>${escapeHtml(post.body)}</p>
      </article>
    `).join('');

    return `
      <div class="view-wrapper slide-up">
        <div class="step-indicator">익명 정책 게시판</div>
        <h2>정책 기준으로<br>의견을 나눠보세요</h2>

        <section class="community-form">
          <label class="field-label" for="post-topic">주제</label>
          <select id="post-topic" class="select-input">
            <option>복지</option>
            <option>교육</option>
            <option>교통</option>
            <option>문화</option>
            <option>주거</option>
            <option>산업·환경</option>
          </select>
          <label class="field-label" for="post-body">의견</label>
          <textarea id="post-body" class="feedback-textarea" rows="5" placeholder="정책에 대한 의견을 남겨 주세요."></textarea>
          <button id="post-submit" class="btn-primary" type="button">글 작성</button>
          <p id="post-status" class="form-status" aria-live="polite"></p>
        </section>

        <section class="result-section">
          <h3>최근 토론</h3>
          <div class="community-list">
            ${postsHtml}
          </div>
        </section>
      </div>
    `;
  }

  setEvent() {
    this.target.querySelector('#post-submit')?.addEventListener('click', () => {
      const topic = this.target.querySelector('#post-topic').value;
      const bodyInput = this.target.querySelector('#post-body');
      const status = this.target.querySelector('#post-status');
      const body = bodyInput.value.trim();

      if (body.length < 5) {
        status.textContent = '의견을 5자 이상 입력해 주세요.';
        status.className = 'form-status warn';
        return;
      }

      if (hasBlockedWord(body)) {
        status.textContent = '부적절한 표현이 포함되어 등록할 수 없습니다.';
        status.className = 'form-status warn';
        return;
      }

      this.posts = [
        { topic, body, createdAt: new Date().toISOString() },
        ...this.posts
      ].slice(0, 20);

      saveToLocalStorage(STORAGE_KEY, this.posts);
      this.render();
      this.setEvent();
    });
  }
}
