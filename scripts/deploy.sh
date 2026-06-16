#!/usr/bin/env bash
set -euo pipefail

message="${*:-更新网站}"

npm test
npm run build

git add -A

if git diff --cached --quiet; then
  echo "没有需要部署的改动"
  exit 0
fi

git commit -m "$message"
git push
