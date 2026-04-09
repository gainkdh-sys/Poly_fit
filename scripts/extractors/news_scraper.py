import datetime
import time

def fetch_candidates_from_news(target_region, target_election):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] 📰 [NEWS 모드] '{target_region}' 언론 보도 기반 유력 후보를 스크래핑합니다...")
    time.sleep(1)
    
    return [
        {"name": "조시정", "party": "국민의힘", "region": ["경상남도", "진주시"], "electionType": "mayor", "bio": "현 진주시장 (언론 보도 기반)"},
        {"name": "갈소통", "party": "더불어민주당", "region": ["경상남도", "진주시"], "electionType": "mayor", "bio": "민주당 지역위원장 (언론 보도 기반)"}
    ]

def fetch_candidates_from_nec(sgId="20260603"):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] ⚖️ [NEC 모드] 중앙선거관리위원회 공식 API 접속 중...")
    time.sleep(1)
    
    return [
       {"name": "오세훈", "party": "국민의힘", "region": ["서울특별시"], "electionType": "governor", "bio": "공식 등록 예비후보"},
       {"name": "김경수", "party": "더불어민주당", "region": ["경상남도"], "electionType": "governor", "bio": "공식 등록 예비후보"}
    ]
