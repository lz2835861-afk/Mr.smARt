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
  sections: Section[];
}

export const QUESTIONNAIRES: Questionnaire[] = [
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
    status: "证据管线 v3 已生成，待产品/法务解锁敏感项",
    nextMilestone: { label: "厂商问卷提交", date: "2026-09-28" },
    storageKey: "omdia_sovereign_cloud_2026_v3",
    sections: OMDIA_SOVEREIGN_CLOUD_SECTIONS,
  },
];

export const DEFAULT_QUESTIONNAIRE_ID = "gartner-container-2026";

export const ACTIVE_QUESTIONNAIRE_STORAGE_KEY = "active_questionnaire_id";

/** Look up by stable id (storage scope, registry default). */
export function getQuestionnaire(id: string | null | undefined): Questionnaire {
  return (
    QUESTIONNAIRES.find((q) => q.id === id) ??
    QUESTIONNAIRES.find((q) => q.id === DEFAULT_QUESTIONNAIRE_ID) ??
    QUESTIONNAIRES[0]
  );
}

/** Look up by URL slug. Returns undefined for an unknown slug so the route can
 *  redirect home instead of silently falling back to a default. */
export function getQuestionnaireBySlug(slug: string | null | undefined): Questionnaire | undefined {
  return QUESTIONNAIRES.find((q) => q.slug === slug);
}
