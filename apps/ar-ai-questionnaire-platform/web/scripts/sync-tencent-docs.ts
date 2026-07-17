/**
 * Sync Tencent Cloud product documentation into a local markdown corpus for the
 * AI grounding pipeline.
 *
 * Mirrors the dry-run / --apply discipline of import-skill-output.ts.
 *
 * USAGE
 *   npx tsx web/scripts/sync-tencent-docs.ts                     # dry run: print the plan
 *   npx tsx web/scripts/sync-tencent-docs.ts --apply             # scrape + write all seed products
 *   npx tsx web/scripts/sync-tencent-docs.ts --product 457 --apply   # scope to one product
 *   npx tsx web/scripts/sync-tencent-docs.ts --product 457 --apply --limit 8   # cap pages/locale
 *   npx tsx web/scripts/sync-tencent-docs.ts --product 457 --locale zh         # one locale only
 *
 * ENUMERATION
 *   For each product id we ask Firecrawl `POST /v2/map` for the doc tree on the
 *   per-locale host (cloud.tencent.com for zh, intl.cloud.tencent.com for en-us).
 *   Firecrawl renders JS so it sees past the EdgeOne anti-bot wall. The map can
 *   return mixed-host / off-product links, so we host-filter + normalise every
 *   URL down to `/document/product/<id>/<section>` on the locale's own host.
 *   If map yields nothing usable we fall back to the CN sitemap-derived seeds
 *   (and, ultimately, a small hardcoded TKE seed list) so the scrape+clean+store
 *   pipeline can still be proven end to end.
 *
 * SCRAPE + CLEAN
 *   Each URL is scraped via `POST /v2/scrape` (markdown, onlyMainContent). The
 *   returned markdown still carries top nav / search / cookie-banner / language
 *   switcher / footer chrome even with onlyMainContent, so cleanMarkdown() trims
 *   to the real doc body (title H1 .. just before the prev/next-topic footer).
 *
 * STORE (incremental)
 *   $TENCENT_DOCS_DIR/{zh,en-us}/<id>-<slug>/<section>.md  with YAML frontmatter.
 *   $TENCENT_DOCS_DIR/_index.json keyed by source_url tracks content_hash +
 *   page_updated; on re-run an unchanged hash only bumps scraped_at (no rewrite).
 *
 * KEYS
 *   Reads FIRECRAWL_API_KEY from env / web/.env.local.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// ---- env loader (avoids a dotenv dep; same pattern as import-skill-output.ts) ----
function loadEnv(path: string): void {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
const ENV_LOCAL = resolve(import.meta.dirname, "..", ".env.local");
loadEnv(ENV_LOCAL);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

type Locale = "zh" | "en-us";

interface Product {
  id: number;
  /** url-safe slug used in the on-disk folder name (<id>-<slug>) */
  slug: string;
  /** human label for logs */
  label: string;
  /**
   * Optional explicit section ids to scrape INSTEAD of map enumeration.
   * Used to scope a giant shared product (e.g. CVM 213) down to just the
   * representative pages a theme needs (e.g. confidential-computing how-tos),
   * so we don't map+scrape the whole product and burn credits.
   *
   * Keyed by locale because the same article often has a different numeric
   * section id on the intl (en-us) host than on the zh host. A locale whose
   * key is absent (or whose list is empty) is skipped for this product.
   */
  seedSections?: Partial<Record<Locale, string[]>>;
}

// Seed list of the AI Infra products that ground the ai-infra-2026 questionnaire.
// Add a product = add one line here. Each id is a real Tencent doc-center
// `/document/product/<id>` tree (resolved + map/scrape-verified 2026-06).
//
// Notes on the resolution:
//  - 大模型知识引擎 LKE was rebranded to 智能体开发平台 ADP (product 1759); it now
//    also covers the Agent / 智能体 platform theme.
//  - Agent Runtime (1814) is a separate product from ADP (1759) and is kept distinct.
//  - TACO-LLM has no standalone doc product — 69509 is a *section under TKE 457* on
//    the intl host, not a product id (it 404s as /document/product/69509). The real
//    standalone product is 计算加速套件 TACO Kit (1573), which covers TACO-LLM.
//  - 星脉 高性能计算网络 has no standalone doc center; its docs (TCCL, RDMA, instance
//    specs) live inside 高性能计算集群 HCC (1646), which is seeded here.
//  - 黑石物理服务器 / 裸金属 CPM was rebranded to 裸金属云服务器 CBM (product 386).
//
// IaaS / storage / security / silicon additions for the IDC "Worldwide Public
// Cloud AI IaaS 2026" questionnaire (resolved + map/scrape-verified 2026-06):
//  - 对象存储 COS = 436 (data-lake / object storage; zh+en-us doc trees).
//  - 文件存储 CFS = 582 (high-throughput file system; CFS Turbo for AI lives
//    inside this product — e.g. 582/80355 "Turbo 文件系统网络选择",
//    582/54765 "在 Linux 客户端上使用 CFS Turbo"; zh+en-us).
//  - 数据加速器 GooseFS = 1424 (high-throughput cache / small-file & metadata
//    perf for AI training). zh doc tree is full; the intl host has only the
//    product landing (no real en-us articles), so GooseFS is seeded zh-only.
//  - 云 HDFS / CHDFS = 1105 (high-performance HDFS-compatible parallel storage;
//    this is the distinct "高性能并行文件存储 / 高性能存储" product). zh+en-us.
//  - 机密计算 / 可信计算 (Confidential AI Computing): there is NO scrapable
//    standalone doc center. The dedicated 机密计算平台 (product 1542) doc pages
//    render only nav chrome under Firecrawl (no article body). The REAL,
//    current confidential-computing docs (Intel SGX + AMD SEV TEE, remote
//    attestation) live as how-to articles under 云服务器 CVM (product 213):
//    zh 213/63353 (Tencent SGX) + 213/128217 (AMD SEV); en-us 213/45510 (SGX).
//    We seed CVM 213 SCOPED to exactly those sections via seedSections so we
//    don't map+scrape the entire (huge) CVM product.
//  - 黑石/裸金属 CBM (bare metal AI) = 386 — already in the seed above.
//  - storage tiering / data migration: COS智能分层 and lifecycle/迁移 are
//    sections WITHIN COS 436 (no separate doc-center product), so they are
//    covered by the COS map enumeration above — no extra seed entry needed.
const PRODUCTS: Product[] = [
  { id: 1709, slug: "vectordb", label: "向量数据库 VectorDB" },
  { id: 1759, slug: "adp-lke", label: "智能体开发平台 ADP (原大模型知识引擎 LKE)" },
  { id: 851, slug: "ti-one", label: "TI-ONE 训推平台 (机器学习)" },
  { id: 1573, slug: "taco-kit", label: "计算加速套件 TACO Kit (TACO-LLM)" },
  { id: 1646, slug: "hcc", label: "高性能计算集群 HCC (含星脉网络)" },
  { id: 560, slug: "gpu-cvm", label: "GPU 云服务器" },
  { id: 457, slug: "tke", label: "容器服务 TKE (+qGPU)" },
  { id: 1814, slug: "agent-runtime", label: "Agent Runtime" },
  { id: 1721, slug: "hai", label: "高性能应用服务 HAI" },
  { id: 845, slug: "es", label: "Elasticsearch Service" },
  { id: 386, slug: "cbm", label: "裸金属云服务器 CBM (原黑石 / CPM)" },
  // --- IaaS / storage / security / silicon (IDC AI IaaS 2026) ---
  { id: 436, slug: "cos", label: "对象存储 COS (数据湖 / 对象存储)" },
  {
    id: 582,
    slug: "cfs",
    label: "文件存储 CFS (含 CFS Turbo for AI)",
    // Map enumeration only surfaces the lowest-numbered operation-guide pages
    // under --limit, missing the AI-relevant CFS Turbo / overview / spec /
    // release-notes pages. Pin a representative batch so the AI-throughput and
    // Turbo-for-AI capability is actually grounded.
    seedSections: {
      zh: [
        "38144", // 文件存储简介 (overview)
        "38112", // 存储类型及性能规格 (storage type & perf specs)
        "112073", // 文件存储功能介绍 (features)
        "80355", // Turbo 文件系统网络选择 (Turbo network)
        "54765", // 在 Linux 客户端上使用 CFS Turbo 文件系统
        "85845", // CFS Turbo 实践指南 (Turbo best-practice / AI)
        "88670", // 数据生命周期策略 (lifecycle / tiering)
        "9132", // 创建文件系统及挂载点
        "9135", // 文件存储系统限制 (quotas/limits)
        "76439", // 文件存储产品动态 (release notes)
      ],
      "en-us": [
        "56074", // Features
        "11523", // Use the CFS File System on Linux Clients (incl. Turbo)
        "11524", // Use the CFS File Systems on Windows Clients
        "78412", // Service Regions and Service Providers
        "34498", // mount / usage
        "34499",
        "34502",
        "51063", // overview / concepts
        "78223",
      ],
    },
  },
  { id: 1424, slug: "goosefs", label: "数据加速器 GooseFS (高性能缓存)" },
  { id: 1105, slug: "chdfs", label: "云 HDFS / CHDFS (高性能并行文件存储)" },
  {
    id: 213,
    slug: "cvm-confidential-computing",
    label: "机密计算 / 可信计算 (TEE SGX/SEV，CVM 213 子集)",
    seedSections: {
      zh: ["63353", "128217"], // Tencent SGX env; AMD SEV env (incl. 远程证明)
      "en-us": ["45510"], // Tencent SGX env (en-us)
    },
  },
];

const LOCALE_HOST: Record<Locale, string> = {
  zh: "cloud.tencent.com",
  "en-us": "intl.cloud.tencent.com",
};

const FIRECRAWL = "https://api.firecrawl.dev/v2";

// Hardcoded TKE seeds (zh section ids). Only used if map + sitemap enumeration
// both come up empty — guarantees the pipeline can be proven end to end.
const TKE_FALLBACK_SECTIONS = ["6759", "41497", "30654", "9120", "31861", "70471"];

// Representative section ordering for the small test batch: prefer the
// overview / product-intro / release-notes / FAQ pages first so a --limit run
// yields a meaningful slice. String hints match en-us slug URLs; for zh numeric
// section ids we then fall back to ascending order (older = overview/concept
// pages tend to have the lowest section ids).
const PREFERRED_SECTION_HINTS = ["overview", "release", "introduction", "faq", "product"];

const DEFAULT_DOCS_DIR = "/Users/luxlu/Desktop/Data center/腾讯云文档语料";

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const apply = args.includes("--apply");

function argValue(flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
}

const productFilter = argValue("--product");
const localeFilter = argValue("--locale") as Locale | undefined;
const limitArg = argValue("--limit");
const perLocaleLimit = limitArg ? Math.max(1, parseInt(limitArg, 10)) : undefined;

const DOCS_DIR = process.env.TENCENT_DOCS_DIR || DEFAULT_DOCS_DIR;
const INDEX_PATH = resolve(DOCS_DIR, "_index.json");

const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) {
  console.error(
    "Missing FIRECRAWL_API_KEY. Set it in web/.env.local or the environment, then re-run.",
  );
  process.exit(1);
}

const localesToRun: Locale[] = localeFilter ? [localeFilter] : ["zh", "en-us"];
const productsToRun = productFilter
  ? PRODUCTS.filter((p) => String(p.id) === productFilter)
  : PRODUCTS;

if (productsToRun.length === 0) {
  console.error(
    `--product ${productFilter} did not match any seed product. Known: ${PRODUCTS.map((p) => p.id).join(", ")}`,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Firecrawl HTTP helpers
// ---------------------------------------------------------------------------

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function firecrawl<T>(path: string, body: unknown, retries = 2): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${FIRECRAWL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.ok) return (await res.json()) as T;
    const text = await res.text();
    // 429 / 5xx: back off and retry
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const wait = 2000 * (attempt + 1);
      console.warn(`  Firecrawl ${path} ${res.status}; retrying in ${wait}ms…`);
      await sleep(wait);
      continue;
    }
    throw new Error(`Firecrawl ${path} ${res.status}: ${text.slice(0, 300)}`);
  }
}

interface MapResponse {
  success: boolean;
  links?: Array<{ url: string; title?: string; description?: string }>;
}

interface ScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    metadata?: Record<string, unknown>;
  };
}

// ---------------------------------------------------------------------------
// Enumeration
// ---------------------------------------------------------------------------

/** Pull the numeric section id out of a /document/product/<id>/<section> URL. */
function sectionIdOf(url: string, productId: number): string | null {
  const m = url.match(/\/document\/product\/(\d+)(?:\/([^/?#]+))?/);
  if (!m) return null;
  if (m[1] !== String(productId)) return null; // off-product link
  return m[2] ?? "index"; // bare /product/<id> is the product landing/overview
}

/**
 * Enumerate doc section ids for a product on a given locale's host, via map,
 * with a CN-sitemap fallback then a hardcoded fallback.
 * Returns canonical `https://<host>/document/product/<id>/<section>` URLs.
 */
async function enumerate(product: Product, locale: Locale): Promise<string[]> {
  const host = LOCALE_HOST[locale];
  const base = `https://${host}/document/product/${product.id}`;

  // 0) Explicit seed override: scrape exactly these section ids, skip map.
  //    Used to scope a giant shared product (CVM 213) down to the few pages a
  //    theme needs. A locale absent from seedSections is intentionally skipped.
  if (product.seedSections) {
    const seeded = product.seedSections[locale] ?? [];
    if (seeded.length === 0) {
      console.warn(`  ${product.slug}/${locale}: no seedSections for this locale — skipped`);
      return [];
    }
    return seeded.map((s) => (s === "index" ? base : `${base}/${s}`));
  }

  const sections = new Set<string>();

  // 1) Firecrawl map on the locale host.
  try {
    const map = await firecrawl<MapResponse>("/map", {
      url: base,
      limit: 200,
      includeSubdomains: false,
      sitemap: "include",
    });
    for (const link of map.links ?? []) {
      // Only keep links that resolve to THIS product on ANY tencent doc host;
      // we re-home them onto the locale host below.
      const sec = sectionIdOf(link.url, product.id);
      if (sec) sections.add(sec);
    }
  } catch (e) {
    console.warn(`  map failed for ${product.slug}/${locale}: ${(e as Error).message}`);
  }

  // 2) CN-sitemap fallback (only meaningful for zh; intl has no per-product sitemap).
  //    The map almost always succeeds, so this is a thin safety net.
  if (sections.size === 0 && locale === "zh") {
    try {
      const sm = await fetch(
        `https://cloud.tencent.com/document/product/${product.id}`,
      );
      if (sm.ok) {
        const html = await sm.text();
        const re = new RegExp(`/document/product/${product.id}/(\\d+)`, "g");
        let m: RegExpExecArray | null;
        while ((m = re.exec(html)) !== null) sections.add(m[1]);
      }
    } catch {
      /* ignore — fall through to hardcoded */
    }
  }

  // 3) Hardcoded fallback (TKE only) so the pipeline is always provable.
  if (sections.size === 0 && product.id === 457) {
    for (const s of TKE_FALLBACK_SECTIONS) sections.add(s);
    console.warn(`  using hardcoded TKE fallback seeds for ${locale}`);
  }

  // Order: preferred hints first, then numeric ascending — gives a sensible
  // small test batch under --limit.
  const ordered = [...sections].sort((a, b) => {
    const ai = PREFERRED_SECTION_HINTS.findIndex((h) => a.includes(h));
    const bi = PREFERRED_SECTION_HINTS.findIndex((h) => b.includes(h));
    const ar = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const br = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (ar !== br) return ar - br;
    return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0);
  });

  return ordered.map((s) => (s === "index" ? base : `${base}/${s}`));
}

// ---------------------------------------------------------------------------
// Markdown cleaning — strip residual nav / cookie / TOC / footer chrome
// ---------------------------------------------------------------------------

const UPDATED_RE = /^(最近更新时间：|Last updated\s*[:：])\s*(.+)$/;

// Lines that appear between the title H1 and the real body — drop them.
const BOILERPLATE_LINE = new Set([
  "_我的收藏_",
  "我的收藏",
  "Download",
  "Focus Mode",
  "Font Size",
]);

// Footer / end-of-doc markers. Everything from the first match onward is chrome.
const FOOTER_MARKERS = [
  "上一篇:",
  "上一篇：",
  "下一篇:",
  "下一篇：",
  "Previous Topic:",
  "Next Topic:",
  "Was this page helpful?",
  "## Help and Support",
  "## 帮助与支持",
  "Copyright ©",
  "Copyright©",
];

interface Cleaned {
  body: string;
  title: string | null;
  pageUpdated: string | null;
  /** false = not a real article (doc-tree landing / redirect / pure chrome) — do not store. */
  usable: boolean;
}

// Chrome phrases that must NOT survive into a stored doc. If any remain after
// cleaning, the page wasn't a real article (landing/redirect tree) — reject it.
const CHROME_RESIDUE = [
  "YOUR COOKIE PREFERENCES",
  "AI crawlers are stealing your website traffic",
  "Copyright © 2013",
  "Sign Up Free",
  "Get Started For Free",
  "近期搜索热词",
];

function cleanMarkdown(raw: string): Cleaned {
  const lines = raw.split(/\r?\n/);

  // Locate the real title H1: an H1 line followed (within 6 non-blank lines) by
  // the "updated" marker. Code-comment "# foo" and the chrome "# tencent cloud"
  // never satisfy that, so this reliably anchors the doc body across locales.
  // This anchor is also our "is a real article" signal: doc-tree landing pages
  // and redirect shells have no "Last updated:" line at all.
  let titleIdx = -1;
  let pageUpdated: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    if (!/^#\s+\S/.test(lines[i])) continue;
    let seen = 0;
    for (let j = i + 1; j < lines.length && seen < 6; j++) {
      const t = lines[j].trim();
      if (!t) continue;
      seen++;
      const m = t.match(UPDATED_RE);
      if (m) {
        titleIdx = i;
        pageUpdated = m[2].trim();
        break;
      }
    }
    if (titleIdx !== -1) break;
  }

  // No updated-anchored title H1 => this is a doc-tree landing / redirect shell,
  // not an article. These are pure chrome (cookie banner, full nav, footer) and
  // must not be stored as grounding content.
  if (titleIdx === -1) {
    return { body: "", title: null, pageUpdated: null, usable: false };
  }

  const title = lines[titleIdx].replace(/^#\s+/, "").trim();

  // End boundary: first footer marker after the title.
  const footerIdx = firstFooterIndex(lines, titleIdx + 1);
  const endIdx = footerIdx === -1 ? lines.length : footerIdx;

  const out: string[] = [];
  let inToc = false;
  for (let i = titleIdx; i < endIdx; i++) {
    const line = lines[i];
    const t = line.trim();

    // Drop the page-TOC block ("本页目录：" / "On This Page" / "Contents").
    if (/^#{1,6}\s+(本页目录|On This Page|Contents)/i.test(t) || /^本页目录/.test(t)) {
      inToc = true;
      continue;
    }
    if (inToc) {
      if (t.startsWith("- ") || t === "") continue; // bullet TOC entries / spacing
      inToc = false; // first non-bullet, non-blank line ends the TOC
    }

    if (UPDATED_RE.test(t)) continue; // updated line captured into frontmatter
    if (BOILERPLATE_LINE.has(t)) continue;
    // Drop breadcrumb-only lines (Documentation > Product > ...) that slipped past.
    if (/^\[(文档中心|Documentation)\]\(/.test(t) && t.includes("document/product")) continue;

    out.push(line);
  }

  // Collapse 3+ blank lines to a single blank; trim ends.
  const body = out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Defensive: if recognisable chrome survived, the page wasn't a clean article.
  const usable = !CHROME_RESIDUE.some((c) => body.includes(c));

  return { body, title, pageUpdated, usable };
}

function firstFooterIndex(lines: string[], from = 0): number {
  for (let i = from; i < lines.length; i++) {
    const t = lines[i].trim();
    if (FOOTER_MARKERS.some((m) => t.startsWith(m) || t.includes(m))) return i;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Index (incremental)
// ---------------------------------------------------------------------------

interface IndexEntry {
  content_hash: string;
  page_updated: string | null;
  path: string;
  scraped_at: string;
}
type Index = Record<string, IndexEntry>;

function loadIndex(): Index {
  if (!existsSync(INDEX_PATH)) return {};
  try {
    return JSON.parse(readFileSync(INDEX_PATH, "utf8")) as Index;
  } catch {
    return {};
  }
}

function yamlEscape(v: string): string {
  // Wrap in double quotes and escape backslashes/quotes for safe YAML scalars.
  return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function frontmatter(meta: Record<string, string | number | null>): string {
  const lines = ["---"];
  for (const [k, v] of Object.entries(meta)) {
    if (v === null) lines.push(`${k}: null`);
    else if (typeof v === "number") lines.push(`${k}: ${v}`);
    else lines.push(`${k}: ${yamlEscape(v)}`);
  }
  lines.push("---");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(
  `Tencent docs sync · ${apply ? "APPLY" : "DRY RUN"} · ` +
    `products: ${productsToRun.map((p) => p.id).join(",")} · ` +
    `locales: ${localesToRun.join(",")}` +
    (perLocaleLimit ? ` · limit ${perLocaleLimit}/locale` : "") +
    `\n  corpus dir: ${DOCS_DIR}`,
);

// Build the plan first (enumeration), then scrape under --apply.
interface PlanItem {
  product: Product;
  locale: Locale;
  url: string;
  sectionId: string;
}

const plan: PlanItem[] = [];
for (const product of productsToRun) {
  for (const locale of localesToRun) {
    let urls = await enumerate(product, locale);
    if (perLocaleLimit) urls = urls.slice(0, perLocaleLimit);
    for (const url of urls) {
      const sectionId = sectionIdOf(url, product.id) ?? "index";
      plan.push({ product, locale, url, sectionId });
    }
    // gentle pacing between map calls
    await sleep(400);
  }
}

console.log(`\n=== Plan (${plan.length} pages) ===`);
for (const item of plan) {
  console.log(`  [${item.product.id} ${item.locale}] ${item.url}`);
}

if (!apply) {
  console.log("\nDry run only. Re-run with --apply to scrape + write.");
  process.exit(0);
}

// ---- apply: scrape + clean + store ----
console.log("\n=== Applying ===");
const index = loadIndex();
let stored = 0,
  skipped = 0,
  failed = 0,
  empty = 0;

for (const item of plan) {
  const { product, locale, url, sectionId } = item;
  const host = LOCALE_HOST[locale];
  try {
    const res = await firecrawl<ScrapeResponse>("/scrape", {
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    });
    const raw = res.data?.markdown ?? "";
    if (!raw.trim()) {
      empty++;
      console.warn(`  [${product.id} ${locale} ${sectionId}] empty markdown — skipped`);
      continue;
    }
    const { body, title, pageUpdated, usable } = cleanMarkdown(raw);
    if (!usable) {
      empty++;
      console.warn(
        `  [${product.id} ${locale} ${sectionId}] not a real article (landing/redirect/chrome) — skipped`,
      );
      continue;
    }
    if (!body.trim() || body.length < 40) {
      empty++;
      console.warn(`  [${product.id} ${locale} ${sectionId}] cleaned body too short — skipped`);
      continue;
    }

    const contentHash = createHash("sha256").update(body).digest("hex").slice(0, 16);
    const scrapedAt = new Date().toISOString();
    const relPath = `${locale}/${product.id}-${product.slug}/${sectionId}.md`;
    const absPath = resolve(DOCS_DIR, relPath);

    // Incremental: unchanged hash -> just bump scraped_at in the index, no rewrite.
    const prior = index[url];
    if (prior && prior.content_hash === contentHash && existsSync(absPath)) {
      index[url] = { ...prior, scraped_at: scrapedAt };
      skipped++;
      console.log(`  [${product.id} ${locale} ${sectionId}] unchanged (hash) — bumped scraped_at`);
      await sleep(700);
      continue;
    }

    const fm = frontmatter({
      source_url: url,
      domain: host,
      product_id: product.id,
      product: product.slug,
      section_id: sectionId,
      locale,
      page_updated: pageUpdated,
      scraped_at: scrapedAt,
      content_hash: contentHash,
    });

    const titleHeading = title ? `` : ""; // title already present as the leading H1 in body
    const fileText = `${fm}\n\n${titleHeading}${body}\n`;

    mkdirSync(dirname(absPath), { recursive: true });
    writeFileSync(absPath, fileText, "utf8");
    index[url] = {
      content_hash: contentHash,
      page_updated: pageUpdated,
      path: relPath,
      scraped_at: scrapedAt,
    };
    stored++;
    console.log(
      `  [${product.id} ${locale} ${sectionId}] stored → ${relPath}` +
        (pageUpdated ? ` (updated ${pageUpdated})` : ""),
    );
  } catch (e) {
    failed++;
    console.error(`  [${product.id} ${locale} ${sectionId}] FAILED: ${(e as Error).message}`);
  }
  // Rate-limit: small delay between scrapes.
  await sleep(900);
}

// Persist index.
mkdirSync(DOCS_DIR, { recursive: true });
writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n", "utf8");

console.log(
  `\nDone. stored ${stored}, unchanged ${skipped}, empty ${empty}, failed ${failed}. ` +
    `Index: ${INDEX_PATH} (${Object.keys(index).length} entries).`,
);
