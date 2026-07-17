/**
 * Provenance data contract — COPIED from web/src/types/provenance.ts.
 *
 * This is a deliberate copy, not an import. The extension is a separate build
 * artifact that must not reach across the repo boundary into web/. Keep these
 * shapes in sync with web/src/types/provenance.ts by hand.
 */

export type ProvSourceKind = "wechat" | "doc" | "web" | "other";

export interface ProvSource {
  /** display label, e.g. "腾讯云 · 2026-05-29" or "TKE 更新日志" */
  label: string;
  url: string;
  kind: ProvSourceKind;
}

/** Mirrors the Reasoning struct (来源 / 原文引用 / 推理 / 最终决策). */
export interface Provenance {
  sources: ProvSource[]; // 来源
  quotes: string[]; // 原文引用
  reasoning: string; // 推理
  decision: string; // 最终决策
}

export interface ProvenanceDoc {
  questionnaireId: string;
  questionId: string;
  docId: string;
  docUrl: string;
  urlId: string;
  dimension: string;
  section: string;
  subsection: string;
  question: string;
  guidance: string;
  draft: string;
  provenance: Provenance;
  generatedAt: string;
}

/** index.json: urlId -> pointer (resolves a browser URL to a question). */
export type ProvenanceIndex = Record<
  string,
  { questionId: string; docId: string; questionnaireId: string }
>;
