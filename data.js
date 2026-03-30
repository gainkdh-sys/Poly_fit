/* data.js */
export const categories = [
  { id: 'welfare', name: '복지', icon: '🛒' },
  { id: 'education', name: '교육', icon: '📚' },
  { id: 'transport', name: '교통 및 인프라', icon: '🚃' },
  { id: 'culture', name: '문화', icon: '🎭' },
  { id: 'housing', name: '주거', icon: '🏠' },
  { id: 'environment', name: '환경', icon: '🌱' }
];

// 1. 전국 단위 보편적 18문항 (지역 편향 제거)
export const questions = [
  // 복지 (welfare)
  { text: "국가 재정을 투입하여 모든 국민에게 차별 없이 지급하는 '기본소득' 제도를 도입해야 합니까?", category: "welfare" },
  { text: "선별 복지 대신, 병원비 부담을 완전히 없애는 수준의 '무상 공공의료' 확대가 우선입니까?", category: "welfare" },
  { text: "출산율 반등을 위해 0세부터 영유아의 보육 시설과 비용을 '국가가 100% 전담'해야 합니까?", category: "welfare" },
  
  // 교육 (education)
  { text: "서열화된 입시 구조 타파를 위해 자사고·특목고를 폐지하고 평등한 공교육을 강화해야 합니까?", category: "education" },
  { text: "디지털 시대에 뒤처지지 않도록 학생 개인별 '태블릿 PC 지급 및 AI 코딩 교육' 예산이 중요합니까?", category: "education" },
  { text: "대학 등록금 완전 무상화를 통해 청년세대의 최소한의 출발선을 맞춰주어야 합니까?", category: "education" },
  
  // 교통 (transport)
  { text: "수도권 집중을 막기 위해 수익성이 다소 떨어져도 KTX/지방 광역철도를 무조건 놓아야 합니까?", category: "transport" },
  { text: "출퇴근 대중교통 이용객의 부담을 줄이기 위해 '지역 시내버스 완전 공영(무료)제'가 필요합니까?", category: "transport" },
  { text: "고속도로 지하화 및 대규모 터널 공사를 통해 고질적인 지역 도심 교통 체증을 뚫어야 합니까?", category: "transport" },
  
  // 문화 (culture)
  { text: "문화 소외 방지를 위해 동네마다 작은 도서관, 소규모 체육관 등 생활 밀착 인프라가 필수입니까?", category: "culture" },
  { text: "경제적 부가가치 창출을 위해 초대형 K-POP 아레나, 다목적 컨벤션 센터 건립이 더 시급합니까?", category: "culture" },
  { text: "국가적 행사나 대규모 지역 축제에 쓰이는 혈세를 대폭 삭감하고 기초 문화 예술인에게 직접 지원해야 합니까?", category: "culture" },
  
  // 주거 (housing)
  { text: "민간 재개발/재건축 규제를 대폭 완화하여 부동산 시장의 자유로운 주택 공급을 늘려야 합니까?", category: "housing" },
  { text: "청년과 무주택자를 위해 국가가 직접 파격적인 반값 영구 임대주택을 수십만 호 지어 공급해야 합니까?", category: "housing" },
  { text: "전세사기 방지 및 임차인 보호를 위해 집주인의 권환을 제한하는 초강력 임대차 보호법이 시급합니까?", category: "housing" },
  
  // 환경 (environment)
  { text: "기후 위기 대응을 위해, 기업의 생산 활동이 위축되더라도 탄소 배출 규제를 세계 최고 수준으로 강화해야 합니까?", category: "environment" },
  { text: "경제 발전과 일자리가 우선이므로, 산림 보호구역 등 그린벨트 규제를 파격적으로 풀어 산업단지를 지어야 합니까?", category: "environment" },
  { text: "수소차 및 전기차 시대를 앞당기기 위해 내연기관 자동차의 도심 진입 제한 시기를 당겨야 합니까?", category: "environment" }
];

export const electionsList = [
  { id: 'governor', name: '광역자치단체장 (도/시장 등)' },
  { id: 'mayor', name: '기초자치단체장 (구/시/군장 등)' },
  { id: 'provincial_council', name: '광역의회의원 (도/시의원 등)' },
  { id: 'city_council', name: '기초의회의원 (시/구/군의원 등)' },
  { id: 'superintendent', name: '시·도 교육감' }
];

// 2. 5파전(5인 출마) 기조를 위한 대규모 투스텝 공약 데이터 모델
export const candidates = [
  // ===================== [1. 광역단체장] =====================
  { 
    id: 101, electionId: 'governor', name: "박경남", party: "여당", bio: "현) 광역자치단체장", 
    desc: "도정 연속성을 통한 압도적인 경제 발전과 광역 기업도시 육성!",
    pledges: {
      welfare: "촘촘한 선별적 핀셋 복지와 노인 일자리 10만개 창출",
      education: "지역 거점국립대 연계형 첨단 반도체/AI 산학계약학과 신설",
      transport: "도심순환고속도로 지하시대 개막 및 광역급행철도(GTX) 조기 완공",
      culture: "도립 최고 규모의 다목적 스마트 컨벤션 센터(MICE) 타운 조성",
      housing: "재개발·재건축 인허가 기간 단축을 통한 민간 브랜드 아파트 대거 공급",
      environment: "규제프리존 경제자유구역 지정을 통한 첨단 국가산업단지 조성"
    }
  },
  { 
    id: 102, electionId: 'governor', name: "김민주", party: "제1야당", bio: "전) 대통령 직속 위원장", 
    desc: "인구 소멸을 막고 도민 누구에게나 따뜻한 복지 생태계를 짓겠습니다.",
    pledges: {
      welfare: "전 도민 재난기본소득 연 100만원 보장 및 달빛어린이병원 2배 확충",
      education: "기초학력 미달 완전 제로화 및 모든 초중고교 태블릿 무상 제공",
      transport: "청년·노인 대중교통 100% 환급 패스 도입 및 소외지역 공공버스 강화",
      culture: "도내 유휴공간을 활용한 '1동네 1청년 문화예술 창작소' 500개 설립",
      housing: "도유지 기반 '반값 영구 공공임대아파트' 5만 호 특별 조기 공급",
      environment: "원전 대신 100% 해상풍력·태양광 신재생에너지 자립 도시 선포"
    }
  },
  { 
    id: 103, electionId: 'governor', name: "류진보", party: "진보 소수당", bio: "전) 지역노동조합 위원장", 
    desc: "자본이 아닌 노동자와 서민의 삶부터 챙기는 진짜 진보 정치!",
    pledges: {
      welfare: "병원비 100만원 상한제 및 요양보호사 등 돌봄노동자 100% 직고용",
      education: "무상교육을 넘어 교복, 수학여행까지 공교육 완전 무상시대 선언",
      transport: "시내 및 시외버스 완전 무상 공영제 즉각 도입",
      culture: "1% 엘리트 예술 지원 폐지 ➡️ 일상 생활체육/생활문화 예산 전면화",
      housing: "임대차 3법을 넘어선 전월세 상한제 및 1가구 3주택 이상 강력 과세",
      environment: "대기업 공장 탄소배출세 강력 부과 및 난개발 중단 선언"
    }
  },
  { 
    id: 104, electionId: 'governor', name: "배보수", party: "제2보수당", bio: "전) 4선 국회의원", 
    desc: "세금 낭비 없는 깨끗한 재정, 합리적인 보수의 힘으로 시장을 정상화합니다.",
    pledges: {
      welfare: "포퓰리즘 현금성 지원 전면 폐지 ➡️ 취약계층 쿠폰형 타겟 복지 시행",
      education: "특목고·자사고 유지 및 수월성 엘리트 영재 교육 수월성 강화",
      transport: "적자 공항/철도 백지화 ➡️ 수익성 높은 핵심 고속도로 위주 정비",
      culture: "기업 스폰서십을 유치한 대규모 K-관광 복합 카지노 리조트 특구 조성",
      housing: "종부세 철폐 및 다주택자 규제 완전 해제로 정상적인 시장경제 복원",
      environment: "원자력 발전 비율 최대 유지 기반 안정적인 산업 전력망 100% 공급"
    }
  },
  { 
    id: 105, electionId: 'governor', name: "유중도", party: "무소속", bio: "전) 도 누리소통관", 
    desc: "진영 논리에서 벗어나 실용적이고 합리적인 혁신 행정을 약속합니다.",
    pledges: {
      welfare: "지자체 데이터를 활용한 사각지대 없는 AI 핀셋 복지 매칭 시스템",
      education: "지자체 주도형 방과후 원어민 영어 및 AI 코딩 스마트 교육 무상 시행",
      transport: "퍼스널 모빌리티(PM) 전용 도로 및 도심형 자율주행버스 노선 개척",
      culture: "민간 크리에이터 양성을 위한 대규모 도립 미디어 스튜디오 파크 건립",
      housing: "신혼부부를 위한 시유지 활용 장기전세 주택 '반반 렌트' 모델 도입",
      environment: "일회용품 제로 도청 및 시민 참여형 포인트제 탄소중립 페이백 시행"
    }
  },

  // ===================== [2. 기초단체장 (시장/구/군장)] =====================
  { 
    id: 201, electionId: 'mayor', name: "조시정", party: "여당", bio: "현) 시장", desc: "시정의 압도적 르네상스 완수",
    pledges: {
      welfare: "초대형 시립 종합 실버복지타운 설립", education: "우주항공 진로특화 교육 지원망 구축", transport: "시외곽-혁신도시 간 왕복 6차선 우회도로 뚫어", culture: "도심권 수변 공원과 연계한 야간 경관 조명 랜드마크화", housing: "쇠퇴한 원도심 도시재생사업 예산 특별 편성", environment: "국가생태문화탐방로 조성"
    }
  },
  { 
    id: 202, electionId: 'mayor', name: "갈소통", party: "제1야당", bio: "현) 지역위원장", desc: "고인물을 청산하는 투명한 시청",
    pledges: {
      welfare: "전 생애주기별 기본소득 지원 및 시민안전보험 가입", education: "공공 스터디 카페 및 청년 취업 멘토링 아카데미 10동 신설", transport: "시내버스 적자 타개를 위한 스마트 AI 버스 노선 전면 개편", culture: "국립현대미술관 지역 분관 유치", housing: "청년 1인가구 월세 20만원 지원 정책", environment: "미세먼지 차단용 대규모 도심 에코 숲 벨트 조성"
    }
  },
  { 
    id: 203, electionId: 'mayor', name: "류노동", party: "진보당", bio: "전) 시의원", desc: "동네 골목까지 비추는 생활밀착형 복지",
    pledges: {
      welfare: "24시간 공공 야간 약국 및 심야 아동병원 3개소 지정", education: "친환경 식자재 무상 급식 및 학교 비정규직 노동자 처우 대폭 축소", transport: "만 18세 이하 전면 무상교통 카드 도입", culture: "전시성 축제 전면 취소 및 동네 도서관 예산으로 100% 전환", housing: "SH/LH 빈집 매입 후 지역 대학생 무상 기숙사 제공", environment: "산단 주변 대기오염물질 감시 전담 드론순찰대 창설"
    }
  },
  { 
    id: 204, electionId: 'mayor', name: "장혁신", party: "제2야당", bio: "전) 구청장", desc: "강력한 규제 철폐로 상권 활성화 달성",
    pledges: {
      welfare: "선별 복지로 예산 절감 후 지역화폐 인프라 전액 투자", education: "상위 1% 인재 육성을 위한 시립 영재학습관 직영", transport: "상가 일대 불법주정차 단속 유예 및 공영주차장 지하화", culture: "워터파크식 대형 복합 스포츠 컴플렉스 민자 유치", housing: "고도제한 전면 해제로 40층 고층 주상복합 허가", environment: "개발제한구역 탄력적 해제로 외곽 산업단지 부지 대량 확보"
    }
  },
  { 
    id: 205, electionId: 'mayor', name: "하청년", party: "무소속", bio: "전) 청년창업가", desc: "스타트업처럼 빠르고 스마트한 시정 2.0",
    pledges: {
      welfare: "청년 멘탈 케어 바우처 연 50만원 즉시 지급", education: "시 예산으로 코딩/어학 1타 강사 인강 프리패스권 시민 배포", transport: "킥보드/카셰어링 통합 모빌리티(MaaS) 앱 시민 보급", culture: "시청 광장을 매주 인디 밴드와 푸드트럭 팝업 스토어로 개방", housing: "셰어하우스형 창업자 주거 공간 '청년 빌리지' 구축", environment: "플라스틱 제로 보상제 도입 (재활용 시 지역화폐 환급)"
    }
  },

  // ===================== [3. 광역의원 (도의원/시의원)] =====================
  { 
    id: 301, electionId: 'provincial_council', name: "김도의", party: "여당", bio: "현) 도의원", desc: "예산 예결위 1인자, 예산 폭탄 투하",
    pledges: { welfare: "경로당 스마트 안마의자 전면 무상 보급", education: "시·군 간 교육격차 해소 거점학교 예산 편성", transport: "숙원 사업인 외곽 인터체인지(IC) 승인 조기 확정", culture: "도립 파크골프장 추가 건설 및 체육회 지원금 2배 이상 연장", housing: "구도심 낙후 지역 소규모 재건축 가로주택정비사업 완화", environment: "하천 정비 공사 예산 조기 집행" }
  },
  { 
    id: 302, electionId: 'provincial_council', name: "이견제", party: "제1야당", bio: "전) 시민단체장", desc: "폭주하는 도정 견제수, 혈세 지킴이",
    pledges: { welfare: "장애인 이동권 보장 콜택시 예산안 30% 순증", education: "학교폭력 방지 전담 상담사 1교 1인 필수 배치 조례안", transport: "안전 사각지대 교차로 50개소 스마트 횡단보도 의무화", culture: "사라져가는 무형문화재 전수자 매월 생활비 지원 조례안 발의", housing: "반지하 주거환경 강제 개선 지원 예산 확정", environment: "지방하천 수질오염 감시 기구 상설화 조례" }
  },
  { 
    id: 303, electionId: 'provincial_council', name: "황소수", party: "진보당", bio: "전) 비정규직 지회장", desc: "약자의 목소리를 도의회로",
    pledges: { welfare: "비정규직 노동자 유급 병가 지원 조례 신설", education: "학급당 학생 수 20명 상한제 권고 조례 발의", transport: "택시 기사 쉼터 및 플랫폼 노동자 휴게실 10구역 조성", culture: "동네 소극장 및 독립서점 임대료 지원 특례", housing: "청년 주거 수당 지급 기준 중위소득 150%로 대폭 상향", environment: "공공기관 채식 선택권 보장 의무 조례 발의" }
  },
  { 
    id: 304, electionId: 'provincial_council', name: "차자본", party: "제2야당", bio: "전) 기업인 연합회 이사", desc: "기업하기 좋은 경제 도정",
    pledges: { welfare: "기업 장려금 확대를 통한 자발적 사내 복지 일자리 창출 유도", education: "법인세 인하를 통한 기업 주도 직업계 고등학교 육성 지원", transport: "물류 이동 효율화를 위한 대형 화물차 전용 고가도로 건설", culture: "MICE 산업단지 유치를 통한 100조 단위 경제 유발 조례", housing: "개발이익환수제 대폭 완화 조례 발의", environment: "환경 단속 주기를 3년으로 완화하여 영세 공장 부담 경감" }
  },
  { 
    id: 305, electionId: 'provincial_council', name: "정무소", party: "무소속", bio: "전) 지역방송 앵커", desc: "말뿐인 정치를 끝낼 송곳 검증",
    pledges: { welfare: "지자체 장기 미집행 복지 예산 100% 강제 환수 후 재분배", education: "도정 및 기초학력 데이터를 공개하는 정보 투명화 조례", transport: "포트홀(도로 파임) 신고 시 24시간 내 복구 의무화 조례", culture: "지자체장 쌈짓돈 전락한 지역 축제 전면 성과 감사 진행", housing: "지방의원 부동산 투기 방지 윤리 조례 1호 발의", environment: "지하시설 및 미세먼지 데이터 시민 실시간 앱 공개 조례" }
  },

  // ===================== [4. 기초의원 (시/군/구의원)] =====================
  { 
    id: 401, electionId: 'city_council', name: "구의원1", party: "여당", bio: "현) 구의원", desc: "일 잘하는 민원 폭격기",
    pledges: { welfare: "동네 경로당 에어컨 및 안마기 무상 교체", education: "관내 초중고 책걸상 및 화장실 100% 최신식 교체 예산", transport: "골목 주차난 해결! 유휴지 매입 동네 공영주차장 2곳 신설", culture: "동별 배드민턴장 돔구장 설치", housing: "녹슨 수도관 무상 교체 동네 지원 예산", environment: "산책로 해충 퇴치기 100m 간격 집중 설치" }
  },
  { 
    id: 402, electionId: 'city_council', name: "구의원2", party: "제1야당", bio: "전) 동장", desc: "내 곁에 든든한 동네 일꾼",
    pledges: { welfare: "저소득층 아동 영양 도시락 지원 단가 상향", education: "스쿨존 과속 단속 카메라 및 노란 신호등 전면 도색", transport: "어르신 시내버스 정류장 온열 의자/에어컨 쉼터 설치", culture: "동네 작은 영화관 무료 관람제 신설", housing: "아파트 층간소음 분쟁 조정 위원회 실질적 운영", environment: "재활용 쓰레기 수거 요일제 완화 및 로봇 수거기 도입" }
  },
  { 
    id: 403, electionId: 'city_council', name: "구의원3", party: "진보당", bio: "현) 학부모회장", desc: "엄마의 마음으로 예산을 봅니다",
    pledges: { welfare: "보육교사 휴게시간 보장을 위한 대체 인력 풀 제정", education: "초등학교 방과 후 돌봄 교실 밤 8시까지 100% 보장", transport: "노동자 출퇴근 시 심야 버스 노선 2개 신설", culture: "여성 안심 귀갓길 및 골목 가로등 LED 2배 추가", housing: "주거 빈곤 아동 공부방 도배 장판 무상 지원안", environment: "일본 오염수 방류 대비 학교 급식 식자재 방사능 자체 검사" }
  },
  { 
    id: 404, electionId: 'city_council', name: "구의원4", party: "제2야당", bio: "전) 자율방범대장", desc: "지역 치안과 활력의 대명사",
    pledges: { welfare: "참전유공자 지역 수당 매월 10만원 증액 조례", education: "학교 반공 안보 교육 및 역사 교육 정상화 지원", transport: "전통시장 진입로 불법 주정차 벌금 유예 혜택", culture: "전통시장 청년몰 예산 삭감 및 트로트 가요제 신설", housing: "오래된 구옥 규제 해제 ➡️ 원룸촌 임대인 수익성 제고", environment: "과도한 동네 길고양이 급식소 철거 및 위생 관리 강화" }
  },
  { 
    id: 405, electionId: 'city_council', name: "구의원5", party: "무소속", bio: "전) 맘카페 매니저", desc: "카페에서 뭉친 동네 파워",
    pledges: { welfare: "다자녀 가구 종량제 봉투 100장 무상 지급 조례", education: "동별 공공형 키즈카페 1개소 의무 설치안", transport: "과속방지턱 규격 위반 지역 전면 재시공 요구", culture: "맘카페 연계 주말 플리마켓 차 없는 거리 지정", housing: "신축 아파트 하자 분쟁 지자체 법률 지원 조례", environment: "동네 반려견 놀이터(펫파크) 권역별 1개소 설치" }
  },

  // ===================== [5. 교육감] =====================
  { 
    id: 501, electionId: 'superintendent', name: "권중도", party: "보수/중도 진영", bio: "전) 대학교 총장", desc: "기초학력 복원 최우선 공교육 마스터",
    pledges: { welfare: "교육복지를 빙자한 퍼주기 예산 삭감 ➡️ 방과후 강사료 2배 인상", education: "학력 진단평가(일제고사 표본) 부활로 하위 10% 의무 보충수업", transport: "중고생 통학용 프리미엄 스쿨버스 대당 지원금 삭감 후 급식 질 향상", culture: "체육/예술 활동 위주 특기자 전형 지원 대폭 수술", housing: "교권 침해 학생 즉각 강제 전학 가능한 기숙형 분리 학교 설립", environment: "생태 감수성 놀이보다 디지털 AI 교육 예산을 5배 상향" }
  },
  { 
    id: 502, electionId: 'superintendent', name: "송진보", party: "진보 진영", bio: "전) 전교조 지부장", desc: "경쟁 없는 따뜻한 에듀토피아",
    pledges: { welfare: "유치원부터 고등학교까지 친환경 무상 급식/무상 우유/무상 체육복", education: "객관식 평가 단계적 폐지 ➡️ 논술형 과정 중심 평가로 100% 전환", transport: "초등학생 스쿨버스 비용 100% 교육청 전액 부담", culture: "학생들이 직접 기획하는 1인 1예술/1악기 방과후 무상 지원", housing: "모든 교직원에게 지역 거주 수당 월 30만원 추가 보장", environment: "학교 옥상 태양광 및 텃밭 100% 설치 ➡️ 생태 노동 교육 필수화" }
  },
  { 
    id: 503, electionId: 'superintendent', name: "오실용", party: "무소속", bio: "현) 교원단체 의장", desc: "이념보다는 아이를 위한 하이브리드 교실",
    pledges: { welfare: "학급당 학생 수 20명 감축을 통한 담임 교사형 밀착 복지", education: "진로적성 맞춤형 고교학점제 도입 및 학과 스펙트럼 100종 확대", transport: "원거리 배정 학생 교통비 현금 지급 바우처 도입", culture: "코딩, AI, 드론 특화 동아리 및 E-sports 대회 교육청 직접 주관", housing: "신규 발령 교사 웰컴 주거 지원금 보증금 대출 이자 전액 원조", environment: "미세먼지 알리미 전 교실 설치 및 대형 공기청정기 의무화" }
  },
  { 
    id: 504, electionId: 'superintendent', name: "김경력", party: "보수 단일 연대", bio: "전) 교육국장", desc: "풍부한 행정력으로 무너진 교권 확립",
    pledges: { welfare: "학생 인권 조례 전면 폐지 및 교권 보호 조례 초강력 입법", education: "특성화고 지원 강화로 고졸 즉시 취업 스펙트럼 2배 상향", transport: "등하교 시간 학교 앞 불법 주정차 학부모 패널티 극대화", culture: "학교 대청소 부활 및 기본 인성 예절 교육 커리큘럼화", housing: "오래된 구형 관사 전면 철거 기반 현대형 교원 숙소 건립", environment: "디지털 기기 중독 방지를 위한 스마트폰 무조건 수거제 도입" }
  },
  { 
    id: 505, electionId: 'superintendent', name: "임새길", party: "무소속", bio: "전) 혁신학교 교장", desc: "학생과 학부모 모두가 즐거운 오픈스쿨",
    pledges: { welfare: "저녁 7시까지 학교 문을 활짝 여는 '올데이 돌봄 교실' 직영 운영", education: "교장 공모제 100% ➡️ 시민과 학부모가 직접 교장을 뽑는 혁신학교", transport: "학원 버스 동승자 탑승 의무 지원금 부분 보조금 편성", culture: "야간 시간대 학교 체육관, 운동장을 지역 사회에 전면 100% 개방", housing: "다문화 가정 학부모 대상 커뮤니티 공간 학교 내 무상 제공", environment: "학생 식당 주 1회 '지구의 날 생태 채식' 권고안 도입" }
  }
];
