/**
 * Framework-agnostic Moonshot (Kimi) file-extraction handler. Shared by the
 * Vercel function (api/extract.ts) and the Vite dev middleware (vite.config.ts).
 *
 * Moonshot has no "send a file inside messages" API; instead you upload the file
 * (purpose=file-extract), read back its extracted plain text, then feed that text
 * into the chat as material. The API key stays server-side. We delete the
 * uploaded file afterwards — we only need the text.
 */
import type { ExtractRequest, ExtractResponse } from "../src/lib/aiTypes";

// Use the international endpoint with a platform.moonshot.ai API key.
const BASE = "https://api.moonshot.ai/v1";

/** Char cap so the extracted text fits a small chat context (moonshot-v1-8k). */
const MAX_CHARS = 6000;

interface MoonshotFile {
  id?: string;
  error?: { message?: string };
}
interface MoonshotContent {
  content?: string;
  error?: { message?: string };
}

export async function handleExtract(
  body: ExtractRequest,
  apiKey: string | undefined,
): Promise<ExtractResponse> {
  if (!apiKey) throw new Error("KIMI_API_KEY 未配置（服务端）");
  if (!body?.dataBase64) throw new Error("缺少文件内容");

  const filename = body.filename || "upload";
  const buf = Buffer.from(body.dataBase64, "base64");
  if (buf.byteLength === 0) throw new Error("文件为空");

  // 1) upload (purpose=file-extract)
  const fd = new FormData();
  fd.append("purpose", "file-extract");
  fd.append(
    "file",
    new Blob([buf], { type: body.contentType || "application/octet-stream" }),
    filename,
  );
  const up = await fetch(`${BASE}/files`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}` },
    body: fd,
  });
  const upJson = (await up.json().catch(() => ({}))) as MoonshotFile;
  if (!up.ok || !upJson.id) {
    throw new Error(upJson.error?.message || `文件上传失败 HTTP ${up.status}`);
  }
  const fileId = upJson.id;

  try {
    // 2) read extracted plain text
    const cr = await fetch(`${BASE}/files/${fileId}/content`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const crJson = (await cr.json().catch(() => ({}))) as MoonshotContent;
    if (!cr.ok) {
      throw new Error(crJson.error?.message || `文件解析失败 HTTP ${cr.status}`);
    }
    const full = (crJson.content ?? "").trim();
    if (!full) throw new Error("未能从文件中解析出文本");

    const truncated = full.length > MAX_CHARS;
    const text = truncated
      ? full.slice(0, MAX_CHARS) + "\n\n…（文档较长，已截取前部分作为材料）"
      : full;
    return { text, filename, truncated };
  } finally {
    // best-effort cleanup — we only needed the extracted text
    void fetch(`${BASE}/files/${fileId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${apiKey}` },
    }).catch(() => {});
  }
}
