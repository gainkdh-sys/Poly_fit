/**
 * Poly Fit v5.0 데이터 로딩 유틸리티
 */
export async function fetchAppData() {
  console.log('[API] Loading application data...');
  try {
    const t = Date.now();
    const [coreRes, candRes, locRes] = await Promise.all([
      fetch(`./data/core.json?t=${t}`),
      fetch(`./data/candidates.json?t=${t}`),
      fetch(`./data/locations.json?t=${t}`)
    ]);

    if (!coreRes.ok || !candRes.ok || !locRes.ok) {
      console.error('[API] Fetch failed:', { core: coreRes.status, cand: candRes.status, loc: locRes.status });
      throw new Error('데이터 파일 로드 중 오류가 발생했습니다.');
    }

    const data = {
      core: await coreRes.json(),
      candidates: await candRes.json(),
      locations: await locRes.json()
    };
    
    console.log('[API] Data loaded successfully');
    return data;
  } catch (error) {
    console.error("[API] Critical Failure:", error);
    alert("애플리케이션 데이터를 불러오는 데 실패했습니다. 네트워크 상태를 확인해 주세요.");
    return null;
  }
}
