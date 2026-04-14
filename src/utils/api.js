/**
 * Poly Fit v5.0 데이터 로딩 유틸리티
 */
export async function fetchAppData() {
  try {
    const [coreRes, candRes, locRes] = await Promise.all([
      fetch('./data/core.json'),
      fetch('./data/candidates.json'),
      fetch('./data/locations.json')
    ]);

    if (!coreRes.ok || !candRes.ok || !locRes.ok) {
      throw new Error('데이터 파일 로드 중 오류가 발생했습니다.');
    }

    return {
      core: await coreRes.json(),
      candidates: await candRes.json(),
      locations: await locRes.json()
    };
  } catch (error) {
    console.error("Critical: 데이터 로딩 실패", error);
    alert("애플리케이션 데이터를 불러오는 데 실패했습니다. 네트워크 상태를 확인해 주세요.");
    return null;
  }
}
