#!/bin/bash

# ===================================
# Poly Fit - 로컬 자동 백업 스크립트
# ===================================
# 이 스크립트를 cron으로 설정하면
# 하루에 한 번 변경사항을 자동으로 GitHub에 커밋/푸시합니다

cd /Users/gainkdh/Desktop/Poly_fit

# 1. 변경사항 체크
if git diff-index --quiet HEAD --; then
    echo "[$(date)] No changes to commit"
    exit 0
fi

# 2. 모든 파일 스테이징
git add .

# 3. 타임스탬프와 함께 자동 커밋
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Auto backup: $TIMESTAMP"

# 4. GitHub에 푸시
git push https://gainkdh-sys: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@github.com/gainkdh-sys/Poly_fit.git main

echo "[$(date)] Auto backup completed successfully! ✅"
