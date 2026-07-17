---
name: wechat-feed-to-markdown
description: Backfill or daily-sync WeChat 公众号 articles from a self-hosted wewe-rss instance into clean local Markdown + downloaded images. Use when the user wants to scrape a WeChat Official Account they've subscribed via wewe-rss — single-article, full historical backfill, or recurring daily sync. Triggers on phrases like "抓公众号", "把公众号文章存成 Markdown", "wewe-rss", "微信文章转 Markdown", "backfill WeChat", "每日同步公众号".
---

# wechat-feed-to-markdown Skill

Pulls WeChat Official Account articles from a self-hosted [wewe-rss](https://github.com/cooderl/wewe-rss) instance and writes them as clean local Markdown with downloaded images.

## When to use

- User has wewe-rss deployed (e.g. on Zeabur/Vercel/self-hosted) and wants a local Markdown archive of one or more 公众号 they've subscribed there
- User wants daily incremental sync (cron-able)
- User wants historical backfill (past N days/years)

## Prerequisites

The user must provide three things:

1. **`WEWERSS_BASE_URL`** — their wewe-rss instance URL (e.g. `https://wewe-rss.example.com`)
2. **`AUTH_CODE`** — the wewe-rss `AUTH_CODE` env var value (visible in their Zeabur/server config)
3. **`MP_ID`** — the feed id, format `MP_WXS_xxxxxxxxxx` (visible in their wewe-rss dashboard URL: `/dash/feeds/MP_WXS_…`)

## Workflow (instruct the user)

```bash
# 1. Install Python deps + fetch Camoufox browser binary (one-time, ~300MB)
uv sync
GH_TOKEN="$(gh auth token)" uv run python scripts/fetch_camoufox.py

# 2. Save auth code to a 600-perm file (avoids shell escape issues with $, \, {})
printf '%s' '<your-auth-code>' > .auth && chmod 600 .auth

# 3. Set instance URL once per shell
export WEWERSS_BASE_URL=https://your-wewe-rss-url.example.com

# 4. First-time backfill (past 365 days for one feed, resume-safe)
uv run python scripts/backfill.py --mp-id MP_WXS_1234567890 --output output_by_account
uv run python scripts/sort_into_accounts.py output_by_account output_by_account
uv run python scripts/prefix_by_date.py output_by_account

# 5. Subsequent syncs — ONE command does refresh + incremental + sort + prefix
#    + reports new articles fetched in this run. This is the primary entry point.
uv run python scripts/sync.py --mp-id MP_WXS_1234567890 --output output_by_account
```

## Architecture (so the agent can reason about failures)

```
wewe-rss tRPC API           wewe-rss /feeds JSON          mp.weixin.qq.com
       │ (metadata only)            │ (HTML lazily fetched)        │
       ▼                            ▼                              │
   article.list                 GET /feeds/X.json?limit=N&page=N   │
       │                            │                              │
       │ ids + publishTime          │ items[].content_html (3MB+)  │
       ▼                            │                              │
   target set                       ▼                              │
       │                       BeautifulSoup parse                  │
       └─────► to_fetch ────►  ┌─────────────────┐                  │
                               │ verify page?    │── yes ──► Camoufox direct fetch ◄──┘
                               └────────┬────────┘
                                        │ no
                                        ▼
                               markdownify + image dl
                                        │
                                        ▼
                               output/<title>/<title>.md
                               output/<title>/images/*.{png,jpg,gif}
```

## Real-world gotchas (encountered while building this)

1. **Camoufox `fetch` needs GitHub API auth** — uses `requests.get(api.github.com)` with no token, hits 60 req/hr limit fast on shared IPs. Use `scripts/fetch_camoufox.py` which monkey-patches in `$GH_TOKEN`.

2. **wewe-rss `?limit=1000` causes 502** on Zeabur (gateway timeout). `backfill.py` pages with `limit=50` for tRPC and `limit=5` for /feeds JSON.

3. **wewe-rss `/feeds` silently drops articles** in `renderFeed` for some IDs (root cause unclear; affected ~40% of articles for a high-volume account). `backfill.py` uses Camoufox fallback for any IDs that don't come back from JSON pagination.

4. **wewe-rss tie-breaks differently from your Python sort** when articles share `publishTime`. Don't try to compute page numbers from a sorted client-side list — paginate sequentially and consume IDs as they arrive.

5. **wewe-rss `article.list?mpId=X` may return mixed mpIds in some deployments** (we observed this; source code looks correct, suspect DB-level mpId mismatch). Always verify `> 公众号:` in output and run `sort_into_accounts.py` afterwards.

6. **Memory pressure crashes wewe-rss on Zeabur free tier** — too many concurrent /feeds JSON calls (each ~3MB) push the Node process to OOM. `backfill.py` keeps batch=5 and sequential.

7. **Microsoft读书 account session expires every ~30 days** — `feed.refreshArticles` returns `暂无可用读书账号！`. User must re-login to WeRead in wewe-rss admin.

## Cron deployment

```bash
# crontab -e — daily 9 AM sync
0 9 * * * cd /path/to/wewerss-to-markdown && \
  WEWERSS_BASE_URL=https://your-wewe-rss.example.com \
  /path/to/uv run python scripts/daily_sync.py \
    --mp-id MP_WXS_1234567890 --output /path/to/output \
  >> /path/to/sync.log 2>&1
```

## Files

| File | Purpose |
|---|---|
| `scripts/wechat_article_to_markdown.py` | Vendored upstream (single-URL pipeline) |
| `scripts/feed_to_markdown.py` | Process JSON-feed item → MD |
| `scripts/backfill.py` | List + paginate + Camoufox fallback, resume-safe |
| `scripts/sync.py` | **One-command sync**: refresh + backfill + sort + prefix + new-article report (primary entry point) |
| `scripts/daily_sync.py` | Lighter alternative: refresh + backfill only (no organize) |
| `scripts/sort_into_accounts.py` | Split mixed output by `公众号` field |
| `scripts/prefix_by_date.py` | `YYYY-MM-DD - 标题/` directory naming |
| `scripts/fetch_camoufox.py` | Camoufox install with GH token injection |
