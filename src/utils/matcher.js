/**
 * 2단계 블라인드 매칭 알고리즘 순수 함수
 * @param {Array} prefAnswers - 1단계 가치관 답변 { category, score }
 * @param {Array} blindAnswers - 2단계 블라인드 선택 { candId, catId }
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
  candidates.forEach(c => scoreMap[c.id] = 0);

  // 3. 블라인드 공감도 연산 (사용자가 고른 공약의 후보에게 해당 그룹의 가중치 부여)
  blindAnswers.forEach(ans => {
    const groupId = catToGroup[ans.catId];
    const weight = groupWeights[groupId] || 0;
    
    if (scoreMap[ans.candId] !== undefined) {
      scoreMap[ans.candId] += weight;
    }
  });

  // 4. 백분율 환산 및 최종 정렬
  // 이론적 최대 점수: 각 블라인드 답변(12개)에 대해 해당 카테고리가 속한 그룹의 가중치를 얻었을 때의 합
  const maxPossibleScore = blindAnswers.reduce((acc, ans) => {
    const groupId = catToGroup[ans.catId];
    return acc + (groupWeights[groupId] || 0);
  }, 0);

  return candidates.map(c => {
    const rawScore = scoreMap[c.id] || 0;
    const matchRate = maxPossibleScore > 0 
      ? Math.round((rawScore / maxPossibleScore) * 100) 
      : 0;
    return { ...c, matchRate };
  }).sort((a, b) => b.matchRate - a.matchRate);
}
