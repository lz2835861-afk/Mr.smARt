// Questionnaire registry — the multi-questionnaire platform layer.
//
// Each questionnaire bundles its own section/question/answer data, plus the
// metadata the shell needs to switch between them: a label, the analyst firm,
// the vendor under evaluation, and a localStorage namespace so answer sets do
// not collide.
//
// Adding a new questionnaire = author a `<name>.ts` exporting Section[], then
// add one entry here. No other code changes required.

import { SECTIONS as OMDIA_SECTIONS, type Section } from "./questionnaire";
import { GARTNER_CONTAINER_SECTIONS } from "./gartner-container";
import { OMDIA_SOVEREIGN_CLOUD_SECTIONS } from "./omdiaSovereignCloud";

/** A product under evaluation — rendered as a logo/abbr chip on the home card. */
export interface QuestionnaireProduct {
  /** Full name (used as the chip tooltip). */
  name: string;
  /** Short label shown when there's no logo (e.g. "TKE"). */
  abbr: string;
  /** Optional logo URL — drop the file in web/public/ and reference as "/x.png". */
  logoUrl?: string;
}

/** The next important date for a questionnaire (card meta). */
export interface QuestionnaireMilestone {
  /** What the deadline is, e.g. "厂商问卷提交". */
  label: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
}

export interface Questionnaire {
  /** Stable id; also used as the storage namespace + Supabase scope key. */
  id: string;
  /** URL slug — human-readable, stable, decoupled from the versioned id.
   *  Drives the /q/:slug route. Keep it lowercase-kebab and never reuse. */
  slug: string;
  /** Sidebar switcher label. */
  label: string;
  /** Chinese-only display title for the home card. */
  titleZh: string;
  /** Short subtitle under the title. */
  subtitle: string;
  /** Analyst firm (Omdia / Gartner / Forrester / IDC). */
  firm: string;
  /** Vendor under evaluation. */
  vendor: string;
  /** Products under evaluation — shown as logo/abbr chips at the top of the card. */
  products: QuestionnaireProduct[];
  /** What's currently being worked on (card meta). */
  status: string;
  /** Next important date (card meta). NOTE: placeholder dates — edit to real ones. */
  nextMilestone: QuestionnaireMilestone;
  /** localStorage key for this questionnaire's answer set. */
  storageKey: string;
  /** True for questionnaire definitions imported in this browser only. */
  imported?: boolean;
  /** Original local file name for a browser-imported questionnaire. */
  sourceName?: string;
  /** ISO timestamp for a browser-imported questionnaire. */
  importedAt?: string;
  /** Whether the questionnaire is shown in the shared workspace list. */
  published?: boolean;
  /** True when this definition is backed by the shared Supabase catalog. */
  remoteManaged?: boolean;
  /** Optional Supabase Storage path for the original uploaded report. */
  reportPath?: string;
  sections: Section[];
}

export const BUILT_IN_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: "omdia-cloud-china-2026",
    slug: "omdia-cloud-china",
    label: "Omdia RFI 2026",
    titleZh: "Omdia 问卷 · 中国企业出海上云",
    subtitle: "Cloud · Chinese Enterprise Going Global",
    firm: "Omdia",
    vendor: "Tencent Cloud",
    products: [
      { name: "腾讯云国际", abbr: "腾讯云" },
      { name: "腾讯混元", abbr: "混元" },
      { name: "EdgeOne", abbr: "EdgeOne" },
      { name: "Tencent Kubernetes Engine", abbr: "TKE" },
    ],
    status: "英文稿待 AR 终审",
    nextMilestone: { label: "AR 终审", date: "2026-06-20" },
    storageKey: "omdia_rfi_2026_v7",
    sections: OMDIA_SECTIONS,
  },
  {
    id: "gartner-container-2026",
    slug: "gartner-container",
    label: "Gartner MQ · Container",
    titleZh: "Gartner 魔力象限 · 容器管理",
    subtitle: "Container Management · Vendor Briefing",
    firm: "Gartner",
    vendor: "Tencent Cloud (TKE)",
    products: [
      { name: "Tencent Kubernetes Engine", abbr: "TKE" },
      { name: "Elastic Kubernetes Service", abbr: "EKS" },
      { name: "Tencent Container Registry", abbr: "TCR" },
      { name: "TKE Edge", abbr: "TKE-Edge" },
    ],
    status: "全量起草完成，待 AR 终审",
    nextMilestone: { label: "厂商问卷提交", date: "2026-07-15" },
    storageKey: "gartner_container_2026_v3",
    sections: GARTNER_CONTAINER_SECTIONS,
  },
  {
    id: "omdia-sovereign-cloud-2026",
    slug: "omdia-sovereign-cloud",
    label: "Omdia Market Radar · Sovereign Cloud",
    titleZh: "Omdia 问卷 · 选择公共主权云解决方案",
    subtitle: "Selecting a Public Sovereign Cloud Solution",
    firm: "Omdia",
    vendor: "Tencent Cloud",
    products: [
      { name: "Tencent Cloud Enterprise", abbr: "TCE" },
      { name: "腾讯云国际", abbr: "腾讯云" },
      { name: "腾讯混元", abbr: "混元" },
    ],
    status: "Kimi 专家团 v4 已逐字段改写，待产品/法务终审",
    nextMilestone: { label: "厂商问卷提交", date: "2026-09-28" },
    storageKey: "omdia_sovereign_cloud_2026_v4",
    sections: OMDIA_SOVEREIGN_CLOUD_SECTIONS,
  },
];

/** Compatibility export for code that only needs the built-in registry. */
export const QUESTIONNAIRES = BUILT_IN_QUESTIONNAIRES;

export const DEFAULT_QUESTIONNAIRE_ID = "gartner-container-2026";

export const ACTIVE_QUESTIONNAIRE_STORAGE_KEY = "active_questionnaire_id";
export const IMPORTED_QUESTIONNAIRES_STORAGE_KEY = "imported_questionnaires_v1";
export const CLOUD_QUESTIONNAIRES_STORAGE_KEY = "cloud_questionnaires_cache_v1";

function isQuestionnaire(value: unknown): value is Questionnaire {
  if (!value || typeof value !== "object") return false;
  const q = value as Partial<Questionnaire>;
  return (
    typeof q.id === "string" &&
    typeof q.slug === "string" &&
    typeof q.label === "string" &&
    typeof q.titleZh === "string" &&
    typeof q.storageKey === "string" &&
    Array.isArray(q.sections)
  );
}

function readQuestionnaireCache(key: string): Questionnaire[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isQuestionnaire)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function getImportedQuestionnaires(): Questionnaire[] {
  return readQuestionnaireCache(IMPORTED_QUESTIONNAIRES_STORAGE_KEY);
}

export function getCloudQuestionnaires(): Questionnaire[] {
  return readQuestionnaireCache(CLOUD_QUESTIONNAIRES_STORAGE_KEY);
}

export function cacheCloudQuestionnaires(questionnaires: Questionnaire[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLOUD_QUESTIONNAIRES_STORAGE_KEY, JSON.stringify(questionnaires));
}

export function getAllQuestionnaires(options?: { includeHidden?: boolean }): Questionnaire[] {
  const byId = new Map<string, Questionnaire>();
  BUILT_IN_QUESTIONNAIRES.forEach((q) => byId.set(q.id, { ...q, published: q.published ?? true }));
  getImportedQuestionnaires().forEach((q) => byId.set(q.id, q));
  getCloudQuestionnaires().forEach((q) => byId.set(q.id, q));
  const all = Array.from(byId.values());
  return options?.includeHidden ? all : all.filter((q) => q.published !== false);
}

export function saveImportedQuestionnaire(questionnaire: Questionnaire): void {
  if (typeof window === "undefined") return;
  const imported = getImportedQuestionnaires();
  const next = [
    questionnaire,
    ...imported.filter((q) => q.id !== questionnaire.id && q.slug !== questionnaire.slug),
  ];
  window.localStorage.setItem(IMPORTED_QUESTIONNAIRES_STORAGE_KEY, JSON.stringify(next));
}

export function deleteImportedQuestionnaire(id: string): void {
  if (typeof window === "undefined") return;
  const imported = getImportedQuestionnaires();
  const target = imported.find((q) => q.id === id);
  const next = imported.filter((q) => q.id !== id);
  window.localStorage.setItem(IMPORTED_QUESTIONNAIRES_STORAGE_KEY, JSON.stringify(next));
  if (target) window.localStorage.removeItem(target.storageKey);
}

/** Look up by stable id (storage scope, registry default). */
export function getQuestionnaire(id: string | null | undefined): Questionnaire {
  const questionnaires = getAllQuestionnaires({ includeHidden: true });
  return (
    questionnaires.find((q) => q.id === id) ??
    questionnaires.find((q) => q.id === DEFAULT_QUESTIONNAIRE_ID) ??
    questionnaires[0]
  );
}

/** Look up by URL slug. Returns undefined for an unknown slug so the route can
 *  redirect home instead of silently falling back to a default. */
export function getQuestionnaireBySlug(slug: string | null | undefined): Questionnaire | undefined {
  return getAllQuestionnaires({ includeHidden: true }).find((q) => q.slug === slug);
}
