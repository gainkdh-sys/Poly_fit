/**
 * 2단계 블라인드 매칭 알고리즘 순수 함수
 * @param {Array} prefAnswers - 1단계 가치관 답변 { category, score }
 * @param {Array} blindAnswers - 2단계 블라인드 선택 { candId, catId }
 * @param {Array} candidates - 해당 선거구의 필터링된 후보자 배열
 * @returns {Array} - 매치율 계산 및 정렬된 결과 후보자 리스트
 */
export function calculateMatch(prefAnswers, blindAnswers, candidates) {
  // 1. 가치관 가중치 합산 (카테고리별 누적 점수)
  const prefs = prefAnswers.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.score;
    return acc;
  }, {});

  const scoreMap = {};
  candidates.forEach(c => scoreMap[c.id] = 0);

  // 2. 블라인드 공감도 연산 (사용자가 고른 공약의 후보에게 해당 카테고리 가중치 부여)
  blindAnswers.forEach(ans => {
    const catWeight = prefs[ans.catId] || 0;
    if (scoreMap[ans.candId] !== undefined) {
      scoreMap[ans.candId] += catWeight;
    }
  });

  // 3. 백분율 환산 및 최종 정렬
  const maxPossibleScore = Object.values(prefs).reduce((a, b) => a + b, 0);

  return candidates.map(c => {
    const rawScore = scoreMap[c.id] || 0;
    const matchRate = maxPossibleScore > 0 
      ? Math.round((rawScore / maxPossibleScore) * 100) 
      : 0;
    return { ...c, matchRate };
  }).sort((a, b) => b.matchRate - a.matchRate);
}
