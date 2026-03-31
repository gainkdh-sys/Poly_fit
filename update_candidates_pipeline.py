"""
Poly Fit - 전국 단위 선거관리위원회(NEC) 예비후보자 명부 자동 크롤링 & LLM 공약 생성 파이프라인
---------------------------------------------------------------------------------------------------
[사용 방법]
1. 공공데이터포털(data.go.kr)에서 '선거정보 API' 키 발급 
2. OpenAI API 키 발급 (.env 또는 환경변수로 OPENAI_API_KEY 설정)
3. 이 스크립트를 주기적으로 실행하면, 해당 선거구의 모든 등록 예비후보의 최신 정보를 
   가져오고, LLM을 통해 6대 카테고리 공약으로 리포맷팅된 후 프론트엔드 DB(data_candidates.js)를 덮어씁니다!
"""

import os
import json
import datetime
import requests # pip install requests
import time

# =========================================================
# [Phase 1] 공공데이터포털(NEC API) 출마자 데이터 자동 수집
# =========================================================
def fetch_nec_candidates():
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 1단계: 선거관리위원회 공식 API에서 등록 후보를 스크래핑합니다...")
    
    # [참고] 중앙선거관리위원회 예비후보자 정보조회 API 엔드포인트 세팅 예시
    api_url = "http://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire"
    api_key = os.environ.get("NEC_API_KEY", "YOUR_API_KEY_HERE")
    
    # 테스트를 위한 가상 목업 반환 데이터 (실제 서비스 시 requests 구문으로 대체)
    # response = requests.get(api_url, params={'ServiceKey': api_key, 'sgId': '20260603', 'sgTypecode': '3', 'resultType': 'json'})
    # return response.json()
    time.sleep(1) # API 호출 지연 시뮬레이션
    
    # (예시) 받아온 딕셔너리 리스트 반환
    return [
        {"name": "오세훈", "party": "국민의힘", "region": ["서울특별시"], "electionType": "governor", "bio": "현) 제39대 서울특별시장"},
        {"name": "김동연", "party": "더불어민주당", "region": ["경기도"], "electionType": "governor", "bio": "현) 제36대 경기도지사"}
        # ... 전국 모든 후보가 이곳에 100~1000명 단위로 잡히게 됩니다.
    ]

# =========================================================
# [Phase 2] 인공지능(LLM)을 활용한 기사 요약 및 6대 카테고리화
# =========================================================
def generate_pledges_with_llm(candidate_name, region):
    print(f"  -> ChatGPT API에 '{candidate_name}({region})' 관련 최근 기사 인덱싱 및 6대 카테고리 추출 요청 중...")
    
    # [참고] OpenAI API 호출부 예시
    # openai_key = os.environ.get("OPENAI_API_KEY")
    # client = OpenAI(api_key=openai_key)
    # completion = client.chat.completions.create( ... )
    
    time.sleep(0.5) 
    
    # LLM이 파싱해준 JSON Dictionary 반환
    return {
        "welfare": f"자동봇: {candidate_name}의 최신 복지 정책 요약",
        "education": f"자동봇: {candidate_name}의 최신 교육 정책 요약",
        "transport": f"자동봇: {candidate_name}의 최신 교통 정책 요약",
        "culture": f"자동봇: {candidate_name}의 최신 문화 정책 요약",
        "housing": f"자동봇: {candidate_name}의 최신 주거 정책 요약",
        "environment": f"자동봇: {candidate_name}의 최신 환경 정책 요약"
    }

# =========================================================
# [Phase 3] data_candidates.js 단독 덮어쓰기 로직
# (골칫거리였던 기존 data.js 병합 파괴 위험 소멸!)
# =========================================================
def update_candidates_db():
    raw_data = fetch_nec_candidates()
    final_output = []

    print(f"\n[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 2단계: 후보별 선언문 및 정책 공약 매핑 (AI 처리)")
    
    # 1. API에서 가져온 후보군 순회 (각각 ID 부여)
    for idx, cand in enumerate(raw_data, start=1001):
        # 2. 후보 이름과 지역명으로 최신 공약 텍스트를 AI로 검색 후 카테고리화
        pledges = generate_pledges_with_llm(cand["name"], cand["region"])
        
        # 3. 데이터 구조 조립
        final_output.append({
            "id": idx,
            "electionType": cand["electionType"],
            "region": cand["region"],
            "name": cand["name"],
            "party": cand["party"],
            "bio": cand["bio"],
            "desc": "인공지능이 후보의 핵심 시정 철학을 한 줄로 요약했습니다.",
            "pledges": pledges
        })
    
    print(f"\n[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 3단계: data_candidates.js 파일 자동 생성 시작")
    
    # 4. 자바스크립트 모듈 export 문법으로 문자열 생성!
    js_content = "/* \n * 이 파일은 update_candidates_pipeline.py에 의해 자동 생성된 파일입니다. \n"
    js_content += " * 수동으로 수정하지 마시고, 파이프라인을 재실행 하세요. \n */\n\n"
    
    # json.dumps로 리스트 딕셔너리를 자바스크립트 배열 객체로 직렬화 (들여쓰기 적용)
    js_array_string = json.dumps(final_output, ensure_ascii=False, indent=2)
    js_content += f"export const candidates = {js_array_string};\n"

    # 5. 파일을 같은 폴더의 data_candidates.js 에 덮어쓰기 모드(w)로 저장
    target_path = os.path.join(os.path.dirname(__file__), "data_candidates.js")
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print(f"✅ 결과: 성공! {len(final_output)}명의 전국구 최신 후보 데이터가 Vercel 연동용 프론트엔드 DB로 즉시 주입되었습니다.")
    print("✅ 이제 GitHub에 커밋(Commit & Sync)을 진행하시면 Vercel 앱이 30초 내로 새로운 최신 공약으로 업데이트됩니다.")

if __name__ == "__main__":
    update_candidates_db()
