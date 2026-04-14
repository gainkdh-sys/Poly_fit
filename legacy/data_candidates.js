/* data_candidates.js */

// ================= [AI 자동 크롤링 덮어쓰기 전용 풀 (더미 없음, 100% 실기조, 증명사진 연결)] =================
// 이 파일은 추후 Python 파이프라인 스크립트를 통해 자동으로 최신화됩니다.

// 헬퍼: 이름을 URL 인코딩 후 아바타 URL 생성 (프리프로세싱)
const genAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=475569&size=128&font-size=0.4&bold=true`;

// 후보 객체 생성 시 imageUrl을 즉시 계산
export const candidates = [
  // ---------------- [서울특별시장] ----------------
  { 
    id: 101, electionType: 'governor', region: ['서울특별시'], name: "오세훈", party: "국민의힘", bio: "현) 제39대 서울특별시장",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Oh_Se-hoon.jpg",
    desc: "동행매력특별시 서울의 완성과 디딤돌 복지",
    pledges: {
      welfare: "약자와의 동행 정책 확대 및 안심소득(디딤돌소득) 10배 확대 시범운영",
      education: "서울형 교육플랫폼 '서울런' 가입 확대 및 저소득층 인강 무상 지원",
      transport: "기후동행카드 혜택 대폭 향상 및 수도권 광역 연계 철도망 재구축",
      culture: "그레이트 한강 프로젝트 완수를 통한 수변 르네상스 마이스 타운 조성",
      housing: "모아타운 및 신속통합기획(신통기획) 가속화하여 원도심 슬럼화 재정비",
      environment: "도심 자율주행 노선 확대 및 여의도·강남 일대 대규모 공중 녹지 조성"
    }
  },
  { 
    id: 102, electionType: 'governor', region: ['서울특별시'], name: "박주민", party: "더불어민주당", bio: "현) 3선 국회의원 | 전) 더불어민주당 최고위원",
    imageUrl: genAvatar("박주민"),
    desc: "새로운 쇄신으로 1000만 서울 시민의 든든한 바람막이",
    pledges: {
      welfare: "국공립 어린이집 동별 3배 확충 및 전 시민 대상 거점형 공공의료센터 신설",
      education: "친환경 학교 무상급식 질 상향 및 교육 불평등 해소 예산 1조원 투입",
      transport: "지하철 1~8호선 노후 차량 전면 교체 및 출퇴근 시간대 증차 의무화",
      culture: "1km 내 생활체육관 100개 건립 및 청년 독립예술인 기본수당 도입",
      housing: "역세권 청년 주택 월세 인하 및 다주택자 규제 강화를 통한 투기 자본 차단",
      environment: "일회용품 제로 서울 선포 및 신재생에너지(태양광) 의무화 구역 대폭 확대"
    }
  },
  { 
    id: 103, electionType: 'governor', region: ['서울특별시'], name: "정원오", party: "더불어민주당", bio: "현) 제8대 성동구청장 (3선)",
    imageUrl: genAvatar("정원오"),
    desc: "1등 성동구의 기적을 스탠다드 서울 전체로 확산시킵니다",
    pledges: {
      welfare: "스마트 포용 도시 기술을 활용한 1인 가구/노인 맞춤형 모니터링 복지망 구축",
      education: "학습 부진아를 위한 학교 밖 멘토링 직영 플랫폼 구축",
      transport: "성수동식 스마트 횡단보도, 스마트 버스 쉼터 25개 구 전면 의무 도입",
      culture: "성수동 아틀리에 거리를 벤치마킹한 권역별 로컬 크리에이터 타운 조성",
      housing: "필수노동자를 위한 도심 내 저렴한 주거 공간 우선 임대 조례안 발의",
      environment: "도심 내 빗물 펌프장 활용 산책로 개발 및 탄소중립 마일리지 현금화 허용"
    }
  },

  // ---------------- [경기도지사] ----------------
  { 
    id: 201, electionType: 'governor', region: ['경기도'], name: "김동연", party: "더불어민주당", bio: "현) 제36대 경기도지사 | 전) 경제부총리",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Kim_Dong-yeon_%282022%29.jpg",
    desc: "1,400만 도민의 삶을 바꾸는 실질적인 경제 해법 '김동연 노믹스'",
    pledges: {
      welfare: "기회소득(예술인/체육인/장애인) 대상자 전면 확대 및 현금성 바우처 강화",
      education: "반도체·AI 인재 양성을 위한 100조 기업 연계형 융합 계약학과 집중 육성",
      transport: "GTX 플러스(E·F·G 노선) 신설 및 똑버스(DRT) 등 수요응답형 대중교통 1천대 증차",
      culture: "경기 서·북부권 대형 문화콘텐츠 밸리 조성",
      housing: "시세의 50~70% 수준인 기본주택(지분적립형) 20만호 부지 확보 추진",
      environment: "RE100 비전 가속화로 공공기관 100% 신재생에너지 전환 달성"
    }
  },
  { 
    id: 202, electionType: 'governor', region: ['경기도'], name: "추미애", party: "더불어민주당", bio: "현) 6선 국회의원 | 전) 법무부장관",
    imageUrl: genAvatar("추미애"),
    desc: "강력한 리더십으로 낡은 행정 개혁, 도민 중심 민생 선봉장",
    pledges: {
      welfare: "의료 소외 지역(연천/가평 등) 도립 병원 신규 건립 및 필수 의료 책임 조례",
      education: "지자체 주관 친환경·유기농 무상 아침 급식 전면 시행",
      transport: "도내 광역버스 노선 공공 관리제 100% 조기 전환",
      culture: "대기업 스포츠/엔터테인먼트 구단 연고지 밀착 지원 특례 제정",
      housing: "1기 신도시(분당, 일산, 평촌) 특별법의 신속·공정 적용 및 세입자 이주 대책 의무화",
      environment: "팔당상수원 규제 합리화 ➡️ 수질 개선과 지역 경제 시너지 확보"
    }
  },
  { 
    id: 203, electionType: 'governor', region: ['경기도'], name: "안철수", party: "국민의힘", bio: "현) 4선 국회의원 | 전) 20대 대통령직인수위원장",
    imageUrl: genAvatar("안철수"),
    desc: "IT 융합 전문가의 결단력! 경기도를 한국의 실리콘밸리로 탈바꿈",
    pledges: {
      welfare: "현금 살포 대신 헬스케어 기반 과학적 예방 의학 모니터링 인프라 전역 설치",
      education: "초등생 대상 도 직영 스팀(STEAM)·코딩 조기 코스 도입",
      transport: "판교테크노밸리식 완전 자율주행 승합차 시범 지역 도내 주요 도심 5곳 확대",
      culture: "글로벌 게임 전시회 / e스포츠 토너먼트 메가 허브 타운 육성",
      housing: "과도한 부동산 세제 완화 요청 및 청년 테크 종사자 전용 기숙 아파트 1만 호 분양",
      environment: "과학기술 기반 미세먼지 측정 촘촘한 센서망 구축 및 친환경 수소 인프라 선도"
    }
  },

  // ---------------- [부산광역시장] ----------------
  { 
    id: 301, electionType: 'governor', region: ['부산광역시'], name: "박형준", party: "국민의힘", bio: "현) 제39대 부산광역시장",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Park_Heong-joon.jpg",
    desc: "글로벌 허브 도시, 다시 태어나도 살고 싶은 메가시티 부산 완성",
    pledges: {
      welfare: "15분 도시 프로젝트 고도화 ➡️ 내 집 앞 15분 안착형 스마트 복지관 100개 조성",
      education: "영어하기 편한 도시 선포 및 전 초/중교 원어민 지원 확대",
      transport: "가덕도 신공항 패스트트랙 조기 완공 및 어반루프(도심 고속철) 마스터플랜 착수",
      culture: "오페라하우스 완공 및 글로벌 K-아레나 유치 기조 지속",
      housing: "북항 재개발 2단계 가속화로 국제 해양 비즈니스 & 고급 주거 콤플렉스 착수",
      environment: "낙동강 수질 획기적 개선안 및 취수원 다변화 추진"
    }
  },

  // ---------------- [경상남도지사] ----------------
  { 
    id: 401, electionType: 'governor', region: ['경상남도'], name: "박완수", party: "국민의힘", bio: "현) 제38대 경상남도지사 | 전) 국회의원 (2선)",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/07/Park_Wan-soo_in_2016.png",
    desc: "흔들림 없는 도정 연속성으로 우주항공청 배후 산업 대도약 확립!",
    pledges: {
      welfare: "선별적 핀셋 복지 내실화 및 노인 보건·의료 센터 5개소 확충",
      education: "우주항공 계약학과 전면 지원 및 거점 국립대 '의대 정원 확대' 기조 유지",
      transport: "남해안 아일랜드 하이웨이 건설 및 진경(진주-사천) 고속철도망 조기 착공",
      culture: "남해안 해양·섬 뷰티 관광벨트 대규모 글로벌 자본 유치 추진",
      housing: "원도심 규제 완화 및 재개발 활성화를 통해 도심형 아파트 브랜드 공급 시그널",
      environment: "규제 프리존 구역 대폭 지정을 통한 공장 유치 및 기업규제 우선 풀기"
    }
  },
  { 
    id: 402, electionType: 'governor', region: ['경상남도'], name: "김경수", party: "더불어민주당", bio: "전) 제37대 경상남도지사 | 전) 대통령 직속 위원장",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Kim_Kyoung-soo.jpg",
    desc: "부울경 메가시티 부활로 청년이 떠나지 않는 경남 완성!",
    pledges: {
      welfare: "전 도민 재난기본소득 연 100만원 시범 보장 및 달빛어린이병원 10개 확충",
      education: "지역 거점대 무상교육 시대 및 공교육 중심 친환경 태블릿 PC 전교 무상 확보",
      transport: "김해공항-창원-진주를 잇는 부울경 교통 그물망(광역급행버스) 전면 통합 징수",
      culture: "1시·군별 문화예술 청년 창작소 50곳 설립 및 지자체 매입 갤러리 가동",
      housing: "도유지 기반 '반값 영구 공공임대아파트' 2만 호 청년·신혼특별 조기 공급",
      environment: "경남형 그린 뉴딜 재가동 ➡️ 대형 태양광 단지 및 스마트 신재생 생태계 복원"
    }
  },

  // ---------------- [기초단체장: 진주시장] ----------------
  { 
    id: 501, electionType: 'mayor', region: ['경상남도', '진주시'], name: "조규일", party: "국민의힘", bio: "현) 제9대 진주시장 (재선)",
    imageUrl: genAvatar("조규일"),
    desc: "서부경남 메가시티 선도, K-기업가정신의 심장 진주의 르네상스!",
    pledges: {
      welfare: "초대형 종합 실버타운 건립 및 서부경남 공공병원 조기 안착 지원",
      education: "우주항공 진로특화 교육망 구축 및 시청 주도 학생 코딩 멘토 코스 신설",
      transport: "혁신도시-구도심 연결 왕복 6차선 남강 우회도로 전면 뚫어 통행 난제 격파",
      culture: "진주성-남강 야간 경관 조명 랜드마크화 및 남강유등축제 글로벌 관광지 격상",
      housing: "구도심 도시재생뉴딜사업 예산 추가 투입 및 슬럼가 보도블럭 전면 교체",
      environment: "남강 수질 보호 강화 및 국가생태탐방로 일대 정비 공사 확대"
    }
  },
  { 
    id: 502, electionType: 'mayor', region: ['경상남도', '진주시'], name: "갈상돈", party: "더불어민주당", bio: "현) 민주당 진주갑 지역위원장",
    imageUrl: genAvatar("갈상돈"),
    desc: "고인물을 청산하는 젊은 행정, 시민과의 소통이 가장 먼저입니다!",
    pledges: {
      welfare: "진주시민 기본소득 첫 도입 및 야간·휴일 소아전문병원 시립 2개소 지정",
      education: "친환경 식자재 무상 급식 질 상향 및 공공형 스터디 카페 동별 전면 신축",
      transport: "시내버스 적자 타개를 위한 노선 빅데이터 전면 재편 및 환승 대기시간 5분 컷",
      culture: "관주도형 일회성 축제 통폐합 ➡️ 지역 문화예술인 직접 지원 현금 바우처 투입",
      housing: "청년 1인가구 월세 20만원 지원 정책 확장 및 빈집 매입 셰어하우스화 추진",
      environment: "도심 내 대규모 미세먼지 차단용 에코 숲 벨트 및 자전거 고속도로 신설"
    }
  },
  { 
    id: 503, electionType: 'mayor', region: ['경상남도', '진주시'], name: "류재수", party: "진보당", bio: "전) 시의원 3선 | 진보당 진주 지역위원장",
    imageUrl: genAvatar("류재수"),
    desc: "서민 노동자의 이웃 아저씨, 동네 골목 핏줄까지 수혈하는 강력한 힘",
    pledges: {
      welfare: "요양보호사 등 돌봄 노동자 처우 대폭 개선 및 시립 24시간 공공 야간 약국 3곳 신설",
      education: "학교 밖 청소년/위기 아동 전담 직영 멘토링 기구 개설 및 노동 인권 교육 필수화",
      transport: "만 18세 이하 청소년 시내버스 전면 무상교통 카드 도입",
      culture: "엘리트 예술 지원 축소 ➡️ 주민 체육시설(배드민턴장, 생활센터) 예산 전면 전환",
      housing: "SH/LH 임대주택 관리 문제점 지자체 직권 조사 강화 및 영세 세입자 법률구조 신설",
      environment: "산업단지 주변 대기오염물질 감시 전담 센터 개소 및 강력 규제 조례안 즉시 발의"
    }
  },

  // ---------------- [시·도 교육감: 경남] ----------------
  { 
    id: 601, electionType: 'superintendent', region: ['경상남도'], name: "권순기", party: "보수·중도 진영", bio: "전) 경상국립대학교 총장",
    imageUrl: genAvatar("권순기"),
    desc: "무너진 공교육 학력을 탄탄히 복원, 미래로 뻗어가는 엘리트 맞춤형 교육!",
    pledges: {
      welfare: "퍼주기 논란 예산 삭감 ➡️ 방과후 우수 강사료 대폭 인상으로 공교육 품질 고도화",
      education: "학력 진단평가 시스템 부활을 통한 객관적 지표 확인 및 기초학력 미달자 전담 수업",
      transport: "스쿨버스 관리 위탁 효율화 및 지자체 교통비 직접 지원 이관 요구",
      culture: "경쟁력 없는 잡다한 특활 축소 ➡️ 기초 코딩, 수학, 영재 등 핵심 과목 몰입 캠프 확대",
      housing: "오래된 구형 교원 관사 전면 재건축 기반 최신식 아파트형 숙소 대거 신규 분양 수준 투자",
      environment: "디지털 기기 중독 방지를 위해 학내 스마트폰 수거 권고제 도입 및 교권 보호 조례 초강력 입법"
    }
  },
  { 
    id: 602, electionType: 'superintendent', region: ['경상남도'], name: "송영기", party: "진보 진영", bio: "전) 전교조 경남지부장",
    imageUrl: genAvatar("송영기"),
    desc: "경쟁 없는 따뜻한 에듀토피아! 차별 없이 모두 함께 성장하는 인권 학교",
    pledges: {
      welfare: "유치원부터 고등학교까지 체육복, 우유, 수학여행 비용 완전 무상 3종 세트 도입",
      education: "서열식 객관식 평가 단계적 축소 ➡️ 논술, 토론 형 절대평가 비중 80% 확대",
      transport: "원거리 배정 고등학생 교통비 10만원 상한 교육청 직불형 바우처 일괄 도입",
      culture: "1학생 1악기 무상 지원 및 학생 자치회 예산 편성권 실질적 보장 확립",
      housing: "도서벽지(산간) 발령 신규 교사를 위한 '웰컴 주거 전세 이자 지원금' 전액 직접 원조",
      environment: "생태 노동 교육 정규 과목 편성 및 '지구의 날 채식의 날' 주 1회 권고 적용"
    }
  }
];
