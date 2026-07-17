/**
 * Generate the static provenance JSON consumed by the platform iframe view AND the
 * Chrome extension. Parameterized by questionnaire (reused across questionnaires);
 * writes one file per mapped doc to public/provenance/<urlId>.json and MERGES the
 * shared public/provenance/index.json (urlId is globally unique across questionnaires).
 *
 * Reads (defaults = AI-Infra):
 *   --questions   src/data/<q>-questions.json   (id/question + AI-Infra or IDC fields)
 *   --map         src/data/<q>-doc-map.json     ({questionId: {docId, url, title}})
 *   --grounding   src/data/<q>-grounding.json   (OPTIONAL: {questionId: {draft, provenance}})
 *   --questionnaire-id  e.g. ai-infra-2026 | idc-aiiaas-2026
 *
 * Usage:
 *   npx tsx web/scripts/gen-provenance.ts
 *   npx tsx web/scripts/gen-provenance.ts --questionnaire-id idc-aiiaas-2026 \
 *     --questions src/data/idc-questions.json --map src/data/idc-doc-map.json --grounding src/data/idc-grounding.json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { ProvenanceDoc, ProvenanceIndex, Provenance } from "../src/types/provenance.ts";

const arg = (name: string, def: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
};
const QID = arg("--questionnaire-id", "ai-infra-2026");
const QFILE = resolve(process.cwd(), arg("--questions", "src/data/ai-infra-questions.json"));
const MAPFILE = resolve(process.cwd(), arg("--map", "src/data/ai-infra-doc-map.json"));
const GROUNDFILE = resolve(process.cwd(), arg("--grounding", "src/data/ai-infra-grounding.json"));
const OUTDIR = resolve(process.cwd(), "public/provenance");

// flexible question shape — covers AI-Infra (dimension/section/subsection/guidance)
// and IDC (category/parentText/response_format)
type Q = {
  id: string;
  question: string;
  dimension?: string;
  section?: string;
  subsection?: string;
  guidance?: string;
  category?: string;
  parentText?: string;
  response_format?: string;
};

const questions: Q[] = JSON.parse(readFileSync(QFILE, "utf8")).questions;
const docMap: Record<string, { docId: string; url: string; title: string }> = existsSync(MAPFILE)
  ? JSON.parse(readFileSync(MAPFILE, "utf8"))
  : {};
const grounding: Record<string, { draft?: string; provenance?: Provenance }> = existsSync(GROUNDFILE)
  ? JSON.parse(readFileSync(GROUNDFILE, "utf8"))
  : {};

const urlIdOf = (url: string) => url.split("?")[0].replace(/\/+$/, "").split("/").pop() ?? "";
const emptyProv: Provenance = { sources: [], quotes: [], reasoning: "", decision: "" };

mkdirSync(OUTDIR, { recursive: true });
const INDEXFILE = resolve(OUTDIR, "index.json");
// merge: keep other questionnaires' entries, drop this questionnaire's stale ones
const index: ProvenanceIndex = existsSync(INDEXFILE) ? JSON.parse(readFileSync(INDEXFILE, "utf8")) : {};
for (const k of Object.keys(index)) if (index[k].questionnaireId === QID) delete index[k];

const now = new Date().toISOString();
let n = 0;
for (const q of questions) {
  const m = docMap[q.id];
  if (!m) continue;
  const urlId = urlIdOf(m.url);
  const g = grounding[q.id] ?? {};
  const rec: ProvenanceDoc = {
    questionnaireId: QID,
    questionId: q.id,
    docId: m.docId,
    docUrl: m.url,
    urlId,
    dimension: q.dimension ?? "",
    section: q.section ?? "",
    subsection: q.subsection ?? q.category ?? "",
    question: (q.parentText ? q.parentText + " — " : "") + q.question,
    guidance: q.guidance ?? (q.response_format ? `IDC 作答格式 ${q.response_format}` : ""),
    draft: g.draft ?? "",
    provenance: g.provenance ?? emptyProv,
    generatedAt: now,
  };
  writeFileSync(resolve(OUTDIR, `${urlId}.json`), JSON.stringify(rec, null, 2) + "\n");
  index[urlId] = { questionId: q.id, docId: m.docId, questionnaireId: QID };
  n++;
}

writeFileSync(INDEXFILE, JSON.stringify(index, null, 2) + "\n");
console.log(`Wrote ${n} provenance docs for ${QID}; index now ${Object.keys(index).length} entries → ${OUTDIR}`);
