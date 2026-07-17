/**
 * Provision one Tencent Doc (smartcanvas) per questionnaire question, set it to
 * publicWrite (全员可编辑 share policy), and record a {questionId -> {docId,url}} map.
 * Actual editing still depends on the user's current Tencent Docs login session
 * and browser storage/cookie policy.
 *
 * Uses the authed `tencent-docs` MCP via the mcporter CLI:
 *   create_smartcanvas_by_mdx → manage.move_file (into a folder) → manage.set_privilege(policy=3)
 *
 * Idempotent: questions already present in the doc-map are skipped, so you can pilot a few
 * (--limit 3) then run the rest later. dry-run by default; pass --apply to actually create.
 *
 * Usage:
 *   npx tsx web/scripts/provision-docs.ts [--apply] [--limit N] [--ids 1.1,1.2]
 *       [--questions src/data/ai-infra-questions.json] [--map src/data/ai-infra-doc-map.json]
 *       [--folder-id <id>] [--folder-title "2026 AI Infra 问卷"]
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

type Q = {
  id: string;
  question: string;
  // AI-Infra shape
  dimension?: string;
  section?: string;
  subsection?: string;
  guidance?: string;
  // IDC shape
  category?: string; // the "Definition" category
  parentText?: string; // nested-question parent context (e.g. 1.5.1)
  response_format?: string; // (open text) / ($US) / (%) / (#)
};

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const opt = (name: string, def = "") => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const APPLY = flag("--apply");
const RETEMPLATE = flag("--retemplate"); // delete the docs in the map + recreate all with the current template
const LIMIT = Number(opt("--limit", "0")) || 0;
const ONLY_IDS = opt("--ids", "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const QFILE = resolve(process.cwd(), opt("--questions", "src/data/ai-infra-questions.json"));
const MAPFILE = resolve(process.cwd(), opt("--map", "src/data/ai-infra-doc-map.json"));
const FOLDER_TITLE = opt("--folder-title", "2026 AI Infra 问卷");
let folderId = opt("--folder-id", "");

const SERVER = "tencent-docs";

function mcp(tool: string, payload: Record<string, unknown>): any {
  const out = execFileSync(
    "mcporter",
    ["call", SERVER, tool, "--args", JSON.stringify(payload)],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  const s = out.indexOf("{");
  const e = out.lastIndexOf("}");
  if (s < 0 || e < 0) throw new Error(`${tool}: no JSON in output: ${out.slice(0, 200)}`);
  const json = JSON.parse(out.slice(s, e + 1));
  if (json.error) throw new Error(`${tool} returned error: ${json.error}`);
  return json;
}

const GROUNDFILE = resolve(process.cwd(), opt("--grounding", "src/data/ai-infra-grounding.json"));
type Prov = {
  sources?: { label: string; url: string; kind?: string }[];
  quotes?: string[];
  reasoning?: string;
  decision?: string;
};
const grounding: Record<string, { draft?: string; provenance?: Prov }> = existsSync(GROUNDFILE)
  ? JSON.parse(readFileSync(GROUNDFILE, "utf8"))
  : {};

const src = JSON.parse(readFileSync(QFILE, "utf8")) as { questions: Q[] };
const docMap: Record<string, { docId: string; url: string; title: string }> = existsSync(MAPFILE)
  ? JSON.parse(readFileSync(MAPFILE, "utf8"))
  : {};

// --retemplate: rebuild every doc → process all questions (existing ones get deleted + recreated).
let todo = RETEMPLATE ? [...src.questions] : src.questions.filter((q) => !docMap[q.id]);
if (ONLY_IDS.length) todo = todo.filter((q) => ONLY_IDS.includes(q.id));
if (LIMIT > 0) todo = todo.slice(0, LIMIT);

// Doc template (matches the approved screenshot): compact "<id> <section>" H1,
// a collapsible 「问题：」 heading with the question in a callout (blockquote),
// then a collapsible 「答案」 heading holding the grounded draft (if any) or a placeholder.
const buildMdx = (q: Q) => {
  const g = grounding[q.id];
  const draft = g?.draft?.trim();
  const answer = draft && draft.length ? draft : "[请在此填写]";
  // No body H1 — docs.qq.com already renders the file title ("<id> <section>") at the top.
  const qline = `${q.parentText ? q.parentText + " — " : ""}${q.question}`;
  const lines: string[] = [`#### 问题：`, `> ${qline}`];
  if (q.response_format) lines.push(`> 　_IDC 作答格式：${q.response_format}_`);
  lines.push(``, `#### 答案`, ``, answer, ``);

  // 证据链 / Provenance written into the doc (来源 / 原文引用 / 推理 / 最终决策).
  const p = g?.provenance;
  const hasProv = !!p && ((p.sources?.length ?? 0) > 0 || (p.quotes?.length ?? 0) > 0 || !!p.reasoning || !!p.decision);
  if (hasProv) {
    lines.push(`#### 证据链 · Provenance`, ``);
    if (p!.sources?.length) {
      lines.push(`**来源（${p!.sources.length}）**`, ``);
      for (const s of p!.sources) lines.push(`- [${s.label}](${s.url})`);
      lines.push(``);
    }
    if (p!.quotes?.length) {
      lines.push(`**原文引用（${p!.quotes.length}）**`, ``);
      for (const qt of p!.quotes) lines.push(`> ${qt}`, ``);
    }
    if (p!.reasoning) lines.push(`**推理**`, ``, p!.reasoning, ``);
    if (p!.decision) lines.push(`**最终决策**`, ``, p!.decision, ``);
  }
  lines.push(`——`, ``);
  return lines.join("\n");
};

// Tencent Docs enforces a short title limit (~30 chars); keep it compact — the full
// question lives in the doc body. e.g. "2.1.1 模型研发生产".
// Tencent doc titles reject : / \ ? * " < > | (code 12977) and cap ~30 chars.
const title = (q: Q) =>
  `${q.id} ${q.category || q.section || ""}`
    .replace(/[:：/\\?*"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);

console.log(
  `${APPLY ? "APPLY" : "DRY-RUN"} · ${todo.length} doc(s) to create ` +
    `(already mapped: ${Object.keys(docMap).length}/${src.questions.length})`,
);
if (!todo.length) {
  console.log("Nothing to do.");
  process.exit(0);
}

if (!APPLY) {
  for (const q of todo) console.log(`  would create: ${title(q)}`);
  console.log(`\nFolder: ${folderId || `(would create "${FOLDER_TITLE}")`}`);
  console.log("Re-run with --apply to create.");
  process.exit(0);
}

// --retemplate: delete the existing docs first, then recreate them all with the current template.
if (RETEMPLATE) {
  let del = 0;
  for (const q of todo) {
    const m = docMap[q.id];
    if (!m) continue;
    try {
      mcp("manage.delete_file", { file_id: m.docId, delete_type: "origin" });
      del++;
      delete docMap[q.id];
    } catch (e) {
      console.warn(`  delete ${q.id} (${m.docId}) warn: ${(e as Error).message}`);
    }
  }
  writeFileSync(MAPFILE, JSON.stringify(docMap, null, 2) + "\n");
  console.log(`Retemplate: deleted ${del} old doc(s) for the ${todo.length} to recreate.`);
}

// ensure folder
if (!folderId) {
  const f = mcp("manage.create_file", { file_type: "folder", title: FOLDER_TITLE });
  folderId = f.file_id;
  console.log(`Created folder "${FOLDER_TITLE}" → ${folderId}`);
}

let ok = 0;
for (const q of todo) {
  try {
    const created = mcp("create_smartcanvas_by_mdx", { title: title(q), mdx: buildMdx(q) });
    const fileId: string = created.file_id;
    try {
      if (folderId) mcp("manage.move_file", { file_id: fileId, target_folder_id: folderId });
    } catch (e) {
      console.warn(`  [${q.id}] move_file warn: ${(e as Error).message}`);
    }
    mcp("manage.set_privilege", { file_id: fileId, policy: 3 });
    docMap[q.id] = { docId: fileId, url: created.url, title: title(q) };
    writeFileSync(MAPFILE, JSON.stringify(docMap, null, 2) + "\n"); // persist after each (resumable)
    ok++;
    console.log(`  ✓ ${q.id} → ${created.url}`);
  } catch (e) {
    console.error(`  ✗ ${q.id}: ${(e as Error).message}`);
  }
}
console.log(`\nDone: created ${ok}/${todo.length}. Map → ${MAPFILE} (folder ${folderId})`);
