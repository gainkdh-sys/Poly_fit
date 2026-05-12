/**
 * 2단계 블라인드 매칭 알고리즘 순수 함수
 * @param {Array} prefAnswers - 1단계 가치관 답변 { category, score }
 * @param {Array} blindAnswers - 2단계 블라인드 평가 { candId, catId, score }
 * @param {Array} candidates - 해당 선거구의 필터링된 후보자 배열
 * @param {Object} coreData - 카테고리 그룹 정보가 포함된 코어 데이터
 * @returns {Array} - 매치율 계산 및 정렬된 결과 후보자 리스트
 */
export function calculateMatch(prefAnswers, blindAnswers, candidates, coreData) {
  // 1. 카테고리 ID -> 그룹 ID 맵 생성
  const catToGroup = coreData.categories.reduce((acc, cat) => {
    acc[cat.id] = cat.group;
    return acc;
  }, {});

  // 2. 가치관 가중치 합산 (그룹별 누적 점수)
  const groupWeights = prefAnswers.reduce((acc, curr) => {
    const groupId = catToGroup[curr.category];
    if (groupId) {
      acc[groupId] = (acc[groupId] || 0) + curr.score;
    }
    return acc;
  }, {});

  const scoreMap = {};
  const maxScoreMap = {};
  candidates.forEach(c => {
    scoreMap[c.id] = 0;
    maxScoreMap[c.id] = 0;
  });

  // 3. 블라인드 공감도 연산 (각 후보 공약에 준 동의도 × 관심사 가중치)
  blindAnswers.forEach(ans => {
    const groupId = catToGroup[ans.catId];
    const weight = groupWeights[groupId] || 0;
    const agreementScore = Number(ans.score) || 0;
    
    if (scoreMap[ans.candId] !== undefined) {
      scoreMap[ans.candId] += agreementScore * weight;
      maxScoreMap[ans.candId] += 5 * weight;
    }
  });

  // 4. 후보별 백분율 환산 및 최종 정렬
  return candidates.map(c => {
    const rawScore = scoreMap[c.id] || 0;
    const maxPossibleScore = maxScoreMap[c.id] || 0;
    const matchRate = maxPossibleScore > 0
      ? Math.round((rawScore / maxPossibleScore) * 100)
      : 0;
    return { ...c, matchRate, rawScore };
  }).sort((a, b) => b.matchRate - a.matchRate);
}
