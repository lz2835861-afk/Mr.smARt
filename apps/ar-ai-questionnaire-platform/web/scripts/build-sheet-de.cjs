/**
 * Fill columns D and E of the aggregate Tencent Sheet (tab passed as argv, default zt2pbl):
 *   D = 对应回答的腾讯文档链接 (hyperlink, from ai-infra-doc-map.json)
 *   E = 该题 provenance 引用的所有来源 URL，逐条列出 (newline-joined text)
 * Row mapping comes from the questionnaire xlsx (the imported tab mirrors it 1:1).
 * Run: node web/scripts/build-sheet-de.cjs <file_id> <sheet_id>
 */
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const XLSX = require("xlsx");

const FID = process.argv[2] || "AWonFFpPISxT";
const SID = process.argv[3] || "zt2pbl";
const XLSXP = path.resolve(__dirname, "../../.context/attachments/NpAsFp/2026年AI Infra市场报告问卷_20260528.xlsx");
const docMap = require(path.resolve(__dirname, "../src/data/ai-infra-doc-map.json"));
const grounding = require(path.resolve(__dirname, "../src/data/ai-infra-grounding.json"));

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

const rows = XLSX.utils.sheet_to_json(XLSX.read(fs.readFileSync(XLSXP)).Sheets[XLSX.read(fs.readFileSync(XLSXP)).SheetNames[0]], { header: 1, defval: "" });
const isQ = (s) => /^\d+\.\d+(\.\d+)?$/.test(String(s).trim());

// header relabels + E source-url lists
const cells = [
  { row: 2, col: 3, value_type: "STRING", string_value: "作答文档（腾讯文档）" },
  { row: 2, col: 4, value_type: "STRING", string_value: "Provenance 来源链接（全部）" },
];
const links = [];
let totalUrls = 0;
rows.forEach((r, ri) => {
  const id = String(r[0] ?? "").trim();
  if (!isQ(id) || !docMap[id]) return;
  links.push({ row: ri, col: 3, url: docMap[id].url, display_text: docMap[id].url });
  const urls = [...new Set((grounding[id]?.provenance?.sources || []).map((s) => s.url).filter(Boolean))];
  totalUrls += urls.length;
  cells.push({ row: ri, col: 4, value_type: "STRING", string_value: urls.join("\n") });
});

console.log(`questions=${links.length} · E source-urls total=${totalUrls} · writing to ${FID}/${SID}`);
mcp("sheet.set_range_value", { file_id: FID, sheet_id: SID, values: cells });
console.log("E + headers written");

let ln = 0;
for (const l of links) {
  try { mcp("sheet.set_link", { file_id: FID, sheet_id: SID, row: l.row, col: l.col, url: l.url, display_text: l.display_text }); ln++; }
  catch (e) { console.error(`  D link row ${l.row} failed: ${e.message}`); }
}
console.log(`D links set: ${ln}/${links.length}`);
mcp("manage.set_privilege", { file_id: FID, policy: 3 });
console.log("DONE");
