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
| `scripts/auto_backup.sh` | 로컬 자동 백업 | 매일 저녁 6시 (선택) |

**이제 팀원들과 안심하고 협업할 수 있어요!** 🎉
