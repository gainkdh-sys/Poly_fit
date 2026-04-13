/**
 * Poly Fit v5.0 데이터 로딩 유틸리티
 */
export async function fetchAppData() {
  try {
    const [coreRes, locRes] = await Promise.all([
      fetch('/data/core.json'),
      fetch('/data/locations.json')
    ]);

    if (!coreRes.ok || !locRes.ok) {
      throw new Error('데이터 파일 로드 중 오류가 발생했습니다.');
    }

    return {
      core: await coreRes.json(),
      locations: await locRes.json()
    };
  } catch (error) {
    console.error("Critical: 데이터 로딩 실패", error);
    alert("애플리케이션 데이터를 불러오는 데 실패했습니다.");
    return null;
  }
}

/**
 * 특정 권역의 후보자 데이터를 동적으로 로딩
 */
const regionFileMap = {
  '서울특별시': 'seoul',
  '경기도': 'gyeonggi',
  '부산광역시': 'busan',
  '경상남도': 'gyeongnam',
  '경상북도': 'gyeongbuk',
  '전라남도': 'jeonnam',
  '전라북도': 'jeonbuk',
  '충청남도': 'chungnam',
  '충청북도': 'chungbuk',
  '강원도': 'gangwon',
  '인천광역시': 'incheon',
  '대전광역시': 'daejeon',
  '광주광역시': 'gwangju',
  '대구광역시': 'daegu',
  '울산광역시': 'ulsan',
  '제주특별자치도': 'jeju',
  '세종특별자치시': 'sejong'
};

export async function fetchCandidatesByRegion(regionName) {
  const fileName = regionFileMap[regionName];
  if (!fileName) {
    console.warn(`Warning: '${regionName}' 권역에 대한 매핑 파일이 없습니다.`);
    return [];
  }

  try {
    const res = await fetch(`/data/regions/${fileName}.json`);
    if (!res.ok) throw new Error('권역 데이터를 찾을 수 없습니다.');
    return await res.json();
  } catch (error) {
    console.error(`Error: ${regionName} 데이터 로드 실패`, error);
    return [];
  }
}

/**
 * 선거 유형 및 지역에 따른 후보자 정밀 필터링
 * @param {Array} candidates - 전체 후보자 목록
 * @param {string} district - 사용자 선택 지역 (예: "경상남도 진주시 가호동")
 * @param {string} electionId - 선택한 선거 종류 ID (예: "governor", "mayor")
 */
export function filterCandidatesByDistrict(candidates, district, electionId) {
  return candidates.filter(c => {
    // 1. 선거 유형 일치 확인
    if (c.electionType !== electionId) return false;

    // 2. 지역 매칭 로직
    // 광역 단위(도지사, 교육감) 등은 광역 지역명(배열 첫 번째)만 포함되면 오케이
    if (['governor', 'superintendent'].includes(c.electionType)) {
      return district.includes(c.region[0]);
    }

    // 기초 단위(시장, 군수, 구청장)
    if (c.electionType === 'mayor') {
      // 후보 지역이 하나뿐인 경우 (세종 등 특수 구조 대응)
      if (c.region.length === 1) {
        return district.includes(c.region[0]);
      }
      
      // 구체적인 지역명(배열의 마지막 요소)이 포함되어야 함 (예: "진주시")
      const specificRegion = c.region[c.region.length - 1];
      return district.includes(specificRegion);
    }

    return false;
  });
}
