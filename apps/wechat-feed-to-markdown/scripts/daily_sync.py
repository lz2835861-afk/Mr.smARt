"""Daily sync: trigger wewe-rss refresh, then scrape any new articles to disk.

Run as a daily cron. Reuses backfill.py logic — backfill is fully resume-safe,
so daily_sync == backfill with a smaller `since-days` window. We just:
  1. Hit /trpc/feed.refreshArticles to make wewe-rss go pull new articles from WeChat
  2. Wait briefly for the async refresh to register new IDs
  3. Run backfill with --since-days 14 (so we always fetch the last 2 weeks just in case)
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import quote

import httpx

BASE = os.environ.get("WEWERSS_BASE_URL", "").rstrip("/")
if not BASE:
    raise SystemExit(
        "ERROR: set WEWERSS_BASE_URL env var to your wewe-rss instance URL.\n"
        "  e.g. export WEWERSS_BASE_URL=https://your-wewe-rss.example.com"
    )


def trigger_refresh(mp_id: str, auth: str) -> dict:
    """Call feed.refreshArticles mutation (POST). Returns the result body."""
    url = f"{BASE}/trpc/feed.refreshArticles"
    payload = {"json": {"mpId": mp_id}}
    r = httpx.post(
        url,
        json=payload,
        headers={"Authorization": auth, "Content-Type": "application/json"},
        timeout=180.0,
    )
    r.raise_for_status()
    return r.json()


def is_refresh_running(auth: str) -> bool:
    url = f"{BASE}/trpc/feed.isRefreshAllMpArticlesRunning"
    r = httpx.get(url, headers={"Authorization": auth}, timeout=30.0)
    if r.status_code != 200:
        return False
    try:
        return bool(r.json()["result"]["data"])
    except (KeyError, TypeError):
        return False


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Daily incremental sync: refresh wewe-rss + scrape new articles."
    )
    ap.add_argument("--mp-id", required=True, help="wewe-rss feed id, e.g. MP_WXS_1234567890")
    ap.add_argument("--auth-file", default=".auth", help="path to file containing wewe-rss AUTH_CODE")
    ap.add_argument("--output", type=Path, default=Path("output"), help="output directory")
    ap.add_argument(
        "--lookback-days",
        type=int,
        default=14,
        help="re-scan articles from last N days for any new ones (default: 14)",
    )
    ap.add_argument(
        "--no-refresh",
        action="store_true",
        help="skip triggering wewe-rss refresh (just scan what's already in DB)",
    )
    args = ap.parse_args()

    auth = Path(args.auth_file).read_text().strip()
    args.output.mkdir(parents=True, exist_ok=True)

    if not args.no_refresh:
        print(f"🔄 triggering wewe-rss refresh for {args.mp_id}...")
        try:
            result = trigger_refresh(args.mp_id, auth)
            print(f"   server returned: {json.dumps(result, ensure_ascii=False)[:200]}")
        except httpx.HTTPStatusError as e:
            print(f"   ⚠ refresh failed (HTTP {e.response.status_code}): {e.response.text[:200]}")
            print("   continuing anyway — will scan whatever's already in DB")
        except Exception as e:
            print(f"   ⚠ refresh exception: {type(e).__name__}: {e}")
            print("   continuing anyway")

        # Wewe-rss refresh is async — give it a few seconds to register new IDs
        print("   waiting 5s for refresh to register new article IDs...")
        time.sleep(5)

    print(f"\n🔍 scanning past {args.lookback_days} days for new articles...\n")
    # Delegate to backfill script — it's already resume-safe
    import subprocess

    cmd = [
        sys.executable,
        "backfill.py",
        "--mp-id",
        args.mp_id,
        "--auth-file",
        args.auth_file,
        "--output",
        str(args.output),
        "--since-days",
        str(args.lookback_days),
    ]
    subprocess.run(cmd, check=False)


if __name__ == "__main__":
    main()
