/**
 * Build the IDC aggregate Tencent Sheet: one flat sheet listing all 51 questions with
 *   A 序号 · B 章节/类别 · C 题目(含作答格式) · D 作答文档(腾讯文档链接) · E 参考链接(Provenance 来源 URL，逐条)
 * Creates the sheet in the IDC folder, populates, sets publicWrite. Run AFTER retemplate
 * (uses the final idc-doc-map.json URLs).
 * Run: node web/scripts/build-idc-sheet.cjs [folder_id]
 */
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const FOLDER = process.argv[2] || "ApZATDkSfLew";
const questions = require(path.resolve(__dirname, "../src/data/idc-questions.json")).questions;
const docMap = require(path.resolve(__dirname, "../src/data/idc-doc-map.json"));
const grounding = require(path.resolve(__dirname, "../src/data/idc-grounding.json"));

function mcp(tool, args) {
  const o = execFileSync("mcporter", ["call", "tencent-docs", tool, "--args", JSON.stringify(args)], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const s = o.indexOf("{"), e = o.lastIndexOf("}");
  if (s < 0) throw new Error(`${tool}: ${o.slice(0, 200)}`);
  const j = JSON.parse(o.slice(s, e + 1));
  if (j.error) throw new Error(`${tool}: ${j.error}`);
  return j;
}

// create sheet
const created = mcp("manage.create_file", { file_type: "sheet", title: "IDC AI IaaS 2026 问卷（聚合表）", parent_id: FOLDER });
const FID = created.file_id;
const SID = mcp("sheet.get_sheet_info", { file_id: FID }).sheets[0].sheet_id;
console.log(`sheet: ${created.url}  (file_id ${FID}, sheet ${SID})`);

const cells = [
  { row: 0, col: 0, value_type: "STRING", string_value: "序号" },
  { row: 0, col: 1, value_type: "STRING", string_value: "章节 / 类别" },
  { row: 0, col: 2, value_type: "STRING", string_value: "题目（含作答格式）" },
  { row: 0, col: 3, value_type: "STRING", string_value: "作答文档（腾讯文档）" },
  { row: 0, col: 4, value_type: "STRING", string_value: "参考链接（Provenance 来源）" },
];
const links = [];
let r = 1;
let totalUrls = 0;
for (const q of questions) {
  const m = docMap[q.id];
  const cat = [q.section, q.category].filter(Boolean).join(" / ");
  const qtext = `${q.parentText ? q.parentText + " — " : ""}${q.question}${q.response_format ? `  ${q.response_format}` : ""}`;
  cells.push({ row: r, col: 0, value_type: "STRING", string_value: q.id });
  cells.push({ row: r, col: 1, value_type: "STRING", string_value: cat });
  cells.push({ row: r, col: 2, value_type: "STRING", string_value: qtext });
  if (m) links.push({ row: r, col: 3, url: m.url, display_text: m.url });
  const urls = [...new Set((grounding[q.id]?.provenance?.sources || []).map((s) => s.url).filter(Boolean))];
  totalUrls += urls.length;
  cells.push({ row: r, col: 4, value_type: "STRING", string_value: urls.join("\n") });
  r++;
}

console.log(`writing ${questions.length} rows · ${totalUrls} reference urls`);
for (let i = 0; i < cells.length; i += 400) mcp("sheet.set_range_value", { file_id: FID, sheet_id: SID, values: cells.slice(i, i + 400) });
let ln = 0;
for (const l of links) {
  try { mcp("sheet.set_link", { file_id: FID, sheet_id: SID, row: l.row, col: l.col, url: l.url, display_text: l.display_text }); ln++; }
  catch (e) { console.error(`  link row ${l.row} failed: ${e.message}`); }
}
try { mcp("sheet.set_cell_style", { file_id: FID, sheet_id: SID, start_row: 0, end_row: 0, start_col: 0, end_col: 4, bold: true, bg_color: "#E8F0FE" }); } catch (e) {}
try { mcp("sheet.set_freeze", { file_id: FID, sheet_id: SID, row_count: 1, col_count: 0 }); } catch (e) {}
mcp("manage.set_privilege", { file_id: FID, policy: 3 });
console.log(`DONE · D links ${ln}/${links.length} · ${created.url}`);
