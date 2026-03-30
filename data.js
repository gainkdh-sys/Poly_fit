/* data.js */
export const categories = [
  { id: 'welfare', name: '복지' },
  { id: 'education', name: '교육' },
  { id: 'transport', name: '교통 및 인프라' },
  { id: 'culture', name: '문화' },
  { id: 'housing', name: '주거' },
  { id: 'environment', name: '환경' }
];

// 총 18개 핵심 가치관 발굴 질문 (카테고리당 3개)
export const questions = [
  // 복지 (welfare)
  { text: "우리 지역의 거점 응급의료센터 및 심야 달빛어린이병원 확충이 최우선 과제입니까?", category: "welfare" },
  { text: "고령화 대비를 위해 노인 복지관 확대 및 지자체 기초연금성 지원금이 늘어나야 합니까?", category: "welfare" },
  { text: "청년 및 1인가구를 위한 '찾아가는 마음안심돌봄' 및 생활 지원 서비스가 필요하십니까?", category: "welfare" },
  
  // 교육 (education)
  { text: "미래 인재 양성을 위한 첨단 AI/코딩 스마트 학습관 건립에 예산을 대거 투입해야 합니까?", category: "education" },
  { text: "무상 공공급식의 질적 개선과 무상 교복, 무상 우유 지원 예산의 완전한 확충이 중요합니까?", category: "education" },
  { text: "아이들의 안전을 위해 도로를 뜯더라도 스쿨존 및 통학버스가 완벽하게 보장되어야 합니까?", category: "education" },
  
  // 교통 (transport)
  { text: "출퇴근 상습 정체 구간을 뚫기 위해 대규모 도로망 신설과 교차로 확장이 필요하십니까?", category: "transport" },
  { text: "시내버스 완전 공영제 도입 및 지자체 차원의 파격적인 대중교통 노선 지원이 중요합니까?", category: "transport" },
  { text: "KTX 급행철도나 도심항공교통(UAM) 등 초광역 교통 인프라 고도화가 최우선입니까?", category: "transport" },
  
  // 문화 (culture)
  { text: "인구 유인을 위해 대규모 K팝 아레나 및 다목적 문화컨벤션 센터 건립이 핵심 과제입니까?", category: "culture" },
  { text: "동네 곳곳 소규모 생활문화센터, 동네 작은도서관 확충이 대형 센터보다 필요하십니까?", category: "culture" },
  { text: "지역을 대표하는 대형 계절 축제(유등축제 등)의 글로벌 진출 예산을 늘려야 합니까?", category: "culture" },
  
  // 주거 (housing)
  { text: "청년, 신혼부부를 위한 시세의 절반 가격인 공공 안심 임대주택 대거 보급이 시급하십니까?", category: "housing" },
  { text: "낡은 원도심의 빈집 살리기 및 도시재생 뉴딜사업이 거대한 신도시 아파트 개발보다 중요합니까?", category: "housing" },
  { text: "전세사기 피해구제센터 등 지자체가 직접 나서는 강력한 거주 안정 정책이 필요합니까?", category: "housing" },
  
  // 환경 (environment)
  { text: "개발보다는 도심 내 대규모 맨발 걷기 숲길, 생태공원 등 친환경 녹지공간 확대가 1순위입니까?", category: "environment" },
  { text: "지역 내 공단 및 산업시설의 악취, 폐수 단속을 규제가 타이트해지더라도 강화해야 합니까?", category: "environment" },
  { text: "수소차/전기차 충전소 인프라 확대 및 시민 주도형 에너지 전환(태양광) 정책을 선도해야 합니까?", category: "environment" }
];

export const electionsList = [
  { id: 'governor', name: '광역자치단체장 (도지사 등)' },
  { id: 'mayor', name: '기초자치단체장 (시장/구청장 등)' },
  { id: 'provincial_council', name: '광역의회의원 (도의원 등)' },
  { id: 'city_council', name: '기초의회의원 (시/구의원 등)' },
  { id: 'superintendent', name: '교육감' }
];

/* 
 * 5. 다중 선거 선택에 대비한 더미(가상/예측) 후보군 데이터.
 * 각 후보는 [welfare, education, transport, culture, housing, environment] 순서에 대해
 * 본인이 중점을 두는 정책 스코어(1~10점) 벡터를 가지고 있습니다.
 * (사용자의 설문 스코어와 벡터 거리를 계산해 일치율을 100% 매칭합니다.)
 */
export const candidates = [
  // 도지사 급 후보군
  { 
    id: 101, electionId: 'governor', name: "박완수", party: "국민의힘", 
    bio: "현) 제38대 경상남도지사 | 전) 제20·21대 국회의원", desc: "강력한 도정 연속성을 바탕으로 남해안 관광벨트 육성 및 우주항공청 기반 산업 경제를 확실히 챙기겠습니다.", 
    policyVector: { welfare: 4, education: 5, transport: 9, culture: 8, housing: 7, environment: 4 }
  },
  { 
    id: 102, electionId: 'governor', name: "김경수", party: "더불어민주당", 
    bio: "전) 제37대 경상남도지사 | 전) 대통령 직속 지방시대위원장", desc: "청년들의 이탈을 막고, 균형 잡힌 주거 복지와 혁신적인 교육 생태계로 부울경 메가시티를 재건하겠습니다.", 
    policyVector: { welfare: 9, education: 8, transport: 6, culture: 6, housing: 8, environment: 7 }
  },
  
  // 구/시/군장 (진주시장 예비군 모티브)
  { 
    id: 201, electionId: 'mayor', name: "조규일", party: "국민의힘", 
    bio: "현) 제9대 진주시장 (재선)", desc: "K-기업가정신 전파, 우주항공청 배후도시 대책 완수를 통해 위상을 높이겠습니다.", 
    policyVector: { welfare: 5, education: 6, transport: 9, culture: 9, housing: 7, environment: 4 }
  },
  { 
    id: 202, electionId: 'mayor', name: "갈상돈", party: "더불어민주당", 
    bio: "현) 진주갑 지역위원장", desc: "혁신도시와 구도심을 문화예술로 잇는 균형 발전과 촘촘한 지역 복지망을 건설합니다.", 
    policyVector: { welfare: 8, education: 8, transport: 5, culture: 7, housing: 7, environment: 6 }
  },
  { 
    id: 203, electionId: 'mayor', name: "류재수", party: "진보당", 
    bio: "전) 시의원 3선", desc: "낭비성 전시행정을 완전히 끊고 무상 대중교통과 일상 보건복지 체계를 완성하겠습니다.", 
    policyVector: { welfare: 10, education: 6, transport: 8, culture: 3, housing: 9, environment: 8 }
  },

  // 교육감 (현재 2026 예상 진영)
  { 
    id: 301, electionId: 'superintendent', name: "권순기", party: "보수·중도 진영", 
    bio: "전) 경상국립대학교 총장", desc: "무너진 기초 학력을 복원하고 공교육의 경쟁력을 AI 첨단 교육과 함께 끌어올리겠습니다.", 
    policyVector: { welfare: 4, education: 10, transport: 1, culture: 5, housing: 1, environment: 3 }
  },
  { 
    id: 302, electionId: 'superintendent', name: "송영기", party: "진보 진영", 
    bio: "전) 전교조 경남지부장", desc: "경쟁보다는 아이들의 인권 평등이 우선입니다! 차별없는 완전 무상교육 최상위권을 약속합니다.", 
    policyVector: { welfare: 8, education: 9, transport: 1, culture: 4, housing: 1, environment: 7 }
  },
  
  // 광역의원 (도의원 등)
  { 
    id: 401, electionId: 'provincial_council', name: "박광역", party: "여당", 
    bio: "현) 도의원", desc: "도비 확보의 귀재, 지역 SOC 도로교통망 확충 및 상가 정비 사업 조기 달성!", 
    policyVector: { welfare: 3, education: 4, transport: 9, culture: 5, housing: 8, environment: 2 }
  },
  { 
    id: 402, electionId: 'provincial_council', name: "진지방", party: "야당", 
    bio: "전) 지역시민구조대 대표", desc: "불필요한 토목 예산을 전면 삭감하고 취약계층 주거 지원과 청년주택 확대에 투입합니다.", 
    policyVector: { welfare: 8, education: 5, transport: 3, culture: 5, housing: 9, environment: 6 }
  },

  // 기초의원 (시의원 등)
  { 
    id: 501, electionId: 'city_council', name: "김골목", party: "여당", 
    bio: "현) 시의원", desc: "동네 주차난 100% 해결! 가장 먼저 달려가는 동네 특급 심부름꾼이 되겠습니다.", 
    policyVector: { welfare: 4, education: 3, transport: 9, culture: 4, housing: 7, environment: 3 }
  },
  { 
    id: 502, electionId: 'city_council', name: "이이웃", party: "야당", 
    bio: "전) 동대표 연합회장", desc: "안전 구역 확보! 스쿨존 및 노후 공원 둘레길 정비로 안심 동네를 건립합니다.", 
    policyVector: { welfare: 7, education: 7, transport: 4, culture: 4, housing: 5, environment: 8 }
  }
];
