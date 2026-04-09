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
