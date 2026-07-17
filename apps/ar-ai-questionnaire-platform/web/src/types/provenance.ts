/**
 * Provenance contract — the single shared data shape consumed by BOTH:
 *   1. the in-platform iframe view (web/ React app), and
 *   2. the Chrome extension injected into docs.qq.com.
 *
 * One JSON file per question-doc is emitted to `web/public/provenance/<urlId>.json`
 * (served statically at https://<platform-domain>/provenance/<urlId>.json), plus an
 * `index.json`. `urlId` is the trailing id of the Tencent-Doc URL (the part after the
 * last "/" in https://docs.qq.com/aio/<urlId>) — i.e. what is visible in the browser
 * address bar when an analyst/接口人 opens the doc, so the extension can look it up
 * directly from window.location.
 */

export type ProvSourceKind = "wechat" | "doc" | "web" | "other";

export interface ProvSource {
  /** display label, e.g. "腾讯云 · 2026-05-29" or "TKE 更新日志" */
  label: string;
  url: string;
  kind: ProvSourceKind;
}

/** Mirrors the existing Reasoning struct (来源 / 原文引用 / 推理 / 最终决策). */
export interface Provenance {
  sources: ProvSource[]; // 来源
  quotes: string[]; // 原文引用
  reasoning: string; // 推理
  decision: string; // 最终决策
}

export interface ProvenanceDoc {
  questionnaireId: string; // e.g. "ai-infra-2026"
  questionId: string; // e.g. "2.1.1"
  docId: string; // Tencent Docs OpenAPI file_id (internal ops)
  docUrl: string; // https://docs.qq.com/aio/<urlId>
  urlId: string; // trailing id of docUrl — the extension's lookup key
  dimension: string;
  section: string;
  subsection: string;
  question: string;
  guidance: string;
  /** optional AI-drafted first answer (empty until grounding runs) */
  draft: string;
  provenance: Provenance;
  generatedAt: string; // ISO
}

/** index.json: urlId -> pointer (lets the extension resolve a browser URL to a question). */
export type ProvenanceIndex = Record<
  string,
  { questionId: string; docId: string; questionnaireId: string }
>;
