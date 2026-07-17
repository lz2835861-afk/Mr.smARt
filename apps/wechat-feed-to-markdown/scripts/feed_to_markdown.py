"""Pull articles from a wewe-rss JSON feed and convert each to Markdown.

Bypasses Camoufox entirely — wewe-rss already has the raw WeChat HTML in
`content_html`, so we go straight to the parsing functions in the upstream
module.
"""
from __future__ import annotations

import argparse
import asyncio
import re
import sys
from pathlib import Path

import httpx
from bs4 import BeautifulSoup

import wechat_article_to_markdown as w


def _is_verify_page(html: str) -> bool:
    """wewe-rss sometimes stores a WeChat anti-bot verify page instead of the article."""
    return len(html) < 100_000 and (
        "secitptpage/verify" in html or "weui-msg" in html and "id=\"js_content\"" not in html
    )


async def _camoufox_fetch(url: str) -> str:
    """Fallback: when feed HTML is a verify page, fetch the real article via Camoufox."""
    from camoufox.async_api import AsyncCamoufox

    async with AsyncCamoufox(headless=True) as browser:
        page = await browser.new_page()
        await page.goto(url, wait_until="domcontentloaded")
        try:
            await page.wait_for_selector("#js_content", timeout=10000)
        except Exception:
            pass
        await asyncio.sleep(2)
        return await page.content()


async def process_one(item: dict, output_dir: Path) -> tuple[str, bool]:
    url = item["url"]
    raw_html = item["content_html"]

    if _is_verify_page(raw_html):
        print(f"    ⚠ feed has verify page; falling back to Camoufox for {url}")
        raw_html = await _camoufox_fetch(url)

    soup = BeautifulSoup(raw_html, "html.parser")

    meta = w.extract_metadata(soup, raw_html)
    # Feed item title is more reliable than parsed DOM (some pages strip #activity-name)
    if not meta["title"]:
        meta["title"] = item.get("title", "untitled")
    meta["source_url"] = url
    if not meta["publish_time"] and item.get("date_modified"):
        meta["publish_time"] = item["date_modified"]

    content_html, code_blocks, img_urls = w.process_content(soup)
    if not content_html:
        return f"❌ no body: {url}", False

    md = w.convert_to_markdown(content_html, code_blocks)

    safe_title = re.sub(r'[/\\?%*:|"<>]', "_", meta["title"])[:80]
    article_dir = output_dir / safe_title
    img_dir = article_dir / "images"
    img_dir.mkdir(parents=True, exist_ok=True)

    url_map = await w.download_all_images(img_urls, img_dir)
    md = w.replace_image_urls(md, url_map)

    md_path = article_dir / f"{safe_title}.md"
    md_path.write_text(w.build_markdown(meta, md), encoding="utf-8")
    return f"✅ {meta['title']} → {md_path.name} ({len(md)} chars, {len(img_urls)} imgs)", True


async def main(feed_url: str, output_dir: Path, limit: int) -> None:
    if feed_url.startswith(("http://", "https://")):
        print(f"📥 fetching feed: {feed_url}")
        import json as _json
        async with httpx.AsyncClient(timeout=120.0) as client:
            for attempt in range(3):
                try:
                    resp = await client.get(feed_url)
                    resp.raise_for_status()
                    feed = resp.json()
                    break
                except (httpx.HTTPStatusError, httpx.ReadTimeout) as e:
                    print(f"  ⚠ attempt {attempt+1}/3 failed: {e}; retrying...")
                    await asyncio.sleep(3)
            else:
                raise RuntimeError("feed fetch failed after 3 attempts")
    else:
        print(f"📂 reading local feed: {feed_url}")
        import json as _json
        feed = _json.loads(Path(feed_url).read_text(encoding="utf-8"))

    items = feed.get("items", [])[:limit]
    print(f"📰 {len(items)} items to process\n")

    output_dir.mkdir(parents=True, exist_ok=True)
    ok = 0
    for i, item in enumerate(items, 1):
        print(f"[{i}/{len(items)}] {item.get('title', '')[:60]}")
        try:
            msg, success = await process_one(item, output_dir)
            print(f"    {msg}\n")
            if success:
                ok += 1
        except Exception as e:
            print(f"    ❌ exception: {type(e).__name__}: {e}\n")

    print(f"📊 done: {ok}/{len(items)} succeeded")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("feed_url")
    ap.add_argument("-o", "--output", type=Path, default=Path("output_feed"))
    ap.add_argument("-n", "--limit", type=int, default=10)
    args = ap.parse_args()
    asyncio.run(main(args.feed_url, args.output, args.limit))
