"""
Poly Fit - 전천후 하이브리드(언론 검색 + 선관위 API) 예비후보 크롤링 & LLM 공약 생성 파이프라인
---------------------------------------------------------------------------------------------------
[개요]
평시(비선거철): 포털/뉴스 검색을 통해 "OO시장 출마 유력" 기사 기반으로 후보 명단을 추려냅니다.
선거철: 중앙선거관리위원회 오픈 API의 '등록 예비후보자 명부'에 다이렉트로 접근해 공식 데이터를 가져옵니다.

[사용 방법]
1. 하단의 MAIN 실행부에서 `MODE`를 'NEWS' 또는 'NEC'로 설정하세요.
2. OPENAI_API_KEY 등 필요한 키를 세팅 후 파이썬을 실행하면, 
3. LLM이 후보자 정보를 자동으로 6대 공약으로 가공하여 `data_candidates.js` 파일을 덮어씁니다.
"""

import os
import json
import datetime
import time

# =========================================================
# [Phase 1-A] 평시 모드: 포털 뉴스 검색 API 기반 출마 유력자 스크래핑
# =========================================================
def fetch_candidates_from_news(target_region, target_election):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] 📰 [NEWS 모드] '{target_region}' 언론 보도 기반 유력 후보를 스크래핑합니다...")
    # 실제로는 네이버 뉴스 API(또는 Google Custom Search)에 " target_region + target_election + 출마 " 검색어 호출
    # url = f"https://openapi.naver.com/v1/search/news.json?query={target_region}+{target_election}+유력"
    # headers = {"X-Naver-Client-Id": "YOUR_ID", "X-Naver-Client-Secret": "YOUR_SECRET"}
    # res = requests.get(url, headers=headers)
    time.sleep(1)
    
    # 가상의 추출 결과 (구글/네이버 뉴스 텍스트 마이닝 후 얻어진 데이터라 가정)
    return [
        {"name": "조시정", "party": "국민의힘", "region": ["경상남도", "진주시"], "electionType": "mayor", "bio": "현 진주시장 (언론 거론 빈도: 매우 높음)"},
        {"name": "갈소통", "party": "더불어민주당", "region": ["경상남도", "진주시"], "electionType": "mayor", "bio": "민주당 지역위원장 (언론 거론 빈도: 높음)"}
    ]

# =========================================================
# [Phase 1-B] 선거철 모드: 중앙선관위(NEC) 공식 등록 명부 호출
# =========================================================
def fetch_candidates_from_nec(sgId="20260603"):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] ⚖️ [NEC 모드] 중앙선거관리위원회 '제9회 지선' 공식 API 접속 중...")
    # url = "http://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire"
    # res = requests.get(url, params={'ServiceKey': 'YOUR_NEC_KEY', 'sgId': sgId, ... })
    time.sleep(1)
    
    # 선관위 데이터는 선언된 소속, 직업, 학력이 100% 명확히 떨어짐
    return [
       {"name": "오세훈", "party": "국민의힘", "region": ["서울특별시"], "electionType": "governor", "bio": "선관위_현) 제39대 서울특별시장"},
       {"name": "김경수", "party": "더불어민주당", "region": ["경상남도"], "electionType": "governor", "bio": "선관위_전) 제37대 경상남도지사"}
       # (예시 데이터)
    ]

# =========================================================
# [Phase 2] LLM API 6대 공약 자동 파싱
# =========================================================
def generate_pledges_with_llm(candidate_name, region_list):
    region_str = " ".join(region_list)
    print(f"  🤖 LLM 엔진 가동: '{region_str} - {candidate_name}'의 정치적 기조를 분석 및 6대 분야로 규격화 중...")
    
    # client.chat.completions.create(...) -> LLM에게 " JSON 형식 {welfare: '', ...} 반환해 " 요청
    time.sleep(0.5) 
    
    return {
        "welfare": f"API 자동 파싱: {candidate_name}의 복지 기조",
        "education": f"API 자동 파싱: {candidate_name}의 교육 기조",
        "transport": f"API 자동 파싱: {candidate_name}의 교통 기조",
        "culture": f"API 자동 파싱: {candidate_name}의 문화 기조",
        "housing": f"API 자동 파싱: {candidate_name}의 주거 정책",
        "environment": f"API 자동 파싱: {candidate_name}의 환경 비전"
    }

def get_avatar_url(name):
    # 증명사진이 없을 경우 범용 아바타 생성기 주소 매치
    import urllib.parse
    return f"https://ui-avatars.com/api/?name={urllib.parse.quote(name)}&background=f1f5f9&color=475569&size=128&font-size=0.4&bold=true"

# =========================================================
# [Phase 3] data_candidates.js 완전 자동화 주입
# =========================================================
def run_pipeline(mode="NEWS"):
    print("=" * 60)
    print(f"🚀 Poly Fit Candidate Pipeline 가동 (현재 모드: {mode})")
    print("=" * 60)
    
    raw_data = []
    if mode == "NEWS":
        # 평시에는 지역별로 뉴스 크롤러를 스윕 (목업)
        raw_data.extend(fetch_candidates_from_news("진주시", "시장"))
    elif mode == "NEC":
        # 선거철에는 전국 데이터 풀을 한 번에 당김
        raw_data.extend(fetch_candidates_from_nec())

    final_output = []
    
    print("\n[AI 텍스트 전처리 가동]")
    for idx, cand in enumerate(raw_data, start=1001):
        pledges = generate_pledges_with_llm(cand["name"], cand["region"])
        
        cand_dict = {
            "id": idx,
            "electionType": cand["electionType"],
            "region": cand["region"],
            "name": cand["name"],
            "party": cand["party"],
            "bio": cand["bio"],
            "imageUrl": get_avatar_url(cand["name"]), # 프로필 이미지 자동 매칭
            "desc": "인공지능이 후보의 핵심 시정 철학을 한 줄로 요약했습니다.",
            "pledges": pledges
        }
        final_output.append(cand_dict)
    
    print("\n[DB 파일 오버라이트 진행]")
    js_content = "/* \n * 이 파일은 update_candidates_pipeline.py에 의해 자동 생성된 파일입니다. \n"
    js_content += f" * 마지막 업데이트: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')} (모드: {mode})\n */\n\n"
    
    # 헬퍼 함수 추가 (내부용)
    js_content += "const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=475569&size=128&font-size=0.4&bold=true`;\n\n"
    
    js_array_string = json.dumps(final_output, ensure_ascii=False, indent=2)
    js_content += f"export const candidates = {js_array_string};\n"

    target_path = os.path.join(os.path.dirname(__file__), "data_candidates.js")
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print(f"✅ 완료: {len(final_output)}명의 데이터가 'data_candidates.js'에 성공적으로 주입되었습니다.")

if __name__ == "__main__":
    # "NEWS" 또는 "NEC" 모드를 선택해서 실행하세요.
    curr_mode = "NEWS"  # "NEC"
    run_pipeline(curr_mode)
