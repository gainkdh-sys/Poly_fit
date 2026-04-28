/**
 * Poly Fit v5.0 네비게이션 라우팅 유틸리티
 */
import { appStore } from './store.js';

export const Router = {
  // 화면 전환 (히스토리 스택 관리 등)
  navigate(viewName) {
    appStore.setState({ view: viewName });
    window.scrollTo(0, 0);
  },

  // 뒤로 가기 공통 로직
  handleBack() {
    const { view, prefAnswers, blindAnswers } = appStore.getState();

    if (view === 'district') {
      // district에서 intro로 돌아가면 광역 선택 상태 초기화
      appStore.setState({ metro: '', district: '', regionData: null });
      this.navigate('intro');
    }
    else if (view === 'preference') {
      if (prefAnswers.length > 0) {
        const nextAnswers = [...prefAnswers];
        nextAnswers.pop();
        appStore.setState({ prefAnswers: nextAnswers });
        this.navigate('preference');
      } else {
        this.navigate('district');
      }
    }
    else if (view === 'prefSummary') {
      const nextAnswers = [...prefAnswers];
      nextAnswers.pop(); // 마지막 문제 다시 풀기
      appStore.setState({ prefAnswers: nextAnswers });
      this.navigate('preference');
    }
    else if (view === 'electionList') this.navigate('prefSummary');
    else if (view === 'blindPledge') {
      if (blindAnswers.length > 0) {
        const nextBlind = [...blindAnswers];
        nextBlind.pop();
        appStore.setState({ blindAnswers: nextBlind });
        this.navigate('blindPledge');
      } else {
        this.navigate('electionList');
      }
    }
    else if (view === 'result') {
      appStore.setState({ blindAnswers: [], isResultRevealed: false });
      this.navigate('electionList');
    }
  }
};
