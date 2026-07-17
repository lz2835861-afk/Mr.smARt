/**
 * Parse the IDC MarketScape RFI xlsx (Worldwide Public Cloud AI IaaS 2026) into normalized JSON.
 *
 * Format (differs from the AI Infra questionnaire):
 *  - 3 sheets = sections: Preliminary / Capabilities / Strategies
 *  - cols: A=Question# (1.1 / 2.3 / 1.5.1) · B=question text · C=Response Format ((open text)/($US)/(%)/(#)) · D=Vendor Response
 *  - Capabilities/Strategies: a CATEGORY row (A=name, B="Definition: …") precedes its question(s)
 *  - Preliminary: parent rows (1.5 "…regions:", 1.6 "…contact") with nested children (1.5.1 North America …)
 *
 * Leaf questions only (ids that are NOT a prefix of another id) become answerable items;
 * parent ids are dropped but their text is kept as `parentText` context on the children.
 *
 * Usage: npx tsx web/scripts/parse-idc-xlsx.ts <src.xlsx> <out.json>
 */
import * as XLSX from "xlsx";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = process.argv[2];
const OUT = process.argv[3] ?? resolve(process.cwd(), "src/data/idc-questions.json");
if (!SRC) throw new Error("usage: parse-idc-xlsx.ts <src.xlsx> <out.json>");

// cellText keeps the FORMATTED string (.w) so question ids like "2.10"/"2.20" don't get
// read as numbers (2.1/2.2) and collide. Pair with raw:false in sheet_to_json below.
const wb = XLSX.read(readFileSync(SRC), { cellText: true });
const isId = (s: string) => /^\d+(\.\d+){1,2}$/.test(String(s).trim());
const clean = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();

type Q = {
  id: string;
  section: string; // sheet name
  category: string; // "Definition" category (Capabilities/Strategies) or ""
  definition: string;
  question: string;
  response_format: string;
  parent: string;
  parentText: string;
};

const raw: Q[] = [];
const textById: Record<string, string> = {};

for (const sheetName of wb.SheetNames) {
  const rows: string[][] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: "", raw: false });
  let category = "";
  let definition = "";
  for (const r of rows) {
    const id = clean(r[0]);
    const b = clean(r[1]);
    const fmt = clean(r[2]);
    if (id && isId(id) && b) {
      const parts = id.split(".");
      const parent = parts.length === 3 ? parts.slice(0, 2).join(".") : "";
      raw.push({ id, section: sheetName, category, definition, question: b, response_format: fmt, parent, parentText: "" });
      textById[id] = b;
    } else if (b && /^definition\s*[:：]/i.test(b)) {
      category = id || category;
      definition = b.replace(/^definition\s*[:：]\s*/i, "");
    }
  }
}

// drop container ids (a strict prefix of another id); keep their text as parentText on children
const ids = new Set(raw.map((q) => q.id));
const isContainer = (id: string) => [...ids].some((other) => other !== id && other.startsWith(id + "."));
const questions = raw
  .filter((q) => !isContainer(q.id))
  .map((q) => ({ ...q, parentText: q.parent ? textById[q.parent] ?? "" : "" }));

writeFileSync(
  OUT,
  JSON.stringify(
    {
      id: "idc-aiiaas-2026",
      title: "IDC MarketScape RFI — Worldwide Public Cloud AI IaaS 2026 Vendor Assessment",
      firm: "IDC",
      lang: "zh", // answers drafted in Chinese per owner
      source: "IDC MarketScape RFI - Worldwide Public Cloud AI Infrastructure2026.xlsx",
      count: questions.length,
      questions,
    },
    null,
    2,
  ) + "\n",
);

console.log(`Wrote ${questions.length} leaf questions → ${OUT}`);
const bySec: Record<string, number> = {};
const byFmt: Record<string, number> = {};
for (const q of questions) {
  bySec[q.section] = (bySec[q.section] || 0) + 1;
  byFmt[q.response_format || "(none)"] = (byFmt[q.response_format || "(none)"] || 0) + 1;
}
console.log("by section:", bySec);
console.log("by response_format:", byFmt);
