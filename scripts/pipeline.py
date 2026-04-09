import json
import os
import sys
import datetime

# 현재 스크립트 위치를 기준으로 모듈 경로 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from extractors.news_scraper import fetch_candidates_from_news, fetch_candidates_from_nec
from transformers.llm_parser import generate_pledges_with_llm, get_avatar_url

# 출력 경로 설정 (v5.2 권역별 분할 아키텍처)
DATA_BASE_DIR = os.path.join(os.path.dirname(__file__), "../public/data/regions")

REGION_CONFIG = {
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
    '제주특별자치도': 'jeju'
}

def save_by_regions(data_list):
    """후보자 데이터를 권역별 폴더에 분할하여 저장"""
    if not os.path.exists(DATA_BASE_DIR):
        os.makedirs(DATA_BASE_DIR)
        print(f"📁 디렉토리 생성: {DATA_BASE_DIR}")

    # 권역별 그룹화
    grouped = {}
    for cand in data_list:
        # region[0]을 광역 단위로 판단
        broad_region = cand["region"][0]
        if broad_region not in grouped:
            grouped[broad_region] = []
        grouped[broad_region].append(cand)

    # 개별 파일 저장
    for region_name, cands in grouped.items():
        file_name = REGION_CONFIG.get(region_name, "etc")
        output_path = os.path.join(DATA_BASE_DIR, f"{file_name}.json")
        
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(cands, f, ensure_ascii=False, indent=2)
            print(f"✅ 권역 저장 완료: {region_name} -> {output_path} ({len(cands)}명)")
        except Exception as e:
            print(f"❌ {region_name} 저장 실패: {e}")

def run_pipeline(mode="NEWS"):
    print("=" * 60)
    print(f"🚀 Poly Fit v5.2 Pipeline (권역별 동적 로딩 모드: {mode})")
    print("=" * 60)
    
    # 1. Extract (추출)
    raw_data = []
    if mode == "NEWS":
        # 예시: 진주(경남) 지역 뉴스 스크래핑
        raw_data.extend(fetch_candidates_from_news("진주시", "시장"))
    elif mode == "NEC":
        raw_data.extend(fetch_candidates_from_nec())

    # 2. Transform (변환 및 정제)
    processed_data = []
    print("\n[AI 텍스트 전처리 가동]")
    for idx, cand in enumerate(raw_data, start=2001): # ID 충돌 방지를 위해 v5.2는 2001부터
        pledges = generate_pledges_with_llm(cand["name"], cand["region"])
        
        cand_dict = {
          "id": idx,
          "electionType": cand["electionType"],
          "region": cand["region"],
          "name": cand["name"],
          "party": cand["party"],
          "bio": cand["bio"],
          "imageUrl": get_avatar_url(cand["name"]),
          "desc": "인공지능(LLM)이 수집된 공약을 매니페스토 형식으로 요약한 결과입니다.",
          "pledges": pledges
        }
        processed_data.append(cand_dict)
        
    # 3. Load (권역별 적재)
    save_by_regions(processed_data)

if __name__ == "__main__":
    curr_mode = "NEWS"
    run_pipeline(curr_mode)
