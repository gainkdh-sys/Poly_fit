export const CATEGORY_GROUPS = [
  { id: 'welfare', name: '복지' },
  { id: 'education', name: '교육' },
  { id: 'transport', name: '교통' },
  { id: 'culture', name: '문화' },
  { id: 'housing', name: '주거' },
  { id: 'environment', name: '산업' }
];

function getCategoryToGroup(coreData) {
  return (coreData?.categories || []).reduce((acc, category) => {
    acc[category.id] = category.group;
    return acc;
  }, {});
}

export function calculatePreferenceGroupWeights(prefAnswers, coreData) {
  const catToGroup = getCategoryToGroup(coreData);
  const groupTotals = CATEGORY_GROUPS.reduce((acc, group) => {
    acc[group.id] = { total: 0, count: 0 };
    return acc;
  }, {});

  (prefAnswers || []).forEach((answer) => {
    const groupId = catToGroup[answer.category];
    if (!groupTotals[groupId]) return;

    groupTotals[groupId].total += Number(answer.score) || 0;
    groupTotals[groupId].count += 1;
  });

  return CATEGORY_GROUPS.reduce((acc, group) => {
    const { total, count } = groupTotals[group.id];
    acc[group.id] = count > 0 ? total / count : 0;
    return acc;
  }, {});
}

export function calculatePreferencePercentages(prefAnswers, coreData) {
  const groupWeights = calculatePreferenceGroupWeights(prefAnswers, coreData);
  const totalWeight = Object.values(groupWeights).reduce((sum, value) => sum + value, 0);

  return CATEGORY_GROUPS.map((group) => {
    const pct = totalWeight > 0 ? (groupWeights[group.id] / totalWeight) * 100 : 0;
    return {
      ...group,
      weight: groupWeights[group.id],
      pct,
      pctLabel: `${pct.toFixed(1)}%`
    };
  });
}
