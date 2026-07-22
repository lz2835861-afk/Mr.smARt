import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { OMDIA_SOVEREIGN_CLOUD_SECTIONS } from "../src/data/omdiaSovereignCloud";
import type { TextField } from "../src/data/questionnaire";
import type { AiRequest, AiResponse } from "../src/lib/aiTypes";

const args = process.argv.slice(2);
const valueAfter = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const endpoint = valueAfter("--endpoint") ?? "https://web-one-sooty-82.vercel.app/api/ai";
const limit = Number(valueAfter("--limit") ?? "0");
const concurrency = Math.max(1, Number(valueAfter("--concurrency") ?? "2"));
const force = args.includes("--force");
const OUT_DIR = resolve(process.cwd(), "src/data/generated");
const OUT_FILE = resolve(OUT_DIR, "omdia-sovereign-cloud-kimi-v4.json");

interface RewriteValue {
  zh: string;
  en: string;
  status: "READY" | "NEEDS_REVIEW";
  note: string;
  model: string;
  question_id: string;
  question_title: string;
  field_label: string;
}
interface OutputFile {
  generated_at: string;
  source_version: string;
  endpoint: string;
  summary: { total: number; completed: number; ready: number; needs_review: number; failed: number };
  fields: Record<string, RewriteValue>;
  failures: Record<string, string>;
}
interface WorkItem {
  field: TextField;
  questionId: string;
  questionTitle: string;
  promptZh?: string;
  promptEn?: string;
}

const items: WorkItem[] = OMDIA_SOVEREIGN_CLOUD_SECTIONS.flatMap((section) =>
  section.questions.flatMap((question) =>
    question.groups.flatMap((group) =>
      group.fields
        .filter((field): field is TextField => field.kind === "text")
        .map((field) => ({
          field,
          questionId: question.id,
          questionTitle: question.title,
          promptZh: question.promptZh,
          promptEn: question.promptEn,
        })),
    ),
  ),
);

mkdirSync(OUT_DIR, { recursive: true });
const output: OutputFile = existsSync(OUT_FILE)
  ? (JSON.parse(readFileSync(OUT_FILE, "utf8")) as OutputFile)
  : {
      generated_at: new Date().toISOString(),
      source_version: "omdia-sovereign-cloud-v3",
      endpoint,
      summary: { total: items.length, completed: 0, ready: 0, needs_review: 0, failed: 0 },
      fields: {},
      failures: {},
    };

function save(): void {
  const values = Object.values(output.fields);
  output.generated_at = new Date().toISOString();
  output.endpoint = endpoint;
  output.summary = {
    total: items.length,
    completed: values.length,
    ready: values.filter((x) => x.status === "READY").length,
    needs_review: values.filter((x) => x.status === "NEEDS_REVIEW").length,
    failed: Object.keys(output.failures).length,
  };
  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2) + "\n", "utf8");
}

function materialFor(item: WorkItem): string {
  const r = item.field.reasoning;
  const sources = r?.sources?.map((s, i) => `${i + 1}. ${s.label}: ${s.url}`).join("\n") ?? "无公开来源";
  const quotes = r?.quotes?.map((q, i) => `${i + 1}. ${q}`).join("\n") ?? "无原文引文";
  return [
    `题目中文：${item.promptZh || item.questionTitle}`,
    `Question: ${item.promptEn || item.questionTitle}`,
    `回答字段：${item.field.label}`,
    `当前状态：${item.field.status}`,
    `来源：\n${sources}`,
    `原文引文：\n${quotes}`,
    `已有推理：\n${r?.reasoning || "无"}`,
    `已有决策边界：\n${r?.decision || "无"}`,
  ].join("\n\n");
}

function parseRewrite(text: string): Pick<RewriteValue, "zh" | "en" | "status" | "note"> {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("模型未返回 JSON");
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<RewriteValue>;
  if (!parsed.zh?.trim() || !parsed.en?.trim()) throw new Error("模型返回缺少中英文答案");
  return {
    zh: parsed.zh.trim(),
    en: parsed.en.trim(),
    status: parsed.status === "NEEDS_REVIEW" ? "NEEDS_REVIEW" : "READY",
    note: parsed.note?.trim() || "仅使用提供的事实与证据包改写",
  };
}

async function rewrite(item: WorkItem): Promise<void> {
  const id = item.field.id;
  if (!force && output.fields[id]) return;
  const body: AiRequest = {
    mode: "batch-rewrite",
    zh: item.field.defaultValue,
    en: item.field.defaultValueEn,
    material: materialFor(item),
    questionTitle: item.questionTitle,
    fieldLabel: item.field.label,
  };

  let lastError = "未知错误";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(150_000),
      });
      const json = (await response.json().catch(() => ({}))) as Partial<AiResponse> & { error?: string };
      if (!response.ok || !json.text) throw new Error(json.error || `HTTP ${response.status}`);
      const parsed = parseRewrite(json.text);
      output.fields[id] = {
        ...parsed,
        model: json.model || "unknown",
        question_id: item.questionId,
        question_title: item.questionTitle,
        field_label: item.field.label,
      };
      delete output.failures[id];
      save();
      console.log(`[${Object.keys(output.fields).length}/${items.length}] OK ${id} ${parsed.status}`);
      return;
    } catch (error) {
      lastError = (error as Error).message;
      console.warn(`attempt ${attempt}/3 failed for ${id}: ${lastError}`);
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  output.failures[id] = lastError;
  save();
  console.error(`FAILED ${id}: ${lastError}`);
}

const queue = items.filter((item) => force || !output.fields[item.field.id]);
const selected = limit > 0 ? queue.slice(0, limit) : queue;
let cursor = 0;
async function worker(): Promise<void> {
  while (cursor < selected.length) {
    const item = selected[cursor++];
    await rewrite(item);
  }
}

console.log(`Rewriting ${selected.length}/${items.length} fields via ${endpoint} (concurrency=${concurrency})`);
await Promise.all(Array.from({ length: Math.min(concurrency, selected.length || 1) }, () => worker()));
save();
console.log(JSON.stringify(output.summary, null, 2));
if (output.summary.failed > 0) process.exitCode = 1;
