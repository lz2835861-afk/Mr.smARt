/** Shared request/response contract between the client (useAi) and /api/ai. */

export type AiMode = "polish" | "translate" | "draft" | "custom" | "ask" | "batch-rewrite";

export interface AiRequest {
  mode: AiMode;
  /** Current Chinese draft (source for polish / translate). */
  zh?: string;
  /** Current English draft (context). */
  en?: string;
  /** Raw material the product person brings in (facts, docs, bullet points). */
  material?: string;
  /** Free-form instruction for "custom" mode. */
  instruction?: string;
  /** Field / question labels for grounding the prompt. */
  fieldLabel?: string;
  questionTitle?: string;
  /** Soft word/character limit hint. */
  wordLimit?: number;
  /** Excerpt highlighted in the main column — focus for polish / custom edits. */
  selection?: string;
}

export type AiSourceTier = "yunzhi" | "tencent-cloud-market";

export interface AiSource {
  title: string;
  url: string;
  snippet?: string;
  tier: AiSourceTier;
  /** Human-readable source label displayed in the UI. */
  source: "云知知识库" | "腾讯云市场精选";
}

export interface KnowledgeResponse {
  sources: AiSource[];
  status: "ok" | "skipped" | "not-configured" | "error";
  usedFallback: boolean;
  primaryCount: number;
  fallbackCount: number;
  warning?: string;
}

export interface AiResponse {
  text: string;
  model?: string;
  /** Sources retrieved server-side from Tencent Lexiang for this answer. */
  sources?: AiSource[];
  knowledge?: Omit<KnowledgeResponse, "sources">;
}

/** Request/response for POST /api/extract — uploads a file to Moonshot's
 *  Files API (purpose=file-extract) and returns the extracted plain text. */
export interface ExtractRequest {
  /** Original file name (used as the Moonshot upload filename + UI label). */
  filename?: string;
  /** MIME type of the file. */
  contentType?: string;
  /** Base64-encoded file bytes (no data: prefix). */
  dataBase64: string;
}

export interface ExtractResponse {
  /** Extracted plain text, ready to feed into the chat as material. */
  text: string;
  filename?: string;
  /** True if the text was capped to fit the model context. */
  truncated?: boolean;
}
