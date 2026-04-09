/**
 * Poly Fit v5.0 UI 컴포넌트 베이스 클래스
 */
export default class Component {
  constructor(target, props) {
    this.target = target;
    this.props = props;
    this.setup();
    this.render();
    this.setEvent();
  }

  // 초기 로직 (상태 초기화 등)
  setup() {}

  // HTML 템플릿 스트링 반환
  template() {
    return '';
  }

  // DOM 렌더링
  render() {
    this.target.innerHTML = this.template();
    this.mounted();
  }

  // 렌더링 후 DOM 조작 (차트, 외부 라이브러리 연동 등)
  mounted() {}

  // 이벤트 바인딩
  setEvent() {}

  // 상태 변경 및 리렌더링
  update(props) {
    this.props = { ...this.props, ...props };
    this.render();
  }
}
