const ELECTION_LABELS = {
  governor: '광역지방자치단체장',
  superintendent: '시·도 교육감',
  mayor: '기초지방자치단체장',
  provincial_council: '광역지방의회의원',
  city_council: '기초지방의회의원'
};

const ELECTION_DESCRIPTIONS = {
  governor: '시·도 전체 행정을 이끄는 후보',
  superintendent: '지역 교육 정책을 책임지는 후보',
  mayor: '시·군·구 생활 행정을 이끄는 후보',
  provincial_council: '시·도 조례와 예산을 심의하는 후보',
  city_council: '기초자치단체 조례와 예산을 심의하는 후보'
};

const CONSTITUENCY_ELECTIONS = new Set(['provincial_council', 'city_council']);

export const ELECTION_ORDER = [
  'governor',
  'superintendent',
  'mayor',
  'provincial_council',
  'city_council'
];

export function getElectionLabel(electionId) {
  return ELECTION_LABELS[electionId] || '선거';
}

export function getElectionDescription(electionId) {
  return ELECTION_DESCRIPTIONS[electionId] || '블라인드 정책 매칭';
}

export function getElectionDisplayName(electionId, constituency = '') {
  const label = getElectionLabel(electionId);
  return constituency ? `${label} · ${constituency}` : label;
}

export function getCandidateConstituency(candidate) {
  return candidate?.nec?.sggName
    || candidate?.constituencyName
    || candidate?.constituency
    || candidate?.region?.[2]
    || '선거구 미분류';
}

function getConstituencyGroups(candidates) {
  const groups = new Map();

  candidates.forEach((candidate) => {
    const constituency = getCandidateConstituency(candidate);
    const group = groups.get(constituency) || [];
    group.push(candidate);
    groups.set(constituency, group);
  });

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'ko-KR', { numeric: true }));
}

export function getCandidatesForElection(regionData, district, electionId, constituency = '') {
  if (!regionData || !electionId) return [];

  if (electionId === 'governor') return regionData.governor || [];
  if (electionId === 'superintendent') return regionData.superintendent || [];

  const distData = (regionData.districts || {})[district] || {};
  const candidates = distData[electionId] || [];

  if (!constituency || !CONSTITUENCY_ELECTIONS.has(electionId)) {
    return candidates;
  }

  return candidates.filter(candidate => getCandidateConstituency(candidate) === constituency);
}

export function getAvailableElections(regionData, district) {
  if (!regionData) return [];

  const elections = [];

  ELECTION_ORDER.forEach((electionId) => {
    const candidates = getCandidatesForElection(regionData, district, electionId);
    if (candidates.length > 0) {
      if (CONSTITUENCY_ELECTIONS.has(electionId)) {
        getConstituencyGroups(candidates).forEach(([constituency, group]) => {
          elections.push({
            id: electionId,
            name: getElectionLabel(electionId),
            desc: getElectionDescription(electionId),
            count: group.length,
            constituency,
            isConstituencyElection: true
          });
        });
        return;
      }

      elections.push({
        id: electionId,
        name: getElectionLabel(electionId),
        desc: getElectionDescription(electionId),
        count: candidates.length,
        constituency: ''
      });
    }
  });

  return elections;
}

export function getPledgeText(candidate, category) {
  if (!candidate || !category) return '해당 분야 공약 데이터 준비 중';

  return candidate.pledges?.[category.id]
    || candidate.pledges?.[category.group]
    || '해당 분야 공약 데이터 준비 중';
}

export function buildBlindEvaluationQueue(coreData, candidates) {
  if (!coreData || !Array.isArray(candidates)) return [];

  return coreData.categories.flatMap((category) => {
    const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5);

    return shuffledCandidates.map((candidate) => ({
      id: `${category.id}:${candidate.id}`,
      candId: candidate.id,
      catId: category.id,
      catName: category.name,
      group: category.group,
      pledge: getPledgeText(candidate, category)
    }));
  });
}

export function createCampaignSearchUrl(candidate) {
  const query = `${candidate.name} ${candidate.party} ${candidate.region?.join(' ') || ''} 공약`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
