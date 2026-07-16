#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p log/deploy
LOG_FILE="log/deploy/latest.log"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REMOTE_PATH="~/www/quadrato.simonegentili.com/public_html/"

{
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploying $BRANCH to siteground"
    npm run build
    rsync -avz --delete dist/ siteground:"$REMOTE_PATH"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy finished"
} > "$LOG_FILE" 2>&1
