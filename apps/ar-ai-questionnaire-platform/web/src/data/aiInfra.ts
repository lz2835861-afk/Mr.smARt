// AI-Infra 2026 questionnaire — the doc-embedding view's data layer.
//
// Unlike the Section/field questionnaires in `questionnaires.ts`, this one is a
// thin index over 42 questions, each backed by a live Tencent Doc (the analyst
// edits the answer directly in docs.qq.com) plus a provenance JSON served from
// /provenance/<urlId>.json. So it gets its own lightweight registry here rather
// than the heavy Section[] model.

import questionsJson from "./ai-infra-questions.json";
import docMapJson from "./ai-infra-doc-map.json";
import type { Provenance } from "../types/provenance";

export const AI_INFRA_QUESTIONNAIRE_ID = "ai-infra-2026";
export const AI_INFRA_SLUG = "ai-infra-2026";
export const AI_INFRA_TITLE = "2026年AI Infra市场报告问卷 (Frost & Sullivan)";

export interface AiInfraQuestion {
  id: string;
  dimension: string;
  section: string;
  subsection: string;
  question: string;
  guidance: string;
}

export interface AiInfraDocRef {
  docId: string;
  url: string;
  title: string;
}

export const AI_INFRA_QUESTIONS: AiInfraQuestion[] = (
  questionsJson.questions as AiInfraQuestion[]
);

export const AI_INFRA_FIRM: string = questionsJson.firm;

const DOC_MAP = docMapJson as Record<string, AiInfraDocRef>;

/** The doc reference for a question, or undefined when none has been created. */
export function docFor(questionId: string): AiInfraDocRef | undefined {
  return DOC_MAP[questionId];
}

/** Trailing id of the Tencent-Doc URL (the part after the last "/"), used to
 *  resolve the static /provenance/<urlId>.json file. */
export function urlIdFor(questionId: string): string | undefined {
  const ref = DOC_MAP[questionId];
  if (!ref) return undefined;
  const parts = ref.url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function questionById(id: string): AiInfraQuestion | undefined {
  return AI_INFRA_QUESTIONS.find((q) => q.id === id);
}

// ── grouping: dimension → section → subsection ──────────────────────────────

export interface AiInfraSubGroup {
  /** subsection label, or "" for questions with no subsection */
  subsection: string;
  questions: AiInfraQuestion[];
}
export interface AiInfraSection {
  section: string;
  subgroups: AiInfraSubGroup[];
}
export interface AiInfraDimension {
  dimension: string;
  sections: AiInfraSection[];
}

/** Build the dimension → section → subsection tree, preserving file order. */
export function groupQuestions(questions: AiInfraQuestion[]): AiInfraDimension[] {
  const dims: AiInfraDimension[] = [];
  for (const q of questions) {
    let dim = dims.find((d) => d.dimension === q.dimension);
    if (!dim) {
      dim = { dimension: q.dimension, sections: [] };
      dims.push(dim);
    }
    let sec = dim.sections.find((s) => s.section === q.section);
    if (!sec) {
      sec = { section: q.section, subgroups: [] };
      dim.sections.push(sec);
    }
    let sub = sec.subgroups.find((g) => g.subsection === q.subsection);
    if (!sub) {
      sub = { subsection: q.subsection, questions: [] };
      sec.subgroups.push(sub);
    }
    sub.questions.push(q);
  }
  return dims;
}

export const EMPTY_PROVENANCE: Provenance = {
  sources: [],
  quotes: [],
  reasoning: "",
  decision: "",
};

/** True when grounding hasn't produced any evidence yet. */
export function isProvenanceEmpty(p: Provenance | null | undefined): boolean {
  if (!p) return true;
  return (
    p.sources.length === 0 &&
    p.quotes.length === 0 &&
    !p.reasoning?.trim() &&
    !p.decision?.trim()
  );
}
