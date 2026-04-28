#!/usr/bin/env python3
"""
Poly Fit v6.0.0 - 광역자치단체 → 기초자치단체 계층형 데이터 변환 스크립트
- 기존 평탄 배열(flat array) 형식의 지역 JSON을 계층형 객체로 변환
- 세종, 제주 제외 15개 광역 처리
- 실제 행정구역 기준으로 모든 기초자치단체 키를 생성(데이터 없으면 빈 객체)
"""

import json
import os
from pathlib import Path

# ─── 상수 정의 ───────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data" / "regions"

# 광역 slug → (한국어 이름, 모든 기초자치단체 목록)
METRO_DATA = {
    "seoul": {
        "metro": "서울특별시",
        "districts": [
            "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구",
            "성북구", "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구",
            "양천구", "강서구", "구로구", "금천구", "영등포구", "동작구", "관악구",
            "서초구", "강남구", "송파구", "강동구"
        ]
    },
    "busan": {
        "metro": "부산광역시",
        "districts": [
            "중구", "서구", "동구", "영도구", "부산진구", "동래구", "남구", "북구",
            "해운대구", "사하구", "금정구", "강서구", "연제구", "수영구", "사상구",
            "기장군"
        ]
    },
    "daegu": {
        "metro": "대구광역시",
        "districts": [
            "중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군",
            "군위군"
        ]
    },
    "incheon": {
        "metro": "인천광역시",
        "districts": [
            "중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구",
            "서구", "강화군", "옹진군"
        ]
    },
    "gwangju": {
        "metro": "광주광역시",
        "districts": [
            "동구", "서구", "남구", "북구", "광산구"
        ]
    },
    "daejeon": {
        "metro": "대전광역시",
        "districts": [
            "동구", "중구", "서구", "유성구", "대덕구"
        ]
    },
    "ulsan": {
        "metro": "울산광역시",
        "districts": [
            "중구", "남구", "동구", "북구", "울주군"
        ]
    },
    "gyeonggi": {
        "metro": "경기도",
        "districts": [
            "수원시", "성남시", "의정부시", "안양시", "부천시", "광명시", "평택시",
            "동두천시", "안산시", "고양시", "과천시", "구리시", "남양주시", "오산시",
            "시흥시", "군포시", "의왕시", "하남시", "용인시", "파주시", "이천시",
            "안성시", "김포시", "화성시", "광주시", "양주시", "포천시", "여주시",
            "연천군", "가평군", "양평군"
        ]
    },
    "gangwon": {
        "metro": "강원특별자치도",
        "districts": [
            "춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시",
            "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군",
            "양구군", "인제군", "고성군", "양양군"
        ]
    },
    "chungbuk": {
        "metro": "충청북도",
        "districts": [
            "청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군",
            "진천군", "괴산군", "음성군", "단양군"
        ]
    },
    "chungnam": {
        "metro": "충청남도",
        "districts": [
            "천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시",
            "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군",
            "태안군"
        ]
    },
    "jeonbuk": {
        "metro": "전북특별자치도",
        "districts": [
            "전주시", "군산시", "익산시", "정읍시", "남원시", "김제시",
            "완주군", "진안군", "무주군", "장수군", "임실군", "순창군",
            "고창군", "부안군"
        ]
    },
    "jeonnam": {
        "metro": "전라남도",
        "districts": [
            "목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군",
            "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군",
            "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군",
            "신안군"
        ]
    },
    "gyeongbuk": {
        "metro": "경상북도",
        "districts": [
            "포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시",
            "상주시", "문경시", "경산시", "의성군", "청송군", "영양군", "영덕군",
            "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군",
            "울릉군"
        ]
    },
    "gyeongnam": {
        "metro": "경상남도",
        "districts": [
            "창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시",
            "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군",
            "산청군", "함양군", "거창군", "합천군"
        ]
    }
}

ELECTION_TYPES = ["governor", "superintendent", "mayor", "provincial_council", "city_council"]
METRO_LEVEL_TYPES = {"governor", "superintendent"}
DISTRICT_LEVEL_TYPES = {"mayor", "provincial_council", "city_council"}


def transform_region(slug: str, config: dict) -> dict:
    """단일 광역 파일을 읽어 계층형 구조로 변환한다."""
    filepath = DATA_DIR / f"{slug}.json"
    
    # 기존 파일 읽기 (없으면 빈 배열)
    existing_candidates = []
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            raw = json.load(f)
            # 기존 파일이 평탄 배열인 경우만 처리
            if isinstance(raw, list):
                existing_candidates = raw
            elif isinstance(raw, dict):
                # 이미 변환된 구조라면 기존 후보 목록 추출
                existing_candidates = (
                    raw.get("governor", []) +
                    raw.get("superintendent", []) +
                    [cand for dist in raw.get("districts", {}).values()
                     for etype_list in dist.values() if isinstance(etype_list, list)
                     for cand in etype_list]
                )
    
    # 결과 구조 초기화
    result = {
        "metro": config["metro"],
        "metroSlug": slug,
        "governor": [],
        "superintendent": [],
        "districts": {dist: {} for dist in config["districts"]}
    }
    
    # 후보 분류
    for cand in existing_candidates:
        etype = cand.get("electionType", "")
        regions = cand.get("region", [])
        
        if etype in METRO_LEVEL_TYPES:
            # 광역 단위 선거 (도지사, 교육감)
            result[etype].append(cand)
        elif etype in DISTRICT_LEVEL_TYPES and len(regions) >= 2:
            # 기초 단위 선거 (시장/군수/구청장, 의원)
            district = regions[1]
            if district not in result["districts"]:
                print(f"  ⚠️  알 수 없는 기초자치단체 '{district}' → 자동 추가 ({slug})")
                result["districts"][district] = {}
            
            if etype not in result["districts"][district]:
                result["districts"][district][etype] = []
            result["districts"][district][etype].append(cand)
        else:
            print(f"  ⚠️  분류 불가 후보 스킵: {cand.get('name', '?')} / {etype} / {regions}")
    
    return result


def main():
    print("=" * 60)
    print("Poly Fit v6.0.0 - 광역→기초 계층형 데이터 변환 시작")
    print("=" * 60)
    
    total_candidates = {slug: {"metro": 0, "district": 0} for slug in METRO_DATA}
    
    for slug, config in METRO_DATA.items():
        print(f"\n[{slug}] {config['metro']} 변환 중...")
        
        result = transform_region(slug, config)
        
        # 통계 출력
        metro_cands = len(result["governor"]) + len(result["superintendent"])
        district_cands = sum(
            len(v) for d in result["districts"].values()
            for v in d.values() if isinstance(v, list)
        )
        total_candidates[slug] = {"metro": metro_cands, "district": district_cands}
        
        filled_districts = [k for k, v in result["districts"].items() if v]
        print(f"  ✅ 광역후보: {metro_cands}명 | 기초후보: {district_cands}명 | 데이터 있는 기초: {len(filled_districts)}/{len(result['districts'])}개")
        
        # 파일 저장
        filepath = DATA_DIR / f"{slug}.json"
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print("✅ 변환 완료! 요약:")
    for slug, counts in total_candidates.items():
        print(f"  {METRO_DATA[slug]['metro']}: 광역 {counts['metro']}명, 기초 {counts['district']}명")
    print("=" * 60)


if __name__ == "__main__":
    main()
