import time

def generate_pledges_with_llm(candidate_name, region_list):
    region_str = " ".join(region_list)
    print(f"  🤖 LLM 엔진 가동: '{region_str} - {candidate_name}'의 정치적 기조를 분석 및 6대 분야로 규격화 중...")
    
    # 실제 LLM 호출 API(OpenAI 등)를 여기에 연동
    time.sleep(0.5) 
    
    return {
        "welfare": f"AI 분석: {candidate_name}의 복지 기조",
        "education": f"AI 분석: {candidate_name}의 교육 기조",
        "transport": f"AI 분석: {candidate_name}의 교통 기조",
        "culture": f"AI 분석: {candidate_name}의 문화 기조",
        "housing": f"AI 분석: {candidate_name}의 주거 정책",
        "environment": f"AI 분석: {candidate_name}의 환경 비전"
    }

def get_avatar_url(name):
    import urllib.parse
    return f"https://ui-avatars.com/api/?name={urllib.parse.quote(name)}&background=f1f5f9&color=475569&size=128&font-size=0.4&bold=true"
