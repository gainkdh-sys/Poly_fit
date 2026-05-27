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
const PENDING_PLEDGE_MARKERS = [
  '공식 공약 데이터가 선관위에 공개되면',
  '예비후보자 공약 데이터가 선관위에 공개되면',
  '공약 데이터 준비 중',
  '공약 자료 준비 중',
  '개별 공약 공개자료 확인 중',
  '공개자료 확인 후 반영',
  '해당 분야 공약 데이터 준비 중'
];

const PLEDGE_GROUP_KEYWORDS = {
  welfare: ['복지', '돌봄', '의료', '보건', '약자', '청년', '노인', '아동', '여성', '출산', '안전', '먹거리'],
  education: ['교육', '학교', '학생', '대학', '학습', '인재', '학력', '서울런'],
  transport: ['교통', '통근', '철도', '도로', '버스', '지하철', '이동', 'GTX', '노선'],
  culture: ['문화', '예술', '체육', '관광', '한강', '랜드마크', '노들섬', '창작'],
  housing: ['주거', '주택', '재건축', '재개발', '공급', '임대', '전월세', '1인 가구'],
  environment: ['환경', '기후', '탄소', '녹지', '에너지', '산업', '일자리', 'AI', '규제', '노동권', '자원순환']
};

const GROUP_LABELS = {
  welfare: '복지',
  education: '교육',
  transport: '교통',
  culture: '문화',
  housing: '주거',
  environment: '산업'
};

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
  if (!candidate || !category) return '';

  const directPledge = candidate.pledges?.[category.id] || candidate.pledges?.[category.group];
  if (directPledge && !isPendingPledgeText(directPledge)) {
    return directPledge;
  }

  return '';
}

function isPendingPledgeText(text) {
  const value = String(text || '').trim();
  return !value || PENDING_PLEDGE_MARKERS.some(marker => value.includes(marker));
}

function formatPledgeItem(item) {
  const title = String(item?.title || '').trim();
  const content = String(item?.content || '').trim();

  if (!title && !content) return '';
  if (!content || content === title || content.includes(title)) return title || content;
  return `${title} - ${content}`;
}

function getFirstCategoryByGroup(categories) {
  return categories.reduce((acc, category) => {
    if (!acc[category.group]) {
      acc[category.group] = category;
    }
    return acc;
  }, {});
}

function inferPledgeGroupFromText(text) {
  const value = String(text || '');
  const matched = Object.entries(PLEDGE_GROUP_KEYWORDS).find(([, keywords]) => (
    keywords.some(keyword => value.includes(keyword))
  ));

  return matched?.[0] || 'environment';
}

function inferPledgeGroup(realm, pledge) {
  const realmText = String(realm || '');
  if (realmText) {
    const realmGroup = inferPledgeGroupFromText(realmText);
    if (realmGroup !== 'environment' || /환경|기후|탄소|녹지|에너지|산업|일자리|AI|규제|노동권|자원순환/.test(realmText)) {
      return realmGroup;
    }
  }

  return inferPledgeGroupFromText(pledge);
}

function categoryForGroup(coreData, group) {
  const firstByGroup = getFirstCategoryByGroup(coreData.categories || []);
  return firstByGroup[group] || {
    id: group,
    group,
    name: GROUP_LABELS[group] || '정책'
  };
}

function buildOfficialPledgeItems(coreData, candidate) {
  const seen = new Set();
  const queueItems = [];

  (candidate.pledgeItems || []).forEach((item, index) => {
    const pledge = formatPledgeItem(item);
    if (isPendingPledgeText(pledge) || seen.has(pledge)) return;

    const group = inferPledgeGroup(item.realm, pledge);
    const category = categoryForGroup(coreData, group);
    seen.add(pledge);
    queueItems.push({
      id: `pledge:${candidate.id}:${index}`,
      candId: candidate.id,
      catId: category.id,
      catName: category.name,
      group: category.group,
      pledge,
      sourceLabel: getPledgeSourceLabel(candidate)
    });
  });

  if (queueItems.length > 0) return queueItems;

  return Object.entries(candidate.pledges || {}).reduce((items, [group, pledge]) => {
    if (isPendingPledgeText(pledge) || seen.has(pledge)) return items;

    const category = categoryForGroup(coreData, group);
    seen.add(pledge);
    items.push({
      id: `pledge:${candidate.id}:${group}`,
      candId: candidate.id,
      catId: category.id,
      catName: category.name,
      group: category.group,
      pledge,
      sourceLabel: getPledgeSourceLabel(candidate)
    });
    return items;
  }, []);
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
    nec_official_brochure: '선관위 공식 공약·선거공보',
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
      })).filter(item => !isPendingPledgeText(item.pledge));
    }).sort(() => Math.random() - 0.5);
  }

  const officialQueue = candidates.flatMap(candidate => buildOfficialPledgeItems(coreData, candidate));

  if (officialQueue.length > 0) {
    return officialQueue.sort(() => Math.random() - 0.5);
  }

  const queue = coreData.categories.flatMap((category) => (
    candidates.map((candidate) => ({
      id: `${category.id}:${candidate.id}`,
      candId: candidate.id,
      catId: category.id,
      catName: category.name,
      group: category.group,
      pledge: getPledgeText(candidate, category),
      sourceLabel: getPledgeSourceLabel(candidate)
    })).filter(item => !isPendingPledgeText(item.pledge))
  ));

  // 전체 질문을 완벽히 무작위로 섞어 동일 카테고리나 질문이 연속 노출되는 피로도를 차단
  return queue.sort(() => Math.random() - 0.5);
}

export function createCampaignSearchUrl(candidate) {
  const query = `${candidate.name} ${candidate.party} ${candidate.region?.join(' ') || ''} 공약`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
