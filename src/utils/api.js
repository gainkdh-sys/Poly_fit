/**
 * Poly Fit v6.0.0 데이터 로딩 유틸리티
 * - 초기 로딩: core.json + locations.json만 불러옴 (경량화)
 * - 지역 선택 후: 해당 광역 JSON을 Lazy Loading
 */

/**
 * 앱 초기화 시 필수 데이터 로드 (core + metro 목록)
 */
export async function fetchAppData() {
  console.log('[API] Loading initial application data...');
  try {
    const t = Date.now();
    const [coreRes, locRes, photoRes, constituencyRes, partyPolicyRes] = await Promise.all([
      fetch(`./data/core.json?t=${t}`),
      fetch(`./data/locations.json?t=${t}`),
      fetch(`./data/candidate-photos.json?t=${t}`).catch(() => null),
      fetch(`./data/constituency-areas.json?t=${t}`).catch(() => null),
      fetch(`./data/party-policy-fallbacks.json?t=${t}`).catch(() => null)
    ]);

    if (!coreRes.ok || !locRes.ok) {
      console.error('[API] Fetch failed:', { core: coreRes.status, loc: locRes.status });
      throw new Error('필수 데이터 파일 로드 중 오류가 발생했습니다.');
    }

    const data = {
      core: await coreRes.json(),
      locations: await locRes.json(),
      candidatePhotos: photoRes?.ok ? await photoRes.json() : { photos: {} },
      constituencyAreas: constituencyRes?.ok ? await constituencyRes.json() : { regions: {} },
      partyPolicyFallbacks: partyPolicyRes?.ok ? await partyPolicyRes.json() : { parties: {}, regionalParties: {} }
    };

    console.log('[API] Initial data loaded successfully');
    return data;
  } catch (error) {
    console.error('[API] Critical Failure:', error);
    alert('애플리케이션 데이터를 불러오는 데 실패했습니다. 네트워크 상태를 확인해 주세요.');
    return null;
  }
}

function normalizeStandaloneRegion(slug, candidates) {
  const metroName = candidates[0]?.region?.[0] || slug;
  const districts = {};

  candidates.forEach((candidate) => {
    const districtName = candidate.region?.[1] || metroName;
    if (!districts[districtName]) districts[districtName] = {};
    if (!districts[districtName][candidate.electionType]) {
      districts[districtName][candidate.electionType] = [];
    }
    districts[districtName][candidate.electionType].push(candidate);
  });

  return {
    metro: metroName,
    metroSlug: slug,
    governor: candidates.filter(c => c.electionType === 'governor'),
    superintendent: candidates.filter(c => c.electionType === 'superintendent'),
    districts
  };
}

/**
 * 광역자치단체 슬러그로 해당 광역 JSON 동적 로드 (Lazy Loading)
 * @param {string} slug - 광역 슬러그 (예: 'gyeongnam')
 * @returns {Object|null} 계층형 광역 데이터
 */
export async function fetchRegionData(slug) {
  // 엣지 케이스: slug 누락
  if (!slug) {
    console.error('[API] fetchRegionData: slug is required');
    return null;
  }

  // 엣지 케이스: 허용되지 않은 slug (경로 탈출 방지 - OWASP A03)
  const ALLOWED_SLUGS = [
    'seoul', 'busan', 'daegu', 'incheon', 'gwangju', 'daejeon', 'ulsan',
    'gyeonggi', 'gangwon', 'chungbuk', 'chungnam', 'jeonbuk', 'jeonnam',
    'gyeongbuk', 'gyeongnam', 'sejong', 'jeju'
  ];
  if (!ALLOWED_SLUGS.includes(slug)) {
    console.error(`[API] fetchRegionData: invalid slug '${slug}'`);
    return null;
  }

  console.log(`[API] Loading region data: ${slug}...`);
  try {
    const t = Date.now();
    const res = await fetch(`./data/regions/${slug}.json?t=${t}`);

    // 엣지 케이스: 네트워크 오류 또는 404
    if (!res.ok) {
      throw new Error(`지역 데이터 로드 실패 (${slug}): HTTP ${res.status}`);
    }

    const rawData = await res.json();
    const data = Array.isArray(rawData)
      ? normalizeStandaloneRegion(slug, rawData)
      : rawData;

    // 엣지 케이스: JSON 구조 검증
    if (!data.metro || !data.districts) {
      throw new Error(`지역 데이터 형식 오류 (${slug}): metro 또는 districts 필드 누락`);
    }

    console.log(`[API] Region data loaded: ${data.metro} (districts: ${Object.keys(data.districts).length}개)`);
    return data;
  } catch (error) {
    console.error(`[API] Region load failure (${slug}):`, error);
    alert(`해당 지역 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.`);
    return null;
  }
}
