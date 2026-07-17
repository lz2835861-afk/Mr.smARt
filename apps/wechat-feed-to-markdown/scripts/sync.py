"""One-command sync: refresh wewe-rss → backfill new articles → sort → prefix.

Designed for daily cron OR ad-hoc "fetch what's new" runs. Idempotent:
running on a fully-up-to-date dir reports "0 new" and exits cleanly.

Workflow:
  1. POST /trpc/feed.refreshArticles to make wewe-rss pull new from WeChat
  2. Run backfill.py --since-days 14 (resume-safe, recursive title check)
  3. Run sort_into_accounts (split flat output into per-公众号 subdirs)
  4. Run prefix_by_date (add YYYY-MM-DD - prefix)
  5. Report: list of new articles fetched in this run

Usage:
    uv run python scripts/sync.py --mp-id MP_WXS_1234567890 --output output_by_account

Env:
    WEWERSS_BASE_URL       (required)  https://your-wewe-rss.example.com
    WEWERSS_AUTH_FILE      (optional)  defaults to .auth in cwd
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

import httpx

BASE = os.environ.get("WEWERSS_BASE_URL", "").rstrip("/")
if not BASE:
    raise SystemExit(
        "ERROR: set WEWERSS_BASE_URL env var to your wewe-rss instance URL.\n"
        "  e.g. export WEWERSS_BASE_URL=https://your-wewe-rss.example.com"
    )

SCRIPT_DIR = Path(__file__).parent


def trigger_refresh(mp_id: str, auth: str) -> str:
    url = f"{BASE}/trpc/feed.refreshArticles"
    try:
        r = httpx.post(
            url,
            json={"json": {"mpId": mp_id}},
            headers={"Authorization": auth, "Content-Type": "application/json"},
            timeout=180.0,
        )
        r.raise_for_status()
        return f"   ✅ refresh ok: {r.text[:120]}"
    except httpx.HTTPStatusError as e:
        body = e.response.text[:200]
        if "暂无可用读书账号" in body:
            return (
                "   ⚠ 微信读书账号 session 过期了 —— refresh API 拉不到新内容。\n"
                "      到 wewe-rss 后台重新扫码登录，下次 sync 就会拿新文章。\n"
                "      (本次 sync 仍会基于已存在 DB 数据增量抓取)"
            )
        return f"   ⚠ refresh 500/4xx (HTTP {e.response.status_code}): {body}"
    except Exception as e:
        return f"   ⚠ refresh exception: {type(e).__name__}: {e}"


def snapshot_titles(root: Path) -> set[str]:
    """Recursive set of dir basenames (the article titles) under root."""
    titles: set[str] = set()
    if not root.exists():
        return titles
    for p in root.rglob("*"):
        if p.is_dir():
            titles.add(p.name)
    return titles


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--mp-id", required=True, help="wewe-rss feed id (MP_WXS_…)")
    ap.add_argument(
        "--auth-file",
        default=os.environ.get("WEWERSS_AUTH_FILE", ".auth"),
        help="path to file with wewe-rss AUTH_CODE (default: .auth or $WEWERSS_AUTH_FILE)",
    )
    ap.add_argument("--output", type=Path, default=Path("output_by_account"))
    ap.add_argument(
        "--lookback-days", type=int, default=14, help="re-scan past N days (default: 14)"
    )
    ap.add_argument(
        "--no-refresh",
        action="store_true",
        help="skip refresh trigger; just scan what's already in DB",
    )
    ap.add_argument(
        "--no-organize",
        action="store_true",
        help="skip sort + date-prefix steps (leave articles flat under --output)",
    )
    args = ap.parse_args()

    # Force line-buffered stdout so parent prints stay interleaved with
    # subprocess output (otherwise parent's prints all flush at exit).
    sys.stdout.reconfigure(line_buffering=True)

    auth = Path(args.auth_file).read_text().strip()
    args.output.mkdir(parents=True, exist_ok=True)

    # --- Phase 1: refresh ---
    if args.no_refresh:
        print("⏩ skipping refresh (--no-refresh)")
    else:
        print(f"🔄 triggering wewe-rss refresh for {args.mp_id}...")
        print(trigger_refresh(args.mp_id, auth))
        time.sleep(5)

    # --- Snapshot before fetch (for diff) ---
    before = snapshot_titles(args.output)

    # --- Phase 2: backfill ---
    print(f"\n🔍 backfill scanning past {args.lookback_days} days...\n")
    cmd = [
        sys.executable,
        str(SCRIPT_DIR / "backfill.py"),
        "--mp-id", args.mp_id,
        "--auth-file", args.auth_file,
        "--output", str(args.output),
        "--since-days", str(args.lookback_days),
    ]
    rc = subprocess.run(cmd).returncode
    if rc != 0:
        print(f"\n❌ backfill exited {rc}; skipping organize step")
        sys.exit(rc)

    # --- Phase 3 + 4: organize ---
    if not args.no_organize:
        print("\n📂 sort_into_accounts...")
        subprocess.run(
            [sys.executable, str(SCRIPT_DIR / "sort_into_accounts.py"),
             str(args.output), str(args.output)],
            check=False,
        )

        print("\n📅 prefix_by_date...")
        subprocess.run(
            [sys.executable, str(SCRIPT_DIR / "prefix_by_date.py"), str(args.output)],
            check=False,
        )

    # --- Diff: what's new this run ---
    after = snapshot_titles(args.output)
    new_dirs = after - before

    print("\n" + "=" * 60)
    if not new_dirs:
        print("✨ Done. No new articles since last sync.")
    else:
        # Filter out parent account dirs (they were created by sort, not fetched).
        # New article dirs are those whose name contains content-like text or
        # date prefix; cheap heuristic: just list everything new.
        print(f"✨ Done. {len(new_dirs)} new dir(s) since last run:")
        for d in sorted(new_dirs):
            print(f"   • {d}")

    if (args.output / "_unclassified").exists():
        unc = list((args.output / "_unclassified").iterdir())
        if unc:
            print(f"\n⚠ {len(unc)} article(s) in {args.output}/_unclassified/ "
                  f"(missing 公众号 metadata — manual review).")


if __name__ == "__main__":
    main()
