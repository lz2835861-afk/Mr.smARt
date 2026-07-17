// ─────────────────────────────────────────────────────────────────────────────
// Reports-in-progress leaderboard data.
//
// This is the single source of truth for the /reports-in-progress page.
// The reports below are MOCK DATA — swap in the real reports, rosters and dates.
// The page derives the leaderboard (ranking, counts, rosters) from these two
// arrays, so you only ever edit PRODUCTS and REPORTS.
//
// Each product / report `id` doubles as its slug.
//
// Localised bits (taglines, tracks) carry both zh + en; brand names, product
// codes and analyst firms intentionally stay in English in both locales —
// matching the rest of the site's dictionary convention.
//
// Logos: Tencent Cloud product lines (TKE, TCE …) use their `code` as the icon.
// Branded products (CodeBuddy, WorkBuddy) point `logo` at a file in
// /public/products. Drop a new asset there and set `logo` to use it.
// ─────────────────────────────────────────────────────────────────────────────

export type Bilingual = { zh: string; en: string };

export type Firm = "Gartner" | "Forrester" | "IDC" | "Omdia";

/** Lifecycle stage of a report submission — drives the status pill + urgency. */
export type ReportStage =
  | "questionnaire"
  | "briefing"
  | "review"
  | "submitted"
  | "published";

export interface Product {
  /** Stable id — also used as the slug. */
  id: string;
  /** Display name (brand). English in both locales. */
  name: string;
  /**
   * Monogram code used as the icon for Tencent Cloud product lines
   * (e.g. "TKE", "TCE"). Shown when no `logo` image is set.
   */
  code: string;
  /**
   * Path to a brand logo under /public (e.g. "/products/codebuddy.png").
   * Set this for products with their own branding (CodeBuddy, WorkBuddy …).
   * Leave undefined for cloud product lines — they use `code` as the icon.
   */
  logo?: string;
  /** True for products with their own branding (vs. a Tencent Cloud service line). */
  branded?: boolean;
  /** Accent colour — tints the monogram tile and the holo card. */
  accent: string;
  tagline?: Bilingual;
}

export interface Report {
  /** Stable id — also used as the slug. */
  id: string;
  firm: Firm;
  /** Full report name (brand). English in both locales. */
  name: string;
  /** Short label for chips/badges, e.g. "MQ · Container". */
  shortName: string;
  track?: Bilingual;
  stage: ReportStage;
  /** ISO date (YYYY-MM-DD) of the next deadline, or undefined if TBD. */
  due?: string;
  /** Product ids on the roster for this report. */
  productIds: string[];
}

/** Brand-ish accent per analyst firm — used for report badges. */
export const FIRMS: Record<Firm, { label: string; color: string }> = {
  Gartner: { label: "Gartner", color: "#1A3D7C" },
  Forrester: { label: "Forrester", color: "#00736B" },
  IDC: { label: "IDC", color: "#C8102E" },
  Omdia: { label: "Omdia", color: "#6B2FB3" },
};

/** Shown in the header as the "last updated" date. */
export const UPDATED_AT = "2026-06-07";

// ── Products ─────────────────────────────────────────────────────────────────
// Tencent Cloud product lines use their code as the icon (no logo image).
// CodeBuddy / WorkBuddy are branded — they render their logo from /public/products.

export const PRODUCTS: Product[] = [
  {
    id: "tke",
    name: "TKE",
    code: "TKE",
    accent: "#0052D9",
    tagline: { zh: "容器与 Kubernetes", en: "Containers & Kubernetes" },
  },
  {
    id: "tdsql",
    name: "TDSQL",
    code: "TDSQL",
    accent: "#0E7CF4",
    tagline: { zh: "分布式数据库", en: "Distributed SQL" },
  },
  {
    id: "cos",
    name: "COS",
    code: "COS",
    accent: "#00A4FF",
    tagline: { zh: "对象存储", en: "Object storage" },
  },
  {
    id: "cvm",
    name: "CVM",
    code: "CVM",
    accent: "#2B6DE5",
    tagline: { zh: "云服务器", en: "Compute / VMs" },
  },
  {
    id: "tce",
    name: "TCE",
    code: "TCE",
    accent: "#1456B8",
    tagline: { zh: "专有云企业版", en: "Tencent Cloud Enterprise" },
  },
  {
    id: "emr",
    name: "EMR",
    code: "EMR",
    accent: "#3E6BD6",
    tagline: { zh: "弹性大数据", en: "Big data / EMR" },
  },
  {
    id: "ti",
    name: "TI",
    code: "TI",
    accent: "#6C5CE7",
    tagline: { zh: "TI 机器学习平台", en: "TI ML platform" },
  },
  {
    id: "codebuddy",
    name: "CodeBuddy",
    code: "CB",
    branded: true,
    logo: "/products/codebuddy.png",
    accent: "#6A5AF9",
    tagline: { zh: "AI 编程助手", en: "AI coding assistant" },
  },
  {
    id: "workbuddy",
    name: "WorkBuddy",
    code: "WB",
    branded: true,
    logo: "/products/workbuddy.png",
    accent: "#19BC8B",
    tagline: { zh: "AI 办公助手", en: "AI work assistant" },
  },
];

// ── Reports ──────────────────────────────────────────────────────────────────
// Mock roster — replace with the real submissions AR is driving.

export const REPORTS: Report[] = [
  // — Cloud platform / infrastructure —
  {
    id: "gartner-scps",
    firm: "Gartner",
    name: "Magic Quadrant for Strategic Cloud Platform Services",
    shortName: "MQ · SCPS",
    track: { zh: "战略云平台服务", en: "Strategic Cloud Platform Services" },
    stage: "questionnaire",
    due: "2026-06-20",
    productIds: ["tke", "cvm", "cos", "tce", "tdsql"],
  },
  {
    id: "gartner-container",
    firm: "Gartner",
    name: "Magic Quadrant for Container Management",
    shortName: "MQ · Container",
    track: { zh: "容器管理", en: "Container Management" },
    stage: "review",
    due: "2026-07-10",
    productIds: ["tke", "tce"],
  },
  {
    id: "gartner-dbms",
    firm: "Gartner",
    name: "Magic Quadrant for Cloud Database Management Systems",
    shortName: "MQ · CDBMS",
    track: { zh: "云数据库管理系统", en: "Cloud DBMS" },
    stage: "questionnaire",
    due: "2026-06-28",
    productIds: ["tdsql"],
  },
  {
    id: "forrester-cloud",
    firm: "Forrester",
    name: "The Forrester Wave: Public Cloud Platforms, China",
    shortName: "Wave · Public Cloud",
    track: { zh: "中国公有云平台", en: "Public Cloud Platforms, China" },
    stage: "briefing",
    due: "2026-07-22",
    productIds: ["cvm", "tke", "cos", "tce"],
  },
  {
    id: "idc-iaas",
    firm: "IDC",
    name: "IDC MarketScape: Asia/Pacific Public Cloud IaaS",
    shortName: "MarketScape · IaaS",
    track: { zh: "亚太公有云 IaaS", en: "APeJ Public Cloud IaaS" },
    stage: "questionnaire",
    due: "2026-06-30",
    productIds: ["cvm", "cos", "tke"],
  },
  {
    id: "forrester-dw",
    firm: "Forrester",
    name: "The Forrester Wave: Cloud Data Warehouse",
    shortName: "Wave · Data Warehouse",
    track: { zh: "云数据仓库", en: "Cloud Data Warehouse" },
    stage: "review",
    due: "2026-07-15",
    productIds: ["emr", "tdsql"],
  },

  // — AI / developer & work assistants —
  {
    id: "gartner-ai-code",
    firm: "Gartner",
    name: "Magic Quadrant for AI Code Assistants",
    shortName: "MQ · AI Code",
    track: { zh: "AI 编程助手", en: "AI Code Assistants" },
    stage: "questionnaire",
    due: "2026-06-25",
    productIds: ["codebuddy", "ti"],
  },
  {
    id: "forrester-ai-code",
    firm: "Forrester",
    name: "The Forrester Wave: AI Coding Assistants",
    shortName: "Wave · AI Coding",
    track: { zh: "AI 编程助手", en: "AI Coding Assistants" },
    stage: "review",
    due: "2026-07-18",
    productIds: ["codebuddy"],
  },
  {
    id: "omdia-ai",
    firm: "Omdia",
    name: "Omdia Universe: AI Platforms",
    shortName: "Universe · AI",
    track: { zh: "AI 平台", en: "AI Platforms" },
    stage: "briefing",
    due: "2026-08-05",
    productIds: ["codebuddy", "workbuddy", "ti"],
  },
  {
    id: "gartner-conv-ai",
    firm: "Gartner",
    name: "Magic Quadrant for Conversational AI Platforms",
    shortName: "MQ · Conv. AI",
    track: { zh: "对话式 AI 平台", en: "Conversational AI Platforms" },
    stage: "questionnaire",
    due: "2026-07-08",
    productIds: ["workbuddy", "codebuddy"],
  },
  {
    id: "forrester-digital-workers",
    firm: "Forrester",
    name: "The Forrester Wave: Digital Workers",
    shortName: "Wave · Digital Workers",
    track: { zh: "数字员工 / Copilot", en: "Digital Workers" },
    stage: "briefing",
    due: "2026-08-12",
    productIds: ["workbuddy"],
  },
  {
    id: "idc-ai",
    firm: "IDC",
    name: "IDC MarketScape: Asia/Pacific AI Life-Cycle Software",
    shortName: "MarketScape · AI",
    track: { zh: "亚太 AI 全生命周期软件", en: "APAC AI Life-Cycle Software" },
    stage: "questionnaire",
    due: "2026-07-05",
    productIds: ["workbuddy", "ti"],
  },
  {
    id: "gartner-genai-eng",
    firm: "Gartner",
    name: "Magic Quadrant for Generative AI Engineering",
    shortName: "MQ · GenAI Eng",
    track: { zh: "生成式 AI 工程", en: "Generative AI Engineering" },
    stage: "review",
    due: "2026-07-28",
    productIds: ["codebuddy"],
  },
];

// ── Derived helpers ──────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  product: Product;
  reports: Report[];
  count: number;
  rank: number;
}

const PRODUCT_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

export function getProduct(id: string): Product | undefined {
  return PRODUCT_BY_ID.get(id);
}

export function reportsForProduct(productId: string): Report[] {
  return REPORTS.filter((r) => r.productIds.includes(productId));
}

export function productsForReport(report: Report): Product[] {
  return report.productIds
    .map((id) => PRODUCT_BY_ID.get(id))
    .filter((p): p is Product => Boolean(p));
}

/**
 * Products ranked by how many active reports they're in (desc), ties broken
 * alphabetically by name. Ranks are distinct positions (1, 2, 3 …) so the
 * podium reads with a clean gold / silver / bronze.
 */
export function getLeaderboard(): LeaderboardEntry[] {
  return PRODUCTS.map((product) => {
    const reports = reportsForProduct(product.id);
    return { product, reports, count: reports.length };
  })
    .sort((a, b) => b.count - a.count || a.product.name.localeCompare(b.product.name))
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

/** The nearest upcoming deadline across all reports (ISO string) or undefined. */
export function nextDeadline(): string | undefined {
  return REPORTS.map((r) => r.due)
    .filter((d): d is string => Boolean(d))
    .sort()[0];
}

const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Format an ISO date (YYYY-MM-DD) compactly per locale, without timezone drift. */
export function formatDue(iso: string, locale: "zh" | "en"): string {
  const [, m, d] = iso.split("-").map(Number);
  if (!m || !d) return iso;
  return locale === "zh" ? `${m}月${d}日` : `${EN_MONTHS[m - 1]} ${d}`;
}
