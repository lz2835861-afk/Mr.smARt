/**
 * Parse the Frost & Sullivan "2026年AI Infra市场报告问卷" xlsx into normalized JSON.
 *
 * Discriminator: a row is a QUESTION when col0 (序号) is a dotted number (e.g. 1.1 / 2.1.1)
 * AND col1 (评估问题) is non-empty. Header rows have col1 empty:
 *   - dimension/section headers start with 一、/二、/三、 and are "<dimension> — <section>"
 *   - sub-section headers look like "2.1 训练与推理平台"
 *
 * Usage: npx tsx web/scripts/parse-ai-infra-xlsx.ts <src.xlsx> <out.json>
 */
import * as XLSX from "xlsx";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC =
  process.argv[2] ??
  resolve(
    process.cwd(),
    "../.context/attachments/RuOlve/2026年AI Infra市场报告问卷_20260528.xlsx",
  );
const OUT = process.argv[3] ?? resolve(process.cwd(), "src/data/ai-infra-questions.json");

const wb = XLSX.read(readFileSync(SRC));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

const isQuestionId = (s: string) => /^\d+\.\d+(\.\d+)?$/.test(s.trim());
const clean = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();

let dimension = "";
let section = "";
let subsection = "";
const questions: Array<{
  id: string;
  dimension: string;
  section: string;
  subsection: string;
  question: string;
  guidance: string;
}> = [];

for (const r of rows) {
  const id = clean(r[0]);
  const q = clean(r[1]);
  const guidance = clean(r[2]);
  if (!id) continue;

  if (q) {
    if (isQuestionId(id)) {
      questions.push({ id, dimension, section, subsection, question: q, guidance });
    }
    continue;
  }

  // header row (col1 empty)
  if (/^[一二三]、/.test(id)) {
    const [dim, sec = ""] = id.split(/—|--|－/);
    dimension = dim.replace(/^[一二三]、/, "").trim();
    section = sec.trim();
    subsection = "";
  } else if (isQuestionId(id.split(/\s/)[0]) || /^\d/.test(id)) {
    // sub-section header like "2.1 训练与推理平台"
    subsection = id;
  }
}

const meta = {
  id: "ai-infra-2026",
  title: "2026年AI Infra市场报告问卷",
  firm: "Frost & Sullivan",
  source: "2026年AI Infra市场报告问卷_20260528.xlsx",
  parsed_at_rows: rows.length,
  count: questions.length,
  questions,
};

writeFileSync(OUT, JSON.stringify(meta, null, 2) + "\n");
console.log(`Wrote ${questions.length} questions → ${OUT}`);
const byDim: Record<string, number> = {};
for (const x of questions) byDim[x.dimension] = (byDim[x.dimension] || 0) + 1;
console.log("by dimension:", byDim);
