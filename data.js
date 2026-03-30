export const categories = [
  { id: 'welfare', name: '복지', icon: '🫂' },
  { id: 'education', name: '교육', icon: '🏫' },
  { id: 'transport', name: '교통 및 인프라', icon: '🚆' },
  { id: 'culture', name: '문화', icon: '🎭' },
  { id: 'housing', name: '주거', icon: '🏠' },
  { id: 'environment', name: '환경', icon: '🌳' }
];

export const questions = [
  {
    title: "만약 지방정부 예산이 추가로 확보되었다면,<br/>가장 먼저 어디에 쓰여야 할까요?",
    options: [
      { text: "우리 동네 공원 및 맨발 걷기 숲길 조성", category: "environment" },
      { text: "대학병원급 지역 거점 의료 인프라 확충", category: "welfare" },
      { text: "대규모 복합 문화예술회관 및 체육센터 건립", category: "culture" },
      { text: "지역 흩어진 도서관 통합 및 평생학습관 건립", category: "education" },
      { text: "만성 정체구간 지하화 및 대중교통 배차간격 단축", category: "transport" },
      { text: "청년 특화 공공임대 및 1인가구를 위한 셰어하우스 운영", category: "housing" }
    ]
  },
  {
    title: "당신이 가장 살고 싶은 지역의 진정한 모습은?",
    options: [
      { text: "출퇴근이 환상적인, 광역 교통망(GTX)이 뚫린 동네", category: "transport" },
      { text: "주말마다 미술관, 공연장에서 영감을 얻는 동네", category: "culture" },
      { text: "쓰레기 없는 거리에 전기차 충전소가 넉넉한 동네", category: "environment" },
      { text: "집값 걱정 없이 깨끗하고 질 좋은 임대 주택이 있는 동네", category: "housing" },
      { text: "아이들이 밤늦게 학원을 다녀도 스쿨존이 안전한 스마트 동네", category: "education" },
      { text: "어르신, 소상공인 모두가 소외받지 않고 존중받는 동네", category: "welfare" }
    ]
  },
  {
    title: "이번 주말, 당신의 동네에서 시간을 보낸다면<br/>가장 필요하다고 느끼는 것은 무엇인가요?",
    options: [
      { text: "가족과 함께 재미있게 방문할 수 있는 대형 어린이 체험관", category: "education" },
      { text: "상가 주차 시 스트레스 없는 초대형 스마트 주차장", category: "transport" },
      { text: "누가 아플 때 걱정 없이 다녀올 수 있는 주말 24시간 달빛 공공병원", category: "welfare" },
      { text: "반려견과 언제든 산책할 수 있는 친환경 둘레길 생태계", category: "environment" },
      { text: "퇴근 후 즐기는 와인 클래스, 요가 등 원데이 클래스 인프라", category: "culture" },
      { text: "요즘 청년들을 위한 코워킹 스페이스 및 커뮤니티 공간", category: "housing" }
    ]
  }
];

export const candidates = [
  {
    id: 1,
    name: "김대한",
    party: "미래발전당",
    bio: "현) 미래발전당 지역위원장 | 전) 대한경제연구소 수석연구원",
    desc: "실리와 성장을 중시하며 지역 경제 도약을 약속합니다. 풍부한 일자리와 튼튼한 인프라야말로 복지의 시작이라고 믿습니다.",
    pledges: {
      welfare: "현금성 복지 축소 및 취업 연계형 맞춤형 복지 예산 증액",
      education: "자사고/특목고 유치를 통한 명품 학군 조성",
      transport: "GTX 노선 조기 개통 및 상습 정체구간 지하 고속화 도로 건설",
      culture: "K팝 아레나 및 랜드마크 융합형 전시컨벤션 센터 건립",
      housing: "재개발/재건축 규제 과감한 완화, 민간 주도의 주택 공급 확대",
      environment: "도심 하천 수변공원화(르네상스) 및 상업지구 정비"
    }
  },
  {
    id: 2,
    name: "이민국",
    party: "시민행복당",
    bio: "현) 시민행복당 인권위원회 위원 | 전) 10년 경력 시민단체 연합대표",
    desc: "모두가 평등하고 따뜻한 공동체를 지향합니다. 누구나 사람답게 살 권리를 누리는 생태 복지 도시를 만들겠습니다.",
    pledges: {
      welfare: "보편적 무상 돌봄, 전 연령대 아동수당 확대 및 급식 무상화",
      education: "공교육 정상화! 학급당 학생 수 20명 상한제 실시",
      transport: "시내버스 완전 무상화 시범 도입 및 무장애(Barrier-free) 버스 전면 개편",
      culture: "1동 1소규모 갤러리 및 도보 5분 생활문화센터 집중 건립",
      housing: "장기전세 공공임대주택 10만 호 즉각 공급 및 전세 사기 방지 조례 제정",
      environment: "도심 속 대규모 생태숲 5개소 신규 조성 및 2030 탄소 제로 도시 선언"
    }
  },
  {
    id: 3,
    name: "박혁신",
    party: "청년새결당",
    bio: "현) IT 스타트업 (주)혁신네트웍스 대표",
    desc: "기존의 정치를 거부합니다! IT 기술을 행정에 접목한 혁신과 1인가구, 청년 세대의 주거 및 일자리에 집중하는 새로운 리더십입니다.",
    pledges: {
      welfare: "청년/1인가구 기본소득 도입 및 반려가구 전용 지원 패키지 신설",
      education: "디지털 리터러시 의무 교육 및 초중고 메타버스 학교 플랫폼 구축",
      transport: "PM(전동킥보드 등) 전용 차로 신설 및 AI 기반 수요응답형 셔틀버스 도입",
      culture: "지역 인디 페스티벌 정례화 및 청년 예술 창작 활동 기본 지원금 지급",
      housing: "청년, 신혼부부 대상 반값 역세권 스마트홈(모듈러 공법) 파격 보급",
      environment: "공공주차장 전기/수소차 충전소 100% 의무화 및 재활용 앱 통합개발"
    }
  }
];
