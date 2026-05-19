import fs from 'node:fs/promises';
import path from 'node:path';

const REGION_CODES = {
  seoul: 'su',
  busan: 'bs',
  daegu: 'dg',
  incheon: 'ic',
  gwangju: 'gj',
  daejeon: 'dj',
  ulsan: 'us',
  sejong: 'sj',
  gyeonggi: 'gg',
  gangwon: 'gw',
  chungbuk: 'cb',
  chungnam: 'cn',
  jeonbuk: 'jb',
  jeonnam: 'jn',
  gyeongbuk: 'gb',
  gyeongnam: 'gn',
  jeju: 'jj'
};

const METROPOLITAN_CITY_SLUGS = new Set([
  'seoul',
  'busan',
  'daegu',
  'incheon',
  'gwangju',
  'daejeon',
  'ulsan',
  'sejong'
]);

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const REGION_DIR = path.join(ROOT, 'data', 'regions');
const OUTPUT_PATH = path.join(ROOT, 'data', 'constituency-areas.json');

const REQUEST_HEADERS = {
  'user-agent': 'PolyFit constituency area sync (contact: github.com/gainkdh-sys/Poly_fit)'
};

const LOCAL_CONSTITUENCY_ORDER = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'];
const SEJONG_SOURCE_URL = 'https://council.sejong.go.kr/cms/mntsMmbrSimpleViewer.do?mntsId=6721&var08=MBR000083';
const SEJONG_CONSTITUENCIES = [
  ['세종특별자치시제1선거구', '조치원읍(원리, 상리, 평리, 교리, 정리, 명리, 남리, 침산리, 신안리, 서창리)'],
  ['세종특별자치시제2선거구', '조치원읍(신흥리, 죽림리, 번암리, 봉산리)'],
  ['세종특별자치시제3선거구', '부강면, 금남면, 대평동'],
  ['세종특별자치시제4선거구', '연기면, 연동면, 해밀동(산울동, 한별동, 누리동 포함)'],
  ['세종특별자치시제5선거구', '연서면, 전의면, 전동면, 소정면'],
  ['세종특별자치시제6선거구', '장군면, 한솔동(가람동 포함)'],
  ['세종특별자치시제7선거구', '도담동'],
  ['세종특별자치시제8선거구', '어진동, 나성동(세종동 포함)'],
  ['세종특별자치시제9선거구', '아름동'],
  ['세종특별자치시제10선거구', '종촌동'],
  ['세종특별자치시제11선거구', '고운동(1∼4통, 6통, 13통, 15∼18통, 21통, 23∼25통, 28∼30통, 34통, 36통, 38통)'],
  ['세종특별자치시제12선거구', '고운동(5통, 7∼12통, 14통, 19·20통, 22통, 26·27통, 31∼33통, 35통, 37통)'],
  ['세종특별자치시제13선거구', '보람동'],
  ['세종특별자치시제14선거구', '소담동'],
  ['세종특별자치시제15선거구', '반곡동(반곡동)'],
  ['세종특별자치시제16선거구', '반곡동(집현동, 합강동, 다솜동, 용호동 포함)'],
  ['세종특별자치시제17선거구', '새롬동'],
  ['세종특별자치시제18선거구', '다정동']
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#40;/g, '(')
    .replace(/&#41;/g, ')')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function stripTags(value) {
  return decodeEntities(value)
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .trim();
}

function normalize(value) {
  return String(value || '').replace(/\s/g, '').replace(/["'“”‘’]/g, '');
}

function withoutCommitteeSuffix(value) {
  return stripTags(value).replace(/선거관리위원회$/, '').trim();
}

function absoluteUrl(code, href) {
  if (href.startsWith('http')) return href;
  if (href.startsWith('/')) return `https://${code}.nec.go.kr${href}`;
  return `https://${code}.nec.go.kr/${code}/${href}`;
}

async function fetchText(url) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: REQUEST_HEADERS, redirect: 'follow' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(300 * attempt);
    }
  }
}

function extractQuickCommittees(html, code) {
  const committees = new Map();
  const regex = /moveQuickGuSiGunPage\('([^']+)'\)[^>]*>([\s\S]*?선거관리위원회)<\/a>/g;
  let match;

  while ((match = regex.exec(html))) {
    const href = decodeEntities(match[1]);
    const committee = withoutCommitteeSuffix(match[2]);
    if (!committee || committees.has(committee)) continue;
    committees.set(committee, {
      committee,
      landingUrl: absoluteUrl(code, href)
    });
  }

  return [...committees.values()];
}

function extractStatusUrl(html, code) {
  const regex = /href=["']([^"']*B0000289\/view\.do\?menuNo=\d+[^"']*)["'][^>]*>([\s\S]*?)<\/a>/g;
  const candidates = [];
  let match;

  while ((match = regex.exec(html))) {
    candidates.push({
      url: absoluteUrl(code, decodeEntities(match[1])),
      text: stripTags(match[2])
    });
  }

  return candidates.find(candidate => candidate.text.includes('선거관리현황'))?.url
    || candidates[0]?.url
    || null;
}

function inferElectionType(sectionTitle, slug, committee) {
  const titleKey = normalize(sectionTitle);
  const committeeKey = normalize(committee);

  if (sectionTitle.includes('도의원') || sectionTitle.includes('도의회의원')) {
    return 'provincial_council';
  }
  if (
    METROPOLITAN_CITY_SLUGS.has(slug)
    && (sectionTitle.includes('시의원') || sectionTitle.includes('시의회의원'))
  ) {
    return 'provincial_council';
  }
  if (
    sectionTitle.includes('특별시의회의원')
    && committeeKey
    && !titleKey.startsWith(committeeKey)
  ) {
    return 'provincial_council';
  }
  if (
    sectionTitle.includes('구의원')
    || sectionTitle.includes('구의회의원')
    || sectionTitle.includes('군의원')
    || sectionTitle.includes('군의회의원')
    || sectionTitle.includes('시의원')
    || sectionTitle.includes('시의회의원')
  ) {
    return 'city_council';
  }
  return null;
}

function loadCandidatesForRegion(regionData) {
  const byType = {
    provincial_council: [],
    city_council: []
  };
  const seen = new Set();

  Object.values(regionData.districts || {}).forEach((districtData) => {
    Object.entries(byType).forEach(([type, bucket]) => {
      (districtData[type] || []).forEach((candidate) => {
        const sggName = candidate.nec?.sggName || '';
        if (!sggName) return;
        const key = `${type}:${candidate.nec?.wiwName || ''}:${sggName}`;
        if (seen.has(key)) return;
        seen.add(key);
        bucket.push({
          sggName,
          wiwName: candidate.nec?.wiwName || ''
        });
      });
    });
  });

  return byType;
}

function matchCandidateConstituency(candidateIndex, type, committee, rowName) {
  const candidates = candidateIndex[type] || [];
  const rowKey = normalize(rowName);
  const rowKeys = rowKey.endsWith('선거구') ? [rowKey] : [rowKey, `${rowKey}선거구`];
  const committeeKey = normalize(committee);

  const matched = candidates.filter((candidate) => {
    const sggKey = normalize(candidate.sggName);
    const wiwKey = normalize(candidate.wiwName);

    return rowKeys.some(key => (
      sggKey === key
      || (wiwKey === committeeKey && sggKey.endsWith(key))
      || (wiwKey && committeeKey.includes(wiwKey) && sggKey.endsWith(key))
      || (committeeKey && sggKey.startsWith(committeeKey) && sggKey.endsWith(key))
    ));
  });

  const names = [...new Set(matched.map(candidate => candidate.sggName))];
  if (names.length === 1) return names[0];

  const exact = candidates.filter(candidate => rowKeys.includes(normalize(candidate.sggName)));
  const exactNames = [...new Set(exact.map(candidate => candidate.sggName))];
  if (exactNames.length === 1) return exactNames[0];

  return rowName.endsWith('선거구') ? rowName : `${rowName}선거구`;
}

function extractConstituencies(html, slug, committee, sourceUrl, candidateIndex) {
  const output = [];
  const sectionRegex = /<h6>([\s\S]*?의원\s*선거구[\s\S]*?)<\/h6>\s*<div class="tableCon">\s*<table[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/g;
  let sectionMatch;

  while ((sectionMatch = sectionRegex.exec(html))) {
    const sectionTitle = stripTags(sectionMatch[1]);
    const electionType = inferElectionType(sectionTitle, slug, committee);
    if (!electionType) continue;

    const rowsHtml = sectionMatch[2];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    let localOrderIndex = 0;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(rowsHtml))) {
      const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)]
        .map(cell => stripTags(cell[1]));

      if (cells.length < 3) continue;

      let [rowName, seats, areas] = cells;
      if (!rowName || !areas || rowName.includes('비례대표')) continue;
      if (electionType === 'city_council' && normalize(rowName) === '선거구') {
        rowName = `${LOCAL_CONSTITUENCY_ORDER[localOrderIndex] || ''}선거구`;
      }
      if (electionType === 'city_council') localOrderIndex += 1;

      const constituency = matchCandidateConstituency(candidateIndex, electionType, committee, rowName);

      output.push({
        electionType,
        constituency,
        localName: rowName,
        seats,
        areas,
        committee,
        sourceUrl
      });
    }
  }

  return output;
}

async function loadRegionData(slug) {
  const filePath = path.join(REGION_DIR, `${slug}.json`);
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function fetchRegion(slug, code) {
  const mainUrl = `https://${code}.nec.go.kr/${code}/main/main.do`;
  const mainHtml = await fetchText(mainUrl);
  const committees = extractQuickCommittees(mainHtml, code);
  const regionData = await loadRegionData(slug);
  const candidateIndex = loadCandidatesForRegion(regionData);
  const records = {
    provincial_council: {},
    city_council: {}
  };

  if (slug === 'sejong' && committees.length === 0) {
    SEJONG_CONSTITUENCIES.forEach(([constituency, areas]) => {
      records.provincial_council[constituency] = {
        areas,
        seats: '1',
        committee: '세종특별자치시',
        localName: constituency,
        sourceUrl: SEJONG_SOURCE_URL
      };
    });
    return records;
  }

  for (const committeeInfo of committees) {
    const landingHtml = await fetchText(committeeInfo.landingUrl);
    const statusUrl = extractStatusUrl(landingHtml, code);
    if (!statusUrl) {
      console.warn(`[skip] ${slug} ${committeeInfo.committee}: 선거관리현황 링크 없음`);
      continue;
    }

    const statusHtml = await fetchText(statusUrl);
    const extracted = extractConstituencies(
      statusHtml,
      slug,
      committeeInfo.committee,
      statusUrl,
      candidateIndex
    );

    extracted.forEach((item) => {
      records[item.electionType][item.constituency] = {
        areas: item.areas,
        seats: item.seats,
        committee: item.committee,
        localName: item.localName,
        sourceUrl: item.sourceUrl
      };
    });

    await sleep(80);
  }

  return records;
}

async function main() {
  const payload = {
    source: '중앙선거관리위원회 시·도 및 구·시·군 선거관리위원회 선거관리현황',
    generatedAt: new Date().toISOString(),
    regions: {}
  };

  for (const [slug, code] of Object.entries(REGION_CODES)) {
    console.log(`[fetch] ${slug}`);
    payload.regions[slug] = await fetchRegion(slug, code);
    const provincialCount = Object.keys(payload.regions[slug].provincial_council).length;
    const cityCount = Object.keys(payload.regions[slug].city_council).length;
    console.log(`  광역의원 ${provincialCount}개, 기초의원 ${cityCount}개`);
  }

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`written: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
