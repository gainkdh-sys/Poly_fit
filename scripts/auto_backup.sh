#!/bin/bash

# ===================================
# Poly Fit - 로컬 자동 백업 스크립트
# ===================================
# 사용법: 
#   1. GitHub_TOKEN 환경변수 설정
#   2. crontab -e에서 이 스크립트 등록

cd /Users/gainkdh/Desktop/Poly_fit

# Github token 확인
if [ -z "$GITHUB_TOKEN" ]; then
    echo "[$(date)] ❌ Error: GITHUB_TOKEN 환경변수가 설정되지 않았습니다"
    echo "설정 방법: export GITHUB_TOKEN='your_token_here'"
    exit 1
fi

# 1. 변경사항 체크
if git diff-index --quiet HEAD --; then
    echo "[$(date)] ℹ️  No changes to commit"
    exit 0
fi

# 2. 모든 파일 스테이징
git add .

# 3. 타임스탬프와 함께 자동 커밋
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Auto backup: $TIMESTAMP"

# 4. GitHub에 푸시 (토큰 사용)
git push https://x-access-token:${GITHUB_TOKEN}@github.com/gainkdh-sys/Poly_fit.git main

if [ $? -eq 0 ]; then
    echo "[$(date)] ✅ Auto backup completed successfully!"
else
    echo "[$(date)] ❌ Auto backup failed"
fi
