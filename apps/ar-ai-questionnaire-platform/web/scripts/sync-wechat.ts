/**
 * Sync WeChat 公众号 (Official Account) articles from a self-hosted WeWe-RSS
 * instance into a LOCAL markdown archive that a grounding pipeline reads directly.
 *
 * This is the ONLY consumer — there is NO database write. We just produce
 * markdown files + an index on disk.
 *
 * USAGE
 *   npx tsx web/scripts/sync-wechat.ts            # dry run (default): prints a plan
 *   npx tsx web/scripts/sync-wechat.ts --apply    # writes the archive + images + summary
 *
 * CONFIG (env, with defaults)
 *   WECHAT_FEED_BASE     default https://ar-wechat.zeabur.app
 *   WECHAT_ARCHIVE_DIR   default /Users/luxlu/Desktop/Data center/微信公众号数据
 *   WECHAT_WINDOW_DAYS   default 183  (only keep articles published within N days)
 *   FIRECRAWL_API_KEY    (from web/.env.local) — used to backfill WeChat
 *                        verify/环境异常 interstitials that WeWe-RSS loses.
 *
 * FEED SHAPE (discovered against the live instance)
 *   GET /feeds                       -> JSON array of accounts:
 *                                       [{ id: "MP_WXS_...", name, intro, cover, ... }]
 *   GET /feeds/<mpId>.json           -> JSON Feed 1.x for ONE account:
 *       { version, title, author:{name}, items: [
 *           { id,                       // WeWe article id, e.g. "AWuqzv2wGVtyi9pkI7p0Xw"
 *             url,                      // https://mp.weixin.qq.com/s/<id>
 *             title,
 *             content_html,            // FULL mp.weixin article page HTML
 *             image,
 *             date_modified }          // ISO date == the article publish time
 *       ] }
 *
 *   PAGINATION (probed against the live instance):
 *     - The default per-account feed returns only the ~10 most recent items.
 *     - `?limit=N` IS honored and pulls real history (e.g. limit=30 reaches
 *       months back). Larger N forces the upstream to assemble more fulltext and
 *       intermittently 502s (cold start / timeout) — so we retry with backoff and
 *       ramp `limit` up only until the feed's earliest item predates our window.
 *     - The aggregate /feeds/all.json (and .atom) 502 — the upstream times out
 *       building fulltext for every account at once. So we iterate per-account.
 *
 *   Per-item gotchas:
 *     - There is NO per-item author/authors and NO date_published. The account
 *       name lives at the FEED level (feed.title / feed.author.name). Published
 *       date == item.date_modified (verified to equal the embedded `var ct`).
 *     - content_html is a complete mp.weixin page. The real article body is the
 *       <div id="js_content" class="rich_media_content ...">…</div>. Some items
 *       come back as a WeChat "verify"/环境异常 interstitial (no js_content) —
 *       WeWe-RSS "silently loses" ~half of these. We BACKFILL them via Firecrawl
 *       (POST https://api.firecrawl.dev/v2/scrape) which renders JS and passes the
 *       verify page. Still-unrecoverable ids are logged and skipped (not written
 *       as garbage).
 *
 * ON-DISK LAYOUT
 *   output_by_account/
 *     _index.json                                  # id -> { account, path, url, published, hash }
 *     <account>/
 *       <YYYY-MM-DD>_<slug>.md                     # YAML frontmatter + markdown body
 *       images/<articleId>/<n>_<name>.<ext>        # locally downloaded images
 *   Image URLs inside each .md are rewritten to RELATIVE paths
 *   (images/<articleId>/<file>) so the archive is self-contained and portable.
 */
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------- config ----
// Load FIRECRAWL_API_KEY (and any other env) from web/.env.local if present.
loadEnvLocal();

const FEED_BASE = (process.env.WECHAT_FEED_BASE ?? "https://ar-wechat.zeabur.app").replace(/\/+$/, "");
const ARCHIVE_DIR = process.env.WECHAT_ARCHIVE_DIR ?? "/Users/luxlu/Desktop/Data center/微信公众号数据";
const OUTPUT_DIR = join(ARCHIVE_DIR, "output_by_account");
const INDEX_PATH = join(OUTPUT_DIR, "_index.json");

// 6-month window: keep articles with published >= today - WINDOW_DAYS.
const WINDOW_DAYS = Number(process.env.WECHAT_WINDOW_DAYS ?? 183);
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;
const CUTOFF = new Date(Date.now() - WINDOW_MS);

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY ?? "";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const noFirecrawl = args.includes("--no-firecrawl");

// network: per-account feeds are big and the host can cold-start / 502 under
// load. The upstream assembles fulltext per item; large `limit` makes it time
// out, and back-to-back account requests overwhelm it — so we retry hard with
// long backoff and PACE between accounts.
const FETCH_TIMEOUT_MS = 180_000;
const FETCH_RETRIES = 8;
const FETCH_BACKOFF_MS = 6_000; // base; multiplied by attempt #
const ACCOUNT_PACING_MS = 8_000; // breather between accounts so the host recovers

// pagination: start small (large `limit` reliably 502s on the heavy feeds) and
// ramp up `?limit=N` until the feed's earliest item predates CUTOFF (so we know
// we reached the back edge of the window). limit=15-30 was observed reliable;
// limit>=40 frequently 502s on the big accounts.
const LIMIT_START = 15;
const LIMIT_STEP = 10;
const LIMIT_MAX = 60;

// image download tuning
const IMG_TIMEOUT_MS = 30_000;
const IMG_RETRIES = 2;

// firecrawl tuning
const FIRECRAWL_TIMEOUT_MS = 90_000;

// ----------------------------------------------------------------- types ----
interface Account {
  id: string;
  name: string;
  intro?: string;
}
interface FeedItem {
  id: string;
  url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  date_published?: string;
  date_modified?: string;
}
interface Feed {
  title?: string;
  author?: { name?: string };
  authors?: { name?: string }[];
  items?: FeedItem[];
}
interface IndexEntry {
  account: string;
  path: string; // relative to OUTPUT_DIR
  url: string;
  published: string; // ISO date (YYYY-MM-DD)
  hash: string;
  images?: number; // count of locally-downloaded images
  source?: "feed" | "firecrawl"; // where the body came from
}
type Index = Record<string, IndexEntry>;

// ----------------------------------------------------------- env loader ----
/** Minimal .env.local loader — only fills vars that aren't already set. */
function loadEnvLocal(): void {
  try {
    const here = dirname(fileURLToPath(import.meta.url)); // web/scripts
    const candidates = [
      join(here, "..", ".env.local"), // web/.env.local
      join(here, "..", "..", "web", ".env.local"), // repo-root/web/.env.local
    ];
    for (const p of candidates) {
      if (!existsSync(p)) continue;
      const raw = readFileSync(p, "utf8");
      for (const line of raw.split("\n")) {
        const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i.exec(line);
        if (!m) continue;
        const key = m[1];
        if (process.env[key] !== undefined) continue;
        let val = m[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
      break;
    }
  } catch {
    /* best-effort */
  }
}

// ------------------------------------------------------------- fetch util ----
async function fetchWithRetry(url: string, asJson: true): Promise<unknown>;
async function fetchWithRetry(url: string, asJson: false): Promise<string>;
async function fetchWithRetry(url: string, asJson: boolean): Promise<unknown> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) {
        // 502/503/504 from a cold/overloaded instance — back off and retry
        if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < FETCH_RETRIES) {
          await sleep(FETCH_BACKOFF_MS * attempt);
          continue;
        }
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return asJson ? await res.json() : await res.text();
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      if (attempt < FETCH_RETRIES) {
        await sleep(FETCH_BACKOFF_MS * attempt);
        continue;
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Fetch raw bytes (for images). Returns null on failure. */
async function fetchBytes(url: string): Promise<{ buf: Buffer; contentType: string } | null> {
  for (let attempt = 1; attempt <= IMG_RETRIES; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), IMG_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        // mp.weixin image CDN sometimes wants a referer; harmless otherwise.
        headers: { Referer: "https://mp.weixin.qq.com/" },
      });
      clearTimeout(timer);
      if (!res.ok) {
        if (attempt < IMG_RETRIES) {
          await sleep(800 * attempt);
          continue;
        }
        return null;
      }
      const ab = await res.arrayBuffer();
      return { buf: Buffer.from(ab), contentType: res.headers.get("content-type") ?? "" };
    } catch {
      clearTimeout(timer);
      if (attempt < IMG_RETRIES) {
        await sleep(800 * attempt);
        continue;
      }
      return null;
    }
  }
  return null;
}

/** Recover an article body via Firecrawl (renders JS, passes the WeChat verify
 *  page). Returns clean markdown or null. */
async function firecrawlMarkdown(url: string): Promise<string | null> {
  if (!FIRECRAWL_API_KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FIRECRAWL_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true, waitFor: 4000 }),
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const j = (await res.json()) as { success?: boolean; data?: { markdown?: string } };
    const md = j?.data?.markdown?.trim();
    if (!md) return null;
    // Reject if Firecrawl still landed on the verify/环境异常 page.
    if (/环境异常|去验证|verify_/.test(md) && md.length < 400) return null;
    return md;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// --------------------------------------------------------- image handling ----
const IMG_MD_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/** Pick a file extension from a content-type or URL. */
function pickExt(contentType: string, url: string): string {
  const ct = contentType.toLowerCase();
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("png")) return "png";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("svg")) return "svg";
  // mp.weixin encodes wx_fmt in the query string
  const fmt = /wx_fmt=([a-z0-9]+)/i.exec(url)?.[1];
  if (fmt) return fmt === "jpeg" ? "jpg" : fmt.toLowerCase();
  const m = /\.(jpe?g|png|gif|webp|svg)(?:$|\?)/i.exec(url);
  if (m) return m[1].toLowerCase() === "jpeg" ? "jpg" : m[1].toLowerCase();
  return "jpg";
}

/**
 * Download every remote image referenced in a markdown body into
 * <accountDir>/images/<articleId>/ and rewrite the markdown to relative paths.
 * Returns the rewritten markdown + how many images were saved.
 * In dry-run mode it only counts (does not fetch/write).
 */
async function localizeImages(
  markdown: string,
  accountDir: string,
  articleId: string,
  doWrite: boolean,
): Promise<{ markdown: string; saved: number }> {
  const matches = [...markdown.matchAll(IMG_MD_RE)];
  if (matches.length === 0) return { markdown, saved: 0 };

  const imgDir = join(accountDir, "images", articleId);
  // de-dup identical URLs so the same image isn't fetched twice
  const urlToRel = new Map<string, string>();
  let saved = 0;
  let n = 0;

  for (const m of matches) {
    const url = m[2];
    if (!/^https?:\/\//i.test(url)) continue; // already local / data URI
    if (urlToRel.has(url)) continue;
    n++;
    if (!doWrite) {
      // dry-run: assume it would download
      urlToRel.set(url, `images/${articleId}/${String(n).padStart(2, "0")}`);
      saved++;
      continue;
    }
    const got = await fetchBytes(url);
    if (!got) continue;
    const ext = pickExt(got.contentType, url);
    const file = `${String(n).padStart(2, "0")}.${ext}`;
    mkdirSync(imgDir, { recursive: true });
    writeFileSync(join(imgDir, file), got.buf);
    urlToRel.set(url, `images/${articleId}/${file}`);
    saved++;
  }

  // rewrite only the URLs we successfully localized
  const rewritten = markdown.replace(IMG_MD_RE, (whole, alt, url) => {
    const rel = urlToRel.get(url);
    return rel ? `![${alt}](${rel})` : whole;
  });
  return { markdown: rewritten, saved };
}

// ----------------------------------------------------- paginated feed pull ----
/**
 * Pull a per-account feed deep enough to cover the window. Ramps `?limit=N`
 * until the earliest returned item predates CUTOFF (or we hit LIMIT_MAX), so we
 * don't stop at the latest page. Retries 502s via fetchWithRetry.
 *
 * RESILIENCE: large `limit` intermittently 502s on the heavy feeds even after
 * retries. We keep the LAST SUCCESSFUL feed; if a bumped-limit request finally
 * fails, we FALL BACK to that last good feed instead of losing the whole
 * account. Only if even the first (smallest) request fails do we throw.
 */
async function fetchFeedForWindow(
  mpId: string,
): Promise<{ feed: Feed; reachedBackEdge: boolean; usedLimit: number }> {
  let limit = LIMIT_START;
  let bestFeed: Feed | null = null;
  let bestLimit = 0;
  let reachedBackEdge = false;

  while (true) {
    let feed: Feed;
    try {
      feed = (await fetchWithRetry(`${FEED_BASE}/feeds/${mpId}.json?limit=${limit}`, true)) as Feed;
    } catch (e) {
      // a higher limit failed — fall back to the best feed we already have.
      if (bestFeed) {
        console.warn(`    (limit=${limit} failed: ${(e as Error).message}; using limit=${bestLimit})`);
        break;
      }
      throw e; // even the smallest limit failed — nothing to salvage
    }

    bestFeed = feed;
    bestLimit = limit;
    const items = feed.items ?? [];
    // earliest published among returned items
    let earliest = Infinity;
    for (const it of items) {
      const dt = isoDate(it);
      if (!Number.isNaN(dt.getTime())) earliest = Math.min(earliest, dt.getTime());
    }
    // back edge reached when the oldest item is older than the cutoff, OR the
    // feed returned fewer items than we asked for (we've exhausted history).
    reachedBackEdge = earliest <= CUTOFF.getTime() || items.length < limit;
    if (reachedBackEdge || limit >= LIMIT_MAX) break;
    limit = Math.min(limit + LIMIT_STEP, LIMIT_MAX);
    // small breather before the heavier request
    await sleep(2_000);
  }
  return { feed: bestFeed ?? {}, reachedBackEdge, usedLimit: bestLimit };
}

// --------------------------------------------------------- HTML -> markdown ----
/** Pull the mp.weixin article body out of a full page, or null if not present. */
function extractArticleBody(html: string): string | null {
  // WeChat verify / 环境异常 interstitial — not real content.
  if (/secitptpage\/verify/.test(html) || /环境异常/.test(html)) return null;

  // The article body is <div id="js_content" class="rich_media_content ...">.
  const open = html.search(/<div[^>]*\bid="js_content"[^>]*>/);
  if (open === -1) {
    // Some feeds may already deliver just a fragment; if it's small and has no
    // <html> wrapper, treat the whole thing as the body.
    if (!/<html[\s>]/i.test(html) && html.length < 200_000) return html;
    return null;
  }
  const tagEnd = html.indexOf(">", open);
  // Walk the DOM to find the matching </div> for this opening <div>.
  const body = sliceBalancedDiv(html, open, tagEnd + 1);
  return body;
}

/** Given the index of an opening <div ...> and where its content starts,
 *  return the inner HTML up to the matching </div> (balanced). */
function sliceBalancedDiv(html: string, openStart: number, contentStart: number): string {
  let depth = 1;
  let i = contentStart;
  const re = /<\/?div\b[^>]*>/gi;
  re.lastIndex = contentStart;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[0].startsWith("</")) {
      depth--;
      if (depth === 0) {
        i = m.index;
        break;
      }
    } else {
      depth++;
    }
  }
  return html.slice(contentStart, i);
}

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&mdash;": "—",
  "&hellip;": "…",
};
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&[a-z]+;/gi, (e) => HTML_ENTITIES[e] ?? e);
}

/** Convert an article-body HTML fragment to clean markdown-ish plaintext.
 *  Keeps headings, links, list/paragraph breaks, and image alt/src; drops
 *  scripts/styles and the WeChat boilerplate. */
function htmlToMarkdown(fragment: string): string {
  let s = fragment;

  // strip non-content
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<!--[\s\S]*?-->/g, "");

  // images -> ![alt](src). mp.weixin lazy-loads via data-src.
  s = s.replace(/<img\b[^>]*>/gi, (tag) => {
    const src =
      /\bdata-src="([^"]+)"/i.exec(tag)?.[1] ?? /\bsrc="([^"]+)"/i.exec(tag)?.[1] ?? "";
    const alt = /\balt="([^"]*)"/i.exec(tag)?.[1] ?? "";
    return src ? `\n![${alt}](${src})\n` : "";
  });

  // links -> [text](href) (resolved after tag stripping is hard, so do inline)
  s = s.replace(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text) return "";
    if (/^javascript:/i.test(href) || href === "###") return text;
    return `[${text}](${href})`;
  });

  // headings
  s = s.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${strip(t)}\n\n`);
  s = s.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${strip(t)}\n\n`);
  s = s.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${strip(t)}\n\n`);

  // list items
  s = s.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${strip(t)}`);

  // block-level breaks
  s = s.replace(/<\/(p|div|section|tr|table|ul|ol|blockquote)>/gi, "\n\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");

  // drop all remaining tags
  s = s.replace(/<[^>]+>/g, "");

  // entities + whitespace cleanup
  s = decodeEntities(s);
  s = s.replace(/ /g, " ");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s
    .split("\n")
    .map((l) => l.replace(/[ \t]{2,}/g, " ").trimEnd())
    .join("\n");
  return s.trim();
}
const strip = (t: string): string => decodeEntities(t.replace(/<[^>]+>/g, "")).trim();

// ----------------------------------------------------------------- slug ----
/** Filesystem-safe slug. Chinese is fine; only strip illegal chars + cap length. */
function slugify(title: string): string {
  let s = (title || "untitled").trim();
  // remove characters illegal on macOS/most filesystems + control chars
  s = s.replace(/[\\/:*?"<>| -]/g, "");
  s = s.replace(/\s+/g, "-");
  s = s.replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "");
  // cap length (by code points, so multibyte CJK isn't truncated mid-char)
  const cp = Array.from(s);
  if (cp.length > 60) s = cp.slice(0, 60).join("");
  return s || "untitled";
}

function isoDate(item: FeedItem): Date {
  const d = item.date_published ?? item.date_modified;
  if (d) {
    const dt = new Date(d);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  return new Date(NaN);
}

function sha256(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex").slice(0, 16);
}

function yamlEscape(v: string): string {
  // double-quote and escape; keeps colons/quotes in titles safe
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

// ----------------------------------------------------------------- main ----
function loadIndex(): Index {
  if (!existsSync(INDEX_PATH)) return {};
  try {
    return JSON.parse(readFileSync(INDEX_PATH, "utf8")) as Index;
  } catch {
    return {};
  }
}

async function main(): Promise<void> {
  console.log(
    `WeChat sync · base=${FEED_BASE} · archive=${ARCHIVE_DIR}\n` +
      `mode=${apply ? "APPLY" : "DRY RUN"}\n`,
  );

  // 1. account list
  let accounts: Account[];
  try {
    const raw = (await fetchWithRetry(`${FEED_BASE}/feeds`, true)) as unknown;
    if (!Array.isArray(raw)) throw new Error("‘/feeds’ did not return a JSON array");
    accounts = raw
      .map((a) => ({ id: String((a as Account).id), name: String((a as Account).name ?? (a as Account).id) }))
      .filter((a) => a.id);
  } catch (e) {
    console.error(`STOP: could not load account list from ${FEED_BASE}/feeds`);
    console.error((e as Error).message);
    process.exit(1);
  }
  // --only=<substr,substr>: limit the run to accounts whose name (or id) contains any substring.
  // Lets a run target just the unfinished accounts instead of re-walking the whole list.
  const onlyArg = (args.find((a) => a.startsWith("--only=")) ?? "").slice("--only=".length);
  if (onlyArg) {
    const subs = onlyArg.split(",").map((s) => s.trim()).filter(Boolean);
    accounts = accounts.filter((a) => subs.some((s) => a.name.includes(s) || a.id.includes(s)));
    console.log(`--only filter: ${accounts.length} account(s) match [${subs.join(", ")}]`);
  }
  if (accounts.length === 0) {
    console.error("STOP: account list is empty — nothing to sync.");
    process.exit(1);
  }
  console.log(`Found ${accounts.length} account(s): ${accounts.map((a) => a.name).join(", ")}\n`);

  console.log(
    `Window: published >= ${CUTOFF.toISOString().slice(0, 10)} ` +
      `(last ${WINDOW_DAYS} days)\n` +
      `Firecrawl backfill: ${FIRECRAWL_API_KEY && !noFirecrawl ? "ENABLED" : "disabled"}\n`,
  );

  const index = loadIndex();

  let totalNew = 0;
  let totalUpdated = 0;
  let totalSkipped = 0; // unchanged
  let totalNoContent = 0; // verify pages / empty (after Firecrawl attempt)
  let totalBackfilled = 0; // recovered via Firecrawl
  let totalImages = 0; // images downloaded this run
  let totalOutOfWindow = 0; // older than cutoff, ignored

  interface AcctStat {
    new: number;
    updated: number;
    unchanged: number;
    nocontent: number;
    backfilled: number;
    images: number;
    kept: number; // total in-window articles with content (written or already present)
    earliest: string | null;
    latest: string | null;
    earliestAvailable: string | null; // earliest the feed returned (any date), for history-depth report
    reachedBackEdge: boolean;
    samplePath: string | null;
  }
  const perAccount: Record<string, AcctStat> = {};
  const unrecoverable: string[] = [];
  const planLines: string[] = [];

  let acctIdx = 0;
  for (const acct of accounts) {
    // pace between accounts so the cold/overloaded upstream can recover
    if (acctIdx++ > 0) await sleep(ACCOUNT_PACING_MS);

    const stat: AcctStat = {
      new: 0, updated: 0, unchanged: 0, nocontent: 0, backfilled: 0, images: 0,
      kept: 0, earliest: null, latest: null, earliestAvailable: null,
      reachedBackEdge: false, samplePath: null,
    };

    let feed: Feed;
    let reachedBackEdge = false;
    let usedLimit = 0;
    try {
      const r = await fetchFeedForWindow(acct.id);
      feed = r.feed;
      reachedBackEdge = r.reachedBackEdge;
      usedLimit = r.usedLimit;
    } catch (e) {
      console.error(`  ! ${acct.name} (${acct.id}): feed fetch failed — ${(e as Error).message}`);
      perAccount[acct.name] = stat;
      continue;
    }
    const accountName = feed.title ?? feed.author?.name ?? feed.authors?.[0]?.name ?? acct.name;
    perAccount[accountName] = stat;
    stat.reachedBackEdge = reachedBackEdge;

    const items = feed.items ?? [];
    // track earliest available date the feed returned (regardless of window)
    for (const it of items) {
      const d = isoDate(it);
      if (!Number.isNaN(d.getTime())) {
        const s = d.toISOString().slice(0, 10);
        if (!stat.earliestAvailable || s < stat.earliestAvailable) stat.earliestAvailable = s;
      }
    }
    console.log(
      `  ${accountName} (${acct.id}): ${items.length} item(s) @ limit=${usedLimit}` +
        ` · earliest available ${stat.earliestAvailable ?? "?"}` +
        (reachedBackEdge ? "" : " · NOTE: did not reach window back-edge"),
    );

    const accountDir = join(OUTPUT_DIR, slugify(accountName));

    for (const item of items) {
      if (!item.id) continue;
      const dt = isoDate(item);
      // date-filter to the 6-month window
      if (!Number.isNaN(dt.getTime()) && dt.getTime() < CUTOFF.getTime()) {
        totalOutOfWindow++;
        continue;
      }
      const dateStr = Number.isNaN(dt.getTime()) ? "0000-00-00" : dt.toISOString().slice(0, 10);
      const publishedIso = Number.isNaN(dt.getTime()) ? "" : dt.toISOString();
      const url = item.url ?? `https://mp.weixin.qq.com/s/${item.id}`;

      const fileName = `${dateStr}_${slugify(item.title ?? item.id)}.md`;
      const relPath = join(slugify(accountName), fileName);
      const absPath = join(accountDir, fileName);

      const prev = index[item.id];
      const fileExists = existsSync(absPath);

      // RESUMABLE skip (checked BEFORE any network work): already indexed + file
      // on disk. WeChat articles are immutable once published, so a present
      // id+file is treated as done (incl. its images + any Firecrawl backfill).
      // This avoids re-downloading images and re-spending Firecrawl credits.
      if (prev && fileExists) {
        stat.unchanged++;
        totalSkipped++;
        stat.kept++;
        if (!stat.latest || dateStr > stat.latest) stat.latest = dateStr;
        if (!stat.earliest || dateStr < stat.earliest) stat.earliest = dateStr;
        if (!stat.samplePath) stat.samplePath = relPath;
        continue;
      }

      // derive body from the feed (verify/empty -> null)
      let body = item.content_text?.trim()
        ? item.content_text.trim()
        : item.content_html
          ? extractArticleBody(item.content_html)
          : null;
      let source: "feed" | "firecrawl" = "feed";

      // BACKFILL: WeChat verify/环境异常 interstitial — recover via Firecrawl.
      if ((!body || body.replace(/\s/g, "").length < 20) && FIRECRAWL_API_KEY && !noFirecrawl) {
        const md = await firecrawlMarkdown(url);
        if (md) {
          body = md;
          source = "firecrawl";
        }
      }

      if (!body || body.replace(/\s/g, "").length < 20) {
        totalNoContent++;
        stat.nocontent++;
        unrecoverable.push(`${accountName} · ${item.title ?? item.id} · ${url}`);
        planLines.push(`    [no-content] ${accountName} · ${item.title ?? item.id} (verify/empty page, Firecrawl failed)`);
        continue;
      }

      // Firecrawl already returns markdown; feed HTML needs conversion.
      let markdown =
        source === "firecrawl" || item.content_text?.trim() ? body : htmlToMarkdown(body);

      // localize images (download + rewrite to relative paths)
      const { markdown: localized, saved } = await localizeImages(
        markdown,
        accountDir,
        item.id,
        apply,
      );
      markdown = localized;
      stat.images += saved;
      totalImages += saved;

      const frontmatter = [
        "---",
        `account: ${yamlEscape(accountName)}`,
        `title: ${yamlEscape(item.title ?? "")}`,
        `published: ${yamlEscape(publishedIso || dateStr)}`,
        `url: ${yamlEscape(url)}`,
        `id: ${yamlEscape(item.id)}`,
        `source: ${yamlEscape(source)}`,
        "---",
        "",
      ].join("\n");
      const fileContent = `${frontmatter}# ${item.title ?? ""}\n\n${markdown}\n`;
      const hash = sha256(fileContent);

      const status: "new" | "updated" = prev || fileExists ? "updated" : "new";

      if (source === "firecrawl") {
        totalBackfilled++;
        stat.backfilled++;
      }
      if (status === "new") {
        totalNew++;
        stat.new++;
      } else {
        totalUpdated++;
        stat.updated++;
      }
      stat.kept++;
      if (!stat.latest || dateStr > stat.latest) stat.latest = dateStr;
      if (!stat.earliest || dateStr < stat.earliest) stat.earliest = dateStr;
      if (!stat.samplePath) stat.samplePath = relPath;

      planLines.push(
        `    [${status}${source === "firecrawl" ? "·firecrawl" : ""}] ${accountName} · ${dateStr} · ${item.title ?? item.id} (${saved} img)`,
      );

      if (apply) {
        mkdirSync(accountDir, { recursive: true });
        writeFileSync(absPath, fileContent, "utf8");
        index[item.id] = {
          account: accountName, path: relPath, url, published: dateStr, hash,
          images: saved, source,
        };
      }
    }
  }

  // ----- summary -----
  console.log("\n=== Plan ===");
  if (planLines.length === 0) {
    console.log("  (nothing new — archive already up to date for the window)");
  } else {
    console.log(planLines.join("\n"));
  }

  console.log("\n=== Per account (6-month window) ===");
  for (const [name, c] of Object.entries(perAccount)) {
    const flag = c.reachedBackEdge ? "" : "  ⚠ WeWe-RSS history may not reach 6mo";
    console.log(
      `  ${name}: kept ${c.kept} (new ${c.new}, updated ${c.updated}, unchanged ${c.unchanged}), ` +
        `backfilled ${c.backfilled}, unrecoverable ${c.nocontent}, images ${c.images}`,
    );
    console.log(
      `      window range: ${c.earliest ?? "—"} … ${c.latest ?? "—"} · ` +
        `feed earliest available: ${c.earliestAvailable ?? "—"}${flag}`,
    );
    if (c.samplePath) console.log(`      sample: output_by_account/${c.samplePath}`);
  }

  console.log("\n=== Totals ===");
  console.log(`  kept (new+updated+unchanged): ${totalNew + totalUpdated + totalSkipped}`);
  console.log(`  new            : ${totalNew}`);
  console.log(`  updated        : ${totalUpdated}`);
  console.log(`  unchanged      : ${totalSkipped}`);
  console.log(`  backfilled (FC): ${totalBackfilled}`);
  console.log(`  images saved   : ${totalImages}`);
  console.log(`  out-of-window  : ${totalOutOfWindow}  (older than cutoff — ignored)`);
  console.log(`  unrecoverable  : ${totalNoContent}  (verify/empty even after Firecrawl)`);
  if (unrecoverable.length) {
    console.log("\n=== Unrecoverable ids ===");
    for (const u of unrecoverable) console.log(`  - ${u}`);
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write the archive.");
    return;
  }

  // persist index
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), "utf8");
  const indexCount = Object.keys(index).length;

  // count files on disk for a sanity check
  let onDisk = 0;
  if (existsSync(OUTPUT_DIR)) {
    for (const entry of readdirSync(OUTPUT_DIR, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        onDisk += readdirSync(join(OUTPUT_DIR, entry.name)).filter((f) => f.endsWith(".md")).length;
      }
    }
  }
  console.log(
    `\nDone. Wrote ${totalNew} new + ${totalUpdated} updated (${totalBackfilled} via Firecrawl), ` +
      `${totalImages} images. Index now tracks ${indexCount} articles; ${onDisk} .md files on disk.`,
  );
  console.log(`Archive: ${OUTPUT_DIR}`);
}

main().catch((e) => {
  console.error("FATAL:", (e as Error).stack ?? e);
  process.exit(1);
});
