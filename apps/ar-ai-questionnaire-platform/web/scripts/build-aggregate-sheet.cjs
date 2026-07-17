/**
 * Populate the aggregate Tencent Sheet from the questionnaire xlsx:
 *  A/B/C = 序号 / 评估问题 / 问题说明与填写指引 (faithful to the xlsx, incl. title/定义/章节行)
 *  D     = 对应回答的腾讯文档链接 (from ai-infra-doc-map.json)
 *  E     = 对应 provenance 的 URL (platform /provenance/<urlId>.json) — links only
 * Run: node web/scripts/build-aggregate-sheet.cjs
 */
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const XLSX = require("xlsx");

const FID = process.argv[2] || "AWonFFpPISxT";
const SID = process.argv[3] || "BB08J2";
const PROV_BASE = "https://ai.ar-tencent.cloud";
const XLSXP = path.resolve(__dirname, "../../.context/attachments/NpAsFp/2026年AI Infra市场报告问卷_20260528.xlsx");
const docMap = require(path.resolve(__dirname, "../src/data/ai-infra-doc-map.json"));

function mcp(tool, args) {
  const o = execFileSync("mcporter", ["call", "tencent-docs", tool, "--args", JSON.stringify(args)], {
    encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
  });
  const s = o.indexOf("{"), e = o.lastIndexOf("}");
  if (s < 0) throw new Error(`${tool}: ${o.slice(0, 200)}`);
  const j = JSON.parse(o.slice(s, e + 1));
  if (j.error) throw new Error(`${tool}: ${j.error}`);
  return j;
}

const wb = XLSX.read(fs.readFileSync(XLSXP));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
const isQ = (s) => /^\d+\.\d+(\.\d+)?$/.test(String(s).trim());

const cells = [];
const links = [];
const sectionRows = [];
rows.forEach((r, ri) => {
  for (let c = 0; c < 3; c++) {
    const v = String(r[c] ?? "").replace(/\s+/g, " ").trim();
    if (v) cells.push({ row: ri, col: c, value_type: "STRING", string_value: v });
  }
  const a = String(r[0] ?? "").trim();
  if (ri === 2) {
    cells.push({ row: ri, col: 3, value_type: "STRING", string_value: "作答文档（腾讯文档）" });
    cells.push({ row: ri, col: 4, value_type: "STRING", string_value: "Provenance（证据 JSON）" });
  } else if (isQ(a) && docMap[a]) {
    const url = docMap[a].url;
    const urlId = url.split("/").pop();
    const prov = `${PROV_BASE}/provenance/${urlId}.json`;
    links.push({ row: ri, col: 3, url, display_text: url });
    links.push({ row: ri, col: 4, url: prov, display_text: prov });
  }
  // dimension/section header rows: col0 text, col1 empty, below the header row
  if (a && !isQ(a) && ri > 2 && !String(r[1] ?? "").trim()) sectionRows.push(ri);
});

console.log(`cells=${cells.length} links=${links.length} sectionRows=${sectionRows.length}`);

for (let i = 0; i < cells.length; i += 400) {
  mcp("sheet.set_range_value", { file_id: FID, sheet_id: SID, values: cells.slice(i, i + 400) });
}
console.log("values written");

let ln = 0;
for (const l of links) {
  try { mcp("sheet.set_link", { file_id: FID, sheet_id: SID, row: l.row, col: l.col, url: l.url, display_text: l.display_text }); ln++; }
  catch (e) { console.error(`  link ${l.row},${l.col} failed: ${e.message}`); }
}
console.log(`links set: ${ln}/${links.length}`);

// styling (best-effort)
const style = (sr, er, bold, bg) => {
  try { mcp("sheet.set_cell_style", { file_id: FID, sheet_id: SID, start_row: sr, end_row: er, start_col: 0, end_col: 4, bold, ...(bg ? { bg_color: bg } : {}) }); }
  catch (e) { console.error(`  style ${sr} failed: ${e.message}`); }
};
style(0, 0, true);            // title
style(2, 2, true, "#E8F0FE"); // header
for (const sr of sectionRows) style(sr, sr, true, "#F2F2F2");
try { mcp("sheet.set_freeze", { file_id: FID, sheet_id: SID, row_count: 3, col_count: 0 }); } catch (e) { console.error(`freeze: ${e.message}`); }
mcp("manage.set_privilege", { file_id: FID, policy: 3 });

console.log("DONE · https://docs.qq.com/sheet/DQVdvbkZGcFBJU3hU");
