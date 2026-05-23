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
const COUNCIL_POLICY_LIMIT = 3;
const COUNCIL_DEFAULT_GROUPS = ['welfare', 'transport', 'housing'];

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

function normalizeLookup(value) {
  return String(value || '').replace(/\s/g, '').replace(/["'“”‘’]/g, '');
}

function getLocalConstituencyName(district, constituency) {
  const districtKey = normalizeLookup(district);
  const constituencyKey = normalizeLookup(constituency);
  const withoutDistrict = districtKey && constituencyKey.startsWith(districtKey)
    ? constituencyKey.slice(districtKey.length)
    : constituencyKey;

  return withoutDistrict.endsWith('선거구') ? withoutDistrict : `${withoutDistrict}선거구`;
}

export function getConstituencyDetail(constituencyAreas, metroSlug, district, electionId, constituency) {
  if (!constituencyAreas || !metroSlug || !electionId || !constituency) return null;

  const details = constituencyAreas.regions?.[metroSlug]?.[electionId] || {};
  if (details[constituency]) return details[constituency];

  const constituencyKey = normalizeLookup(constituency);
  const exactKey = Object.keys(details).find(key => normalizeLookup(key) === constituencyKey);
  if (exactKey) return details[exactKey];

  const localName = getLocalConstituencyName(district, constituency);
  const localNameKey = normalizeLookup(localName);
  const districtKey = normalizeLookup(district);
  const localKey = Object.keys(details).find((key) => {
    const detail = details[key];
    const keyMatches = normalizeLookup(key) === localNameKey
      || normalizeLookup(detail.localName) === localNameKey;
    const districtMatches = !districtKey
      || normalizeLookup(detail.committee) === districtKey
      || districtKey.includes(normalizeLookup(detail.committee))
      || normalizeLookup(detail.committee).includes(districtKey);

    return keyMatches && districtMatches;
  });

  return localKey ? details[localKey] : null;
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

function getFirstCategoryByGroup(categories) {
  return categories.reduce((acc, category) => {
    if (!acc[category.group]) {
      acc[category.group] = category;
    }
    return acc;
  }, {});
}

function getCouncilPolicyCategories(coreData, candidate) {
  const categories = coreData.categories || [];
  const firstByGroup = getFirstCategoryByGroup(categories);
  const pledgeGroups = Object.keys(candidate.pledges || {});
  const groups = [...pledgeGroups, ...COUNCIL_DEFAULT_GROUPS]
    .filter((group, index, all) => group && all.indexOf(group) === index);

  return groups
    .map(group => firstByGroup[group])
    .filter(Boolean)
    .slice(0, COUNCIL_POLICY_LIMIT);
}

function getPledgeSourceLabel(candidate) {
  if (candidate?.pledgeSourceLabel) return candidate.pledgeSourceLabel;

  const sourceLabels = {
    nec_official: '선관위 공식 공약',
    party_policy: '정당정책 기반 참고',
    pending_public_search: '공개자료 확인 중',
    pending_nec: '선관위 공약 공개 전'
  };

  return sourceLabels[candidate?.pledgeSource] || '익명 후보 공약';
}

export function buildBlindEvaluationQueue(coreData, candidates) {
  if (!coreData || !Array.isArray(candidates)) return [];

  const isCouncilElection = candidates.some(candidate => CONSTITUENCY_ELECTIONS.has(candidate.electionType));

  if (isCouncilElection) {
    return candidates.flatMap((candidate) => {
      const categories = getCouncilPolicyCategories(coreData, candidate);

      return categories.map((category) => ({
        id: `${category.id}:${candidate.id}`,
        candId: candidate.id,
        catId: category.id,
        catName: category.name,
        group: category.group,
        pledge: getPledgeText(candidate, category),
        sourceLabel: getPledgeSourceLabel(candidate)
      }));
    }).sort(() => Math.random() - 0.5);
  }

  return coreData.categories.flatMap((category) => {
    const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5);

    return shuffledCandidates.map((candidate) => ({
      id: `${category.id}:${candidate.id}`,
      candId: candidate.id,
      catId: category.id,
      catName: category.name,
      group: category.group,
      pledge: getPledgeText(candidate, category),
      sourceLabel: getPledgeSourceLabel(candidate)
    }));
  });
}

export function createCampaignSearchUrl(candidate) {
  const query = `${candidate.name} ${candidate.party} ${candidate.region?.join(' ') || ''} 공약`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
