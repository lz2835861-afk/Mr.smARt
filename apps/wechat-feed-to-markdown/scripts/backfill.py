"""Backfill: scrape ALL articles for a wewe-rss feed, resume-safe.

Strategy:
  1. List all article ids via tRPC article.list (auth required)
  2. For ids missing from disk, fetch their full HTML via /feeds/{mpId}.json?limit=1&page=N
     - wewe-rss generates content_html on demand by fetching mp.weixin.qq.com server-side
  3. Convert to Markdown using existing pipeline (BS4 → markdownify + image download)
  4. Fall back to Camoufox if the served HTML is a WeChat verify page

Resume: skips articles whose <safe_title>.md already exists.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

import httpx
from bs4 import BeautifulSoup

import wechat_article_to_markdown as w
from feed_to_markdown import _camoufox_fetch, _is_verify_page

BASE = os.environ.get("WEWERSS_BASE_URL", "").rstrip("/")
if not BASE:
    raise SystemExit(
        "ERROR: set WEWERSS_BASE_URL env var to your wewe-rss instance URL.\n"
        "  e.g. export WEWERSS_BASE_URL=https://your-wewe-rss.example.com"
    )


def trpc_get(path: str, payload: dict, auth: str) -> dict:
    encoded = quote(json.dumps({"json": payload}, ensure_ascii=False))
    url = f"{BASE}/trpc/{path}?input={encoded}"
    last_exc = None
    for attempt in range(5):
        try:
            r = httpx.get(url, headers={"Authorization": auth}, timeout=60.0)
            r.raise_for_status()
            return r.json()["result"]["data"]
        except (httpx.HTTPStatusError, httpx.ReadTimeout, httpx.ConnectError) as e:
            last_exc = e
            wait = 5 * (attempt + 1)
            print(f"   trpc {path} attempt {attempt+1}/5 failed ({type(e).__name__}); waiting {wait}s")
            import time as _t
            _t.sleep(wait)
    raise last_exc  # type: ignore


def list_all_articles(mp_id: str, auth: str) -> list[dict]:
    """Page through article.list with smaller chunks (limit=1000 sometimes 502s)."""
    items, cursor = [], None
    while True:
        payload = {"mpId": mp_id, "limit": 50}
        if cursor:
            payload["cursor"] = cursor
        data = trpc_get("article.list", payload, auth)
        batch = data.get("items", [])
        items.extend(batch)
        cursor = data.get("nextCursor")
        if not cursor or not batch:
            break
    return items


def safe_filename(title: str) -> str:
    return re.sub(r'[/\\?%*:|"<>]', "_", title)[:80]


async def fetch_page(mp_id: str, page_num: int, batch: int, client: httpx.AsyncClient) -> list[dict]:
    """Fetch a page of articles from /feeds/{mp}.json with full content_html."""
    url = f"{BASE}/feeds/{mp_id}.json"
    for attempt in range(3):
        try:
            resp = await client.get(url, params={"limit": batch, "page": page_num}, timeout=180.0)
            resp.raise_for_status()
            return resp.json().get("items", [])
        except (httpx.HTTPStatusError, httpx.ReadTimeout, httpx.ConnectError) as e:
            print(f"      page {page_num} attempt {attempt+1}/3: {type(e).__name__}; retrying...")
            await asyncio.sleep(5)
    return []


async def process_article(item: dict, output_dir: Path) -> tuple[str, bool]:
    url = item["url"]
    raw_html = item["content_html"]

    if _is_verify_page(raw_html):
        print("      ⚠ verify page; using Camoufox fallback")
        raw_html = await _camoufox_fetch(url)

    soup = BeautifulSoup(raw_html, "html.parser")
    meta = w.extract_metadata(soup, raw_html)
    if not meta["title"]:
        meta["title"] = item.get("title", "untitled")
    meta["source_url"] = url
    if not meta["publish_time"] and item.get("date_modified"):
        meta["publish_time"] = item["date_modified"]

    content_html, code_blocks, img_urls = w.process_content(soup)
    if not content_html:
        return f"❌ no body", False

    md = w.convert_to_markdown(content_html, code_blocks)
    safe = safe_filename(meta["title"])
    article_dir = output_dir / safe
    img_dir = article_dir / "images"
    img_dir.mkdir(parents=True, exist_ok=True)

    url_map = await w.download_all_images(img_urls, img_dir)
    md = w.replace_image_urls(md, url_map)

    md_path = article_dir / f"{safe}.md"
    md_path.write_text(w.build_markdown(meta, md), encoding="utf-8")
    return f"{len(md)} chars, {len(img_urls)} imgs", True


async def main() -> None:
    ap = argparse.ArgumentParser(
        description="Backfill all articles for a wewe-rss feed into Markdown."
    )
    ap.add_argument("--mp-id", required=True, help="wewe-rss feed id, e.g. MP_WXS_1234567890")
    ap.add_argument("--auth-file", default=".auth", help="path to file containing wewe-rss AUTH_CODE")
    ap.add_argument("--output", type=Path, default=Path("output"), help="output directory")
    ap.add_argument("--since-days", type=int, default=365, help="only articles published within N days (default: 365)")
    ap.add_argument("--limit", type=int, default=0, help="cap articles processed (0 = no cap, useful for testing)")
    args = ap.parse_args()

    auth = Path(args.auth_file).read_text().strip()
    args.output.mkdir(parents=True, exist_ok=True)

    print(f"📋 listing all articles for {args.mp_id}...")
    all_items = list_all_articles(args.mp_id, auth)
    cutoff = datetime.now().timestamp() - args.since_days * 86400
    target = [it for it in all_items if it["publishTime"] >= cutoff]
    print(f"   total: {len(all_items)}; within {args.since_days}d: {len(target)}")

    target_ids = {it["id"] for it in target}
    title_by_id = {it["id"]: it["title"] for it in target}
    pubtime_by_id = {it["id"]: it["publishTime"] for it in target}

    # Build skip set from disk. Walk recursively so we recognize:
    #   - bare title dirs:      "腾讯文档 x WorkBuddy"
    #   - YYYY-MM-DD prefixed:  "2026-04-29 - 腾讯文档 x WorkBuddy"
    #   - dirs nested under per-account folders (e.g. output_by_account/腾讯云/...)
    PREFIX_RE = re.compile(r"^\d{4}-\d{2}-\d{2} - ")
    existing_titles: set[str] = set()
    for p in args.output.rglob("*"):
        if not p.is_dir():
            continue
        name = p.name
        existing_titles.add(name)
        existing_titles.add(PREFIX_RE.sub("", name))
    already_done_ids = {
        aid for aid, title in title_by_id.items() if safe_filename(title) in existing_titles
    }
    todo_ids = target_ids - already_done_ids
    print(f"   already on disk: {len(already_done_ids)}; to fetch: {len(todo_ids)}\n")

    if args.limit:
        # Process newest-first up to the limit (sorted by publishTime locally is fine for selection)
        ordered_todo = sorted(todo_ids, key=lambda i: pubtime_by_id[i], reverse=True)[: args.limit]
        todo_ids = set(ordered_todo)

    if not todo_ids:
        print("✨ nothing to do.")
        return

    # Sequential pagination: walk pages, process whatever IDs come back. Robust to ordering drift.
    BATCH = 5
    ok = fail = 0
    page = 0
    seen_ids: set[str] = set()
    consecutive_empty = 0
    async with httpx.AsyncClient() as client:
        while todo_ids:
            page += 1
            print(f"📄 fetching page {page} (batch={BATCH}, remaining todo: {len(todo_ids)})")
            items = await fetch_page(args.mp_id, page, BATCH, client)
            if not items:
                consecutive_empty += 1
                if consecutive_empty >= 2:
                    print("   ⚠ two empty pages in a row; stopping.")
                    break
                continue
            consecutive_empty = 0

            new_in_page = [it for it in items if it["id"] not in seen_ids]
            seen_ids.update(it["id"] for it in items)

            if not new_in_page:
                print("   (page fully duplicate of prior pages; stopping.)")
                break

            for item in new_in_page:
                if item["id"] not in todo_ids:
                    continue  # outside target window or already on disk
                title = item.get("title", "")[:50]
                print(f"  → {item['id']} | {title}")
                try:
                    msg, success = await process_article(item, args.output)
                    print(f"      {'✅' if success else '❌'} {msg}")
                    if success:
                        ok += 1
                        todo_ids.discard(item["id"])
                    else:
                        fail += 1
                except Exception as e:
                    print(f"      ❌ exception: {type(e).__name__}: {e}")
                    fail += 1

            if len(items) < BATCH:
                print("   (last page reached)")
                break

    # Fallback: any IDs not served via /feeds JSON, fetch directly from WeChat via Camoufox.
    # wewe-rss silently drops some articles in renderFeed (root cause TBD; pragmatic fix).
    if todo_ids:
        from camoufox.async_api import AsyncCamoufox

        print(f"\n🦊 Camoufox fallback for {len(todo_ids)} IDs not served via JSON feed...")
        async with AsyncCamoufox(headless=True) as browser:
            page_obj = await browser.new_page()
            for i, aid in enumerate(sorted(todo_ids, key=lambda i: pubtime_by_id.get(i, 0), reverse=True), 1):
                title_hint = title_by_id.get(aid, "")[:50]
                url = f"https://mp.weixin.qq.com/s/{aid}"
                print(f"  [{i}/{len(todo_ids)}] {aid} | {title_hint}")
                try:
                    await page_obj.goto(url, wait_until="domcontentloaded")
                    try:
                        await page_obj.wait_for_selector("#js_content", timeout=10000)
                    except Exception:
                        pass
                    await asyncio.sleep(2)
                    raw_html = await page_obj.content()
                    item = {
                        "url": url,
                        "content_html": raw_html,
                        "title": title_by_id.get(aid, "untitled"),
                        "date_modified": datetime.fromtimestamp(pubtime_by_id.get(aid, 0)).isoformat(),
                    }
                    msg, success = await process_article(item, args.output)
                    print(f"      {'✅' if success else '❌'} {msg}")
                    if success:
                        ok += 1
                    else:
                        fail += 1
                except Exception as e:
                    print(f"      ❌ exception: {type(e).__name__}: {e}")
                    fail += 1

    print(f"\n📊 done: {ok} ok, {fail} failed, {len(already_done_ids)} pre-existing")


if __name__ == "__main__":
    asyncio.run(main())
