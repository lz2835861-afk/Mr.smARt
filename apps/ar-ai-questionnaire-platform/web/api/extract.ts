/**
 * Vercel serverless function: POST /api/extract → Moonshot file extraction.
 * Keeps KIMI_API_KEY server-side. See api/_extract.ts for the actual work.
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

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as ExtractRequest;
    const out = await handleExtract(body, process.env.KIMI_API_KEY);
    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
