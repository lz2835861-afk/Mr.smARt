#!/usr/bin/env bash
#
# Cron/LaunchAgent wrapper for the WeChat 公众号 sync.
# Runs `npx tsx web/scripts/sync-wechat.ts --apply` and appends to a log inside
# the archive dir. Safe to run repeatedly (the sync is idempotent).
#
# Manual run:
#   web/scripts/sync-wechat-cron.sh
#
# Config (override via env or your LaunchAgent's EnvironmentVariables):
#   WECHAT_FEED_BASE     default https://ar-wechat.zeabur.app
#   WECHAT_ARCHIVE_DIR   default /Users/luxlu/Desktop/Data center/微信公众号数据
#
set -euo pipefail

# Resolve repo paths from this script's location (web/scripts/ -> web/ -> repo root).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Defaults (the archive path contains spaces — keep it quoted everywhere).
export WECHAT_FEED_BASE="${WECHAT_FEED_BASE:-https://ar-wechat.zeabur.app}"
export WECHAT_ARCHIVE_DIR="${WECHAT_ARCHIVE_DIR:-/Users/luxlu/Desktop/Data center/微信公众号数据}"

LOG_FILE="${WECHAT_ARCHIVE_DIR}/sync.log"
mkdir -p "${WECHAT_ARCHIVE_DIR}"

# Make sure node/npx are on PATH when launched by launchd (minimal env).
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"

{
  echo "==================================================================="
  echo "[$(date '+%Y-%m-%d %H:%M:%S %z')] starting WeChat sync"
  echo "  base=${WECHAT_FEED_BASE}"
  echo "  archive=${WECHAT_ARCHIVE_DIR}"
} >> "${LOG_FILE}"

# Run from the web/ dir so `npx tsx` resolves the local devDependency.
cd "${WEB_DIR}"
if npx tsx scripts/sync-wechat.ts --apply >> "${LOG_FILE}" 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S %z')] sync OK" >> "${LOG_FILE}"
else
  rc=$?
  echo "[$(date '+%Y-%m-%d %H:%M:%S %z')] sync FAILED (exit ${rc})" >> "${LOG_FILE}"
  exit "${rc}"
fi
