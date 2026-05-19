# 🔄 Poly Fit 자동화 파이프라인 가이드

## 📋 파이프라인 구조

```
┌─────────────────────────────────────────────────────────┐
│  로컬 개발 (VS Code)                                      │
│  └─→ git push ──────────────────────────────────────→   │
│                                                      |    │
│  ┌──────────────────────────────────────────────────┴──┐ │
│  │  GitHub (gainkdh-sys/Poly_fit)                      │ │
│  │  └─→ GitHub Actions 트리거                          │ │
│  │      • deploy.yml: main 브랜치 푸시 감지             │ │
│  │      • auto_update.yml: 주간 자동 실행              │ │
│  └──────────────────────────────────────────────────────┘ │
│         │                          │                      │
│         └─────────────────────────→→ Vercel 자동 배포     │
│                                                            │
│  결과: https://poly-fit.vercel.app 자동 배포!            │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 3가지 자동화 전략

### **1️⃣ GitHub Actions CI/CD (수동 푸시 시 자동 배포)**

**파일**: `.github/workflows/deploy.yml`

**작동 원리**:
- 로컬에서 코드 수정 → `git push main`
- GitHub가 자동으로 감지 → Vercel에 배포 신호
- Vercel이 자동으로 빌드 & 배포 완료

**필요 설정**:
```bash
# GitHub Secrets에 다음 3개 추가 (repo 설정 > Secrets)
VERCEL_TOKEN        # Vercel 토큰
VERCEL_ORG_ID       # Vercel 조직 ID
VERCEL_PROJECT_ID   # Vercel 프로젝트 ID
```

**사용법**:
```bash
# 터미널에서 평소대로
git add .
git commit -m "기능 추가"
git push

# 자동으로 Vercel에 배포됨! ✨
```

---

### **2️⃣ 정기적 데이터 갱신 (매주 자동)**

**파일**: 
- `.github/workflows/auto_update.yml` (주간 자동 실행)
- `scripts/update_candidates.py` (실제 갱신 로직)

**작동 원리**:
- 매주 월요일 새벽 2시에 자동 실행
- `scripts/update_candidates.py`가 후보자 데이터 갱신
- 변경사항 자동으로 GitHub에 커밋/푸시
- Vercel이 다시 배포

**향후 개선 (API 연동)**:
```python
# scripts/update_candidates.py에서 다음 추가:
1. 네이버 뉴스 API / 크롤링으로 최근 발언 수집
2. ChatGPT/Claude API로 자동 요약
3. data.js 자동 생성 & 커밋
```

---

### **2-1️⃣ 선관위 후보자 데이터 자동 동기화**

**파일**:
- `.github/workflows/nec-sync.yml`
- `scripts/nec_sync.py`

**사용 데이터**:
- 중앙선거관리위원회_후보자 정보
- 중앙선거관리위원회_선거공약 정보

**작동 원리**:
- 공공데이터포털 인증키(`NEC_SERVICE_KEY`)로 선관위 API 호출
- 2026년 제9회 전국동시지방선거(`sgId=20260603`) 후보자/예비후보자 수집
- 시·도지사, 구·시·군의 장, 시·도의원, 구·시·군의원, 교육감 데이터를 앱 포맷으로 변환
- 공약 API가 제공되는 선거(시·도지사, 구·시·군의 장, 교육감)는 기본으로 공약까지 병합
- `data/regions/*.json`을 갱신하고 변경사항이 있으면 자동 커밋/푸시

**중요 일정**:
- 2026년 5월 13일까지: 예비후보자 API 중심
- 2026년 5월 14일부터: 공식 후보자 API 중심
- `--kind auto` 옵션은 위 날짜를 기준으로 자동 전환

**GitHub Secrets 설정**:
```bash
NEC_CANDIDATE_SERVICE_KEY  # 중앙선거관리위원회_후보자 정보 API 인증키
NEC_PLEDGE_SERVICE_KEY     # 중앙선거관리위원회_선거공약 정보 API 인증키
```

두 API가 같은 인증키를 공유하는 경우에는 `NEC_SERVICE_KEY` 하나만 등록해도 됩니다. 인증키가 각각 따로 발급되면 두 키를 한 Secret에 이어 붙이지 말고, 위 두 이름으로 각각 등록하세요.

**로컬 실행 예시**:
```bash
# 전체 지역 자동 모드
NEC_CANDIDATE_SERVICE_KEY="후보자정보키" NEC_PLEDGE_SERVICE_KEY="공약정보키" python3 scripts/nec_sync.py --kind auto --with-pledges

# 서울만 예비후보자 데이터 확인, 파일은 쓰지 않음
NEC_CANDIDATE_SERVICE_KEY="후보자정보키" python3 scripts/nec_sync.py --kind pre --sd-name 서울특별시 --dry-run --no-pledges

# 후보자 명부만 갱신하고 공약 API는 생략
NEC_CANDIDATE_SERVICE_KEY="후보자정보키" python3 scripts/nec_sync.py --kind candidate --no-pledges
```

**GitHub Actions 수동 실행**:
```
GitHub 저장소 → Actions → Sync NEC candidate data → Run workflow
```

기본값은 `with_pledges=true`입니다. 선관위 공약 API 호출을 잠시 끄고 싶을 때만 `false`를 선택하세요.

**선거구역 데이터 갱신**:
```bash
# 시·도의원/구·시·군의원 선거구의 관할 동·읍·면 정보를 선관위 선거관리현황에서 갱신
node scripts/fetch_constituency_areas.mjs
```

생성 파일은 `data/constituency-areas.json`입니다. 앱은 의원 선거 선택 카드에 이 파일의 관할 구역을 함께 표시합니다.

---

### **2-2️⃣ 후보자 사진 보강**

**파일**:
- `.github/workflows/photo-enrich.yml`
- `scripts/enrich_candidate_photos.py`
- `data/candidate-photos.json`
- `data/candidate-photo-review.json`

**작동 원리**:
- 앱은 후보 사진을 다음 순서로 표시합니다.
  1. `data/candidate-photos.json`에 승인된 사진
  2. 후보 데이터에 이미 포함된 직접 이미지 URL
  3. 정당 색상 기반 자동 아바타
- 사진 보강 스크립트는 Wikimedia Commons를 검색합니다.
- `CC0`, `Public domain`, `CC BY`, `CC BY-SA`처럼 재사용 가능한 라이선스이고 후보 이름과 강하게 일치하는 경우만 자동 승인합니다.
- 애매한 사진 후보와 공식 홈페이지/SNS 검색 링크는 `data/candidate-photo-review.json`에 검수 대기로 저장합니다.

**GitHub Actions 수동 실행**:
```
GitHub 저장소 → Actions → Enrich candidate photos → Run workflow
```

**로컬 실행 예시**:
```bash
# 후보자 50명까지 사진 후보 검색 후 registry/review 파일 갱신
python3 scripts/enrich_candidate_photos.py --limit 50

# 파일을 쓰지 않고 확인만 하기
python3 scripts/enrich_candidate_photos.py --limit 10 --dry-run
```

**주의**:
- 나무위키 사진은 파일별 라이선스가 불명확할 수 있어 자동 노출하지 않습니다.
- 공식 캠프/홈페이지 사진도 명시적 사용 조건이 없으면 검수 후 수동 등록하는 것을 원칙으로 합니다.

---

### **3️⃣ 로컬 자동 백업 (선택사항)**

**파일**: `scripts/auto_backup.sh`

**작동 원리**:
- 파일 변경 시 자동으로 Git에 커밋
- 하루에 한 번 GitHub에 푸시

**설정 방법** (macOS):
```bash
# 실행 권한 추가
chmod +x /Users/gainkdh/Desktop/Poly_fit/scripts/auto_backup.sh

# crontab 편집
crontab -e

# 다음 줄 추가 (매일 저녁 6시 실행)
0 18 * * * /Users/gainkdh/Desktop/Poly_fit/scripts/auto_backup.sh

# 저장 및 종료 (Ctrl+D)
```

---

## ✅ Vercel에서 GitHub Secrets 설정 방법

1. **GitHub 저장소 설정** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. 다음 3개 추가:

| 이름 | 값 | 어디서 얻나? |
|------|-----|-----------|
| `VERCEL_TOKEN` | Vercel 계정 토큰 | [Vercel Settings](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | 조직 ID | Vercel 대시보드 URL에 포함됨 |
| `VERCEL_PROJECT_ID` | 프로젝트 ID | Vercel 프로젝트 설정 페이지 |

---

## 🎬 실제 사용 흐름

### **시나리오 1: 로컬에서 코드 수정**
```bash
# VS Code에서 수정 후
git add .
git commit -m "UI 개선: 버튼 색상 변경"
git push

# ✅ 1-2분 후 자동으로 Vercel에 배포!
# https://poly-fit.vercel.app 새로고침 하면 변경사항 확인
```

### **시나리오 2: 매주 자동 데이터 갱신**
```
매주 월요일 새벽 2시:
• GitHub Actions가 자동으로 update_candidates.py 실행
• 후보자 최신 정보 수집 & 정리
• data.js 자동 갱신
• GitHub & Vercel 자동 배포
• 팀원들이 새로운 데이터로 업데이트된 사이트 확인!
```

### **시나리오 3: 로컬 자동 백업**
```
매일 저녁 6시:
• 커밋되지 않은 모든 파일 자동으로 GitHub에 업로드
• "Auto backup: 2026-03-30 18:00:00" 같은 메시지로 커밋
• 팀원들도 GitHub에서 최신 상태 확인 가능
```

---

## 🔧 트러블슈팅

### Q: "GitHub Actions 배포가 실패했어요"
**A**: Secrets 설정을 다시 확인하세요
```bash
# GitHub 저장소 → Settings → Secrets and variables
VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID 확인
```

### Q: "Vercel에서 배포 안 되는데?"
**A**: Vercel 대시보드에서 배포 로그 확인
```
Vercel 대시보드 → Deployments → 최신 배포 클릭 → Logs
```

### Q: "Python 스크립트가 실행 안 된다"
**A**: 로컬에서 먼저 테스트
```bash
python /Users/gainkdh/Desktop/Poly_fit/scripts/update_candidates.py
```

---

## 📚 다음 단계

1. **API 연동** (선택사항)
   - 뉴스 크롤링 라이브러리 (BeautifulSoup, Selenium)
   - LLM API (OpenAI GPT-4, Claude)
   - 자동 공약 생성

2. **대시보드 추가**
   - 배포 상태 모니터링
   - 데이터 갱신 로그 확인

3. **팀 협업 강화**
   - PR 자동 리뷰
   - 배포 전 자동 테스트

---

## 💡 핵심 정리

| 파일 | 기능 | 실행 시점 |
|------|------|----------|
| `.github/workflows/deploy.yml` | 푸시 시 Vercel 배포 | `git push` 할 때 |
| `.github/workflows/auto_update.yml` | 주간 자동 데이터 갱신 | 매주 월요일 새벽 2시 |
| `.github/workflows/nec-sync.yml` | 선관위 후보자 데이터 갱신 | 6시간마다/수동 실행 |
| `.github/workflows/photo-enrich.yml` | 후보자 사진 후보 보강 | 수동 실행 |
| `scripts/auto_backup.sh` | 로컬 자동 백업 | 매일 저녁 6시 (선택) |

**이제 팀원들과 안심하고 협업할 수 있어요!** 🎉
