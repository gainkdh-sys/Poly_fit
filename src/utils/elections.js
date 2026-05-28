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

const METRO_NAME_TO_SLUG = {
  서울특별시: 'seoul',
  부산광역시: 'busan',
  대구광역시: 'daegu',
  인천광역시: 'incheon',
  광주광역시: 'gwangju',
  대전광역시: 'daejeon',
  울산광역시: 'ulsan',
  세종특별자치시: 'sejong',
  경기도: 'gyeonggi',
  강원특별자치도: 'gangwon',
  충청북도: 'chungbuk',
  충청남도: 'chungnam',
  전북특별자치도: 'jeonbuk',
  전라남도: 'jeonnam',
  경상북도: 'gyeongbuk',
  경상남도: 'gyeongnam',
  제주특별자치도: 'jeju'
};

const PLAIN_LANGUAGE_REPLACEMENTS = [
  ['정당정책:', ''],
  ['균형발전 행정·재정 기반 구축', '지역 간 격차를 줄이기 위한 예산과 행정 지원'],
  ['지방 핵심산업 육성', '지역의 주요 산업과 일자리 키우기'],
  ['지방 생활기반시설', '동네 생활시설'],
  ['생활기반시설', '동네 생활시설'],
  ['광역·도시철도', '지역 간 철도와 도시철도'],
  ['BRT·광역버스', '빠른 버스와 광역버스'],
  ['저출생·고령화 대응', '아이 키우기와 어르신 지원'],
  ['지역 필수의료', '가까운 병원과 응급의료'],
  ['반값 전세', '전세 비용을 낮추는 정책'],
  ['월세 세액공제', '월세 세금 혜택'],
  ['재개발·재건축 정상화', '낡은 동네와 아파트 정비 절차 개선'],
  ['디딤돌소득', '소득이 적은 가구 지원'],
  ['생애주기 맞춤형', '나이와 상황에 맞춘'],
  ['지역 의료격차 해소', '지역마다 다른 의료 접근성 차이를 줄이기'],
  ['단계적 무상교통', '교통비를 단계적으로 낮추거나 무료화'],
  ['생활권 공공교통', '동네에서 이용하기 쉬운 대중교통'],
  ['지역공공재생에너지', '지역이 함께 만드는 재생에너지'],
  ['자원순환', '재활용과 쓰레기 줄이기'],
  ['기후위기 대응', '폭염·폭우와 탄소 배출에 대비'],
  ['지역공공 통합돌봄', '동네에서 의료·돌봄을 함께 받는 체계'],
  ['사회권', '기본적인 생활 권리'],
  ['대중교통 그린 캐시백', '대중교통 이용 보상'],
  ['광역교통망', '지역 사이를 잇는 교통망'],
  ['지방정부형 기본소득', '지자체가 주는 기본소득'],
  ['공공서비스 보편 보장', '누구나 기본 공공서비스를 이용하게 보장'],
  ['토지세·탄소세 배당', '토지와 탄소 배출 세금을 주민에게 돌려주는 정책'],
  ['재생에너지 공유부 배당', '재생에너지 수익을 주민과 나누는 정책'],
  ['공정임대료제', '임대료가 지나치게 오르지 않게 관리'],
  ['교통권', '이동할 권리'],
  ['에너지 기본권', '기본적인 에너지 사용을 보장받을 권리'],
  ['계속거주권', '세입자가 오래 살 수 있게 보호하는 권리'],
  ['농어촌 무상공공버스', '농어촌 버스비를 무료로 낮추는 정책'],
  ['AI 불평등과 고용불안', 'AI 때문에 생길 수 있는 일자리 불안과 격차'],
  ['소득보장·일자리보장', '소득과 일자리를 함께 지키기'],
  ['의료 데이터 디지털화', '병원 정보를 디지털로 관리'],
  ['종교사학 자율성', '종교계 학교 운영의 자율성'],
  ['미래산업 육성', '미래산업 키우기'],
  ['산업 육성', '산업 키우기'],
  ['인프라', '기반시설'],
  ['추진합니다', '진행하겠습니다'],
  ['구축합니다', '만들겠습니다'],
  ['확충합니다', '늘리겠습니다'],
  ['육성합니다', '키우겠습니다'],
  ['보장합니다', '지키겠습니다']
];

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

function getMetroSlug(candidate, context = {}) {
  return context.metro
    || METRO_NAME_TO_SLUG[candidate?.region?.[0]]
    || candidate?.metroSlug
    || '';
}

function getRegionalPartyConfig(candidate, context = {}) {
  if (!candidate || candidate.pledgeSource !== 'party_policy') return null;

  const metroSlug = getMetroSlug(candidate, context);
  const regionalParties = context.partyPolicyFallbacks?.regionalParties || {};
  return regionalParties[metroSlug]?.[candidate.party] || null;
}

function getRegionalPledges(candidate, context = {}) {
  return getRegionalPartyConfig(candidate, context)?.pledges || null;
}

export function toPlainPledgeText(text) {
  let value = String(text || '').replace(/\s+/g, ' ').trim();

  PLAIN_LANGUAGE_REPLACEMENTS.forEach(([from, to]) => {
    value = value.split(from).join(to);
  });

  return value
    .replace(/키우기을/g, '키우는 일을')
    .replace(/지원과 지역/g, '지원, 지역')
    .replace(/대비을/g, '대비를')
    .replace(/권리을/g, '권리를')
    .replace(/체계을/g, '체계를')
    .replace(/조성을 진행하겠습니다/g, '조성하겠습니다')
    .replace(/보장을 진행하겠습니다/g, '보장하겠습니다')
    .replace(/강화를 진행하겠습니다/g, '강화하겠습니다')
    .replace(/확충을 진행하겠습니다/g, '늘리겠습니다')
    .replace(/발굴하고 진행하겠습니다/g, '찾아 실행하겠습니다')
    .replace(/\s*및\s*/g, '와 ')
    .replace(/\s*등\s*/g, ' 등 ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[:：\s]+/, '')
    .trim();
}

function normalizePledgeSignature(text) {
  return toPlainPledgeText(text)
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .replace(/하겠습니다|합니다|추진|확대|강화|지원|구축/g, '')
    .toLowerCase();
}

export function getPledgeText(candidate, category, context = {}) {
  if (!candidate || !category) return '';

  const regionalPledges = getRegionalPledges(candidate, context);
  const directPledge = regionalPledges?.[category.id]
    || regionalPledges?.[category.group]
    || candidate.pledges?.[category.id]
    || candidate.pledges?.[category.group];

  if (directPledge && !isPendingPledgeText(directPledge)) {
    return toPlainPledgeText(directPledge);
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
  if (!content || content === title || content.includes(title)) return toPlainPledgeText(title || content);
  return toPlainPledgeText(`${title} - ${content}`);
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

function buildOfficialPledgeItems(coreData, candidate, context = {}) {
  const seen = new Set();
  const queueItems = [];

  (candidate.pledgeItems || []).forEach((item, index) => {
    const pledge = formatPledgeItem(item);
    const signature = normalizePledgeSignature(pledge);
    if (isPendingPledgeText(pledge) || seen.has(signature)) return;

    const group = inferPledgeGroup(item.realm, pledge);
    const category = categoryForGroup(coreData, group);
    seen.add(signature);
    queueItems.push({
      id: `pledge:${candidate.id}:${index}`,
      candId: candidate.id,
      catId: category.id,
      catName: category.name,
      group: category.group,
      pledge,
      sourceLabel: getPledgeSourceLabel(candidate, context)
    });
  });

  if (queueItems.length > 0) return queueItems;

  return Object.entries(candidate.pledges || {}).reduce((items, [group, pledge]) => {
    const plainPledge = toPlainPledgeText(pledge);
    const signature = normalizePledgeSignature(plainPledge);
    if (isPendingPledgeText(plainPledge) || seen.has(signature)) return items;

    const category = categoryForGroup(coreData, group);
    seen.add(signature);
    items.push({
      id: `pledge:${candidate.id}:${group}`,
      candId: candidate.id,
      catId: category.id,
      catName: category.name,
      group: category.group,
      pledge: plainPledge,
      sourceLabel: getPledgeSourceLabel(candidate, context)
    });
    return items;
  }, []);
}

function getCouncilPolicyCategories(coreData, candidate, context = {}) {
  const categories = coreData.categories || [];
  const firstByGroup = getFirstCategoryByGroup(categories);
  const pledgeGroups = Object.keys(getRegionalPledges(candidate, context) || candidate.pledges || {});
  const groups = [...pledgeGroups, ...COUNCIL_DEFAULT_GROUPS]
    .filter((group, index, all) => group && all.indexOf(group) === index);

  return groups
    .map(group => firstByGroup[group])
    .filter(Boolean)
    .slice(0, COUNCIL_POLICY_LIMIT);
}

function getPledgeSourceLabel(candidate, context = {}) {
  const regionalConfig = getRegionalPartyConfig(candidate, context);
  if (regionalConfig?.sourceLabel) return regionalConfig.sourceLabel;

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

function mergeDuplicateQueueItems(items) {
  const merged = new Map();

  items.forEach((item) => {
    const key = [
      item.group,
      normalizePledgeSignature(item.pledge),
      item.sourceLabel || ''
    ].join(':');
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, {
        ...item,
        candIds: [item.candId],
        mergedCount: 1
      });
      return;
    }

    if (!existing.candIds.includes(item.candId)) {
      existing.candIds.push(item.candId);
      existing.mergedCount += 1;
    }
  });

  return [...merged.values()];
}

export function buildBlindEvaluationQueue(coreData, candidates, context = {}) {
  if (!coreData || !Array.isArray(candidates)) return [];

  const isCouncilElection = candidates.some(candidate => CONSTITUENCY_ELECTIONS.has(candidate.electionType));

  if (isCouncilElection) {
    const queue = candidates.flatMap((candidate) => {
      const categories = getCouncilPolicyCategories(coreData, candidate, context);

      return categories.map((category) => ({
        id: `${category.id}:${candidate.id}`,
        candId: candidate.id,
        catId: category.id,
        catName: category.name,
        group: category.group,
        pledge: getPledgeText(candidate, category, context),
        sourceLabel: getPledgeSourceLabel(candidate, context)
      })).filter(item => !isPendingPledgeText(item.pledge));
    });

    return mergeDuplicateQueueItems(queue).sort(() => Math.random() - 0.5);
  }

  const officialQueue = candidates.flatMap(candidate => buildOfficialPledgeItems(coreData, candidate, context));

  if (officialQueue.length > 0) {
    return mergeDuplicateQueueItems(officialQueue).sort(() => Math.random() - 0.5);
  }

  const queue = coreData.categories.flatMap((category) => (
    candidates.map((candidate) => ({
      id: `${category.id}:${candidate.id}`,
      candId: candidate.id,
      catId: category.id,
      catName: category.name,
      group: category.group,
      pledge: getPledgeText(candidate, category, context),
      sourceLabel: getPledgeSourceLabel(candidate, context)
    })).filter(item => !isPendingPledgeText(item.pledge))
  ));

  // 전체 질문을 완벽히 무작위로 섞어 동일 카테고리나 질문이 연속 노출되는 피로도를 차단
  return mergeDuplicateQueueItems(queue).sort(() => Math.random() - 0.5);
}

export function createCampaignSearchUrl(candidate) {
  const query = `${candidate.name} ${candidate.party} ${candidate.region?.join(' ') || ''} 공약`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
