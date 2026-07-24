/**
 * Vercel serverless function: POST /api/extract → 本地文件解析（不出境）。
 * See api/_extract.ts for the actual work.
 *
 * NOTE: `.js` extension on the import is required — the project is
 * `"type": "module"`, so Vercel runs this as native ESM where Node's loader
 * does not resolve extensionless relative imports.
 */
import { handleExtract } from "./_extract.js";
import type { ExtractRequest } from "../src/lib/aiTypes";

interface Req {
  method?: string;
  body?: unknown;
}
interface Res {
  status: (code: number) => Res;
  json: (data: unknown) => void;
}

/** 放开请求体大小上限（大文件 base64 会膨胀，默认 4.5MB 太小）。 */
export const config = {
  api: {
    bodyParser: { sizeLimit: "50mb" },
  },
};

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as ExtractRequest;
    const out = await handleExtract(body);
    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
