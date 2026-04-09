import json
import os
import sys
import datetime

# 현재 스크립트 위치를 기준으로 모듈 경로 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from extractors.news_scraper import fetch_candidates_from_news, fetch_candidates_from_nec
from transformers.llm_parser import generate_pledges_with_llm, get_avatar_url

# 출력 경로 (V5.0 JSON 아키텍처)
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "../public/data/candidates.json")

def save_as_json(data):
    """JS 문자열 결합 대신 표준 JSON 형식으로 저장"""
    try:
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ 완료: {OUTPUT_PATH} 에 JSON 데이터 저장 성공")
    except Exception as e:
        print(f"❌ 실패: JSON 저장 중 오류 발생 - {e}")

def run_pipeline(mode="NEWS"):
    print("=" * 60)
    print(f"🚀 Poly Fit v5.0 Pipeline (모드: {mode})")
    print("=" * 60)
    
    # 1. Extract (추출)
    raw_data = []
    if mode == "NEWS":
        raw_data.extend(fetch_candidates_from_news("진주시", "시장"))
    elif mode == "NEC":
        raw_data.extend(fetch_candidates_from_nec())

    # 2. Transform (변환 및 정제)
    processed_data = []
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
          "imageUrl": get_avatar_url(cand["name"]),
          "desc": "인공지능이 분석한 후보자의 현대적 시정 로드맵입니다.",
          "pledges": pledges
        }
        processed_data.append(cand_dict)
        
    # 3. Load (적재)
    save_as_json(processed_data)

if __name__ == "__main__":
    # "NEWS" 또는 "NEC" 모드를 선택해서 실행하세요.
    curr_mode = "NEWS"
    run_pipeline(curr_mode)
