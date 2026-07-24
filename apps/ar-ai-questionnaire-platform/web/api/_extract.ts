/**
 * Framework-agnostic LOCAL file-extraction handler. Shared by the Vercel
 * function (api/extract.ts) and the Vite dev middleware (vite.config.ts).
 *
 * 合规改造（2026-07）：原实现把文件上传到境外 Kimi/Moonshot 的 Files API 抽取文本，
 * 会导致上传内容出境。现改为【本地解析】，文件字节不出境：
 *   - xlsx/xls/csv → 用 xlsx 库读成表格文本（项目已内置 xlsx 依赖）
 *   - docx        → 用 mammoth 抽取纯文本（可选依赖，未装时降级为 zip+正则兜底）
 *   - pdf         → 用 pdf-parse 抽取文本（可选依赖）
 *   - txt/md/csv  → 直接按 UTF-8 解码
 * 解析后的文本作为 material 喂给（境内）混元。不再有任何文件外发。
 *
 * mammoth / pdf-parse 用动态可选导入：生产环境正常 install 后即启用；
 * 若运行环境暂缺该依赖，docx 会走零依赖兜底、pdf 给出清晰提示，而不会整体崩溃。
 *
 * 文件大小：不再做前端 3MB 硬限制；服务端也不主动截断（MAX_CHARS=0 表示不截断）。
 */
/// <reference path="./optional-deps.d.ts" />
import type { ExtractRequest, ExtractResponse } from "../src/lib/aiTypes";

/** 文本长度上限。0 或负数 = 不截断（保留全文）。 */
const MAX_CHARS = 0;

function extFromName(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** xlsx / xls / csv → 把每个 sheet 转成带表头的文本。 */
async function extractSpreadsheet(buf: Buffer): Promise<string> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buf, { type: "buffer" });
  const parts: string[] = [];
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const csv = XLSX.utils.sheet_to_csv(ws, { blankrows: false });
    if (csv.trim()) parts.push(`# 工作表：${sheetName}\n${csv}`);
  }
  return parts.join("\n\n");
}

/** docx → 纯文本。优先 mammoth；缺依赖时用 zip+正则兜底。 */
async function extractDocx(buf: Buffer): Promise<string> {
  try {
    const mammothMod = await import("mammoth");
    const mammoth = (mammothMod as { default?: unknown }).default ?? mammothMod;
    const result = await (
      mammoth as { extractRawText: (o: { buffer: Buffer }) => Promise<{ value: string }> }
    ).extractRawText({ buffer: buf });
    const v = (result?.value ?? "").trim();
    if (v) return v;
  } catch {
    // 未装 mammoth 或解析异常 → 走兜底
  }
  return extractDocxFallback(buf);
}

/**
 * 零依赖 docx 兜底：docx 是 zip 包，正文在 word/document.xml。
 * 用 Node 内置能力解出该条目并抽取 <w:t> 文本。仅做粗提取，够用作 material。
 */
async function extractDocxFallback(buf: Buffer): Promise<string> {
  const { inflateRawSync } = await import("node:zlib");
  // 遍历 zip 本地文件头，找到 word/document.xml 的 deflate 数据。
  let xml = "";
  let i = 0;
  while (i + 30 <= buf.length) {
    if (buf.readUInt32LE(i) !== 0x04034b50) break; // 只扫描连续的本地文件头
    const method = buf.readUInt16LE(i + 8);
    const compSize = buf.readUInt32LE(i + 18);
    const nameLen = buf.readUInt16LE(i + 26);
    const extraLen = buf.readUInt16LE(i + 28);
    const nameStart = i + 30;
    const name = buf.toString("utf8", nameStart, nameStart + nameLen);
    const dataStart = nameStart + nameLen + extraLen;
    const data = buf.subarray(dataStart, dataStart + compSize);
    if (name === "word/document.xml") {
      const raw = method === 8 ? inflateRawSync(data) : data;
      xml = raw.toString("utf8");
      break;
    }
    i = dataStart + compSize;
  }
  if (!xml) return "";
  // 段落用换行分隔，抽取所有 <w:t>…</w:t>
  const paras = xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, (m) => (/<w:t[ >]/.test(m) ? "" : m.startsWith("<w:t") ? "" : ""))
    .replace(/<[^>]+>/g, "");
  return paras.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

/** pdf → 纯文本（需 pdf-parse 可选依赖）。 */
async function extractPdf(buf: Buffer): Promise<string> {
  try {
    const mod = await import("pdf-parse");
    const pdfParse = ((mod as { default?: unknown }).default ?? mod) as (
      b: Buffer,
    ) => Promise<{ text: string }>;
    const data = await pdfParse(buf);
    return (data?.text ?? "").trim();
  } catch (e) {
    throw new Error(
      `PDF 解析组件不可用（${(e as Error).message}）。请确认已安装 pdf-parse，或先转成 .docx / .txt 再上传`,
    );
  }
}

export async function handleExtract(
  body: ExtractRequest,
  _apiKey?: string | undefined, // 不再需要，本地解析。保留形参以兼容旧调用签名。
): Promise<ExtractResponse> {
  if (!body?.dataBase64) throw new Error("缺少文件内容");

  const filename = body.filename || "upload";
  const buf = Buffer.from(body.dataBase64, "base64");
  if (buf.byteLength === 0) throw new Error("文件为空");

  const ext = extFromName(filename);
  const ct = (body.contentType || "").toLowerCase();

  let full = "";
  try {
    if (ext === "xlsx" || ext === "xls" || ext === "csv" || ct.includes("spreadsheet") || ct.includes("excel")) {
      full = await extractSpreadsheet(buf);
    } else if (ext === "docx" || ct.includes("wordprocessingml")) {
      full = await extractDocx(buf);
    } else if (ext === "pdf" || ct.includes("pdf")) {
      full = await extractPdf(buf);
    } else if (ext === "txt" || ext === "md" || ext === "markdown" || ct.startsWith("text/")) {
      full = buf.toString("utf8");
    } else if (ext === "doc" || ext === "ppt" || ext === "pptx") {
      throw new Error(`暂不支持在境内本地解析 .${ext} 格式，请另存为 .docx / .pdf / .xlsx 后重试`);
    } else {
      full = buf.toString("utf8"); // 兜底：当作文本解码
    }
  } catch (e) {
    throw new Error(`文件解析失败：${(e as Error).message}`);
  }

  full = full.trim();
  if (!full) throw new Error("未能从文件中解析出文本（可能是扫描版 PDF 或空文件）");

  const truncated = MAX_CHARS > 0 && full.length > MAX_CHARS;
  const text = truncated
    ? full.slice(0, MAX_CHARS) + "\n\n…（文档较长，已截取前部分作为材料）"
    : full;
  return { text, filename, truncated };
}
