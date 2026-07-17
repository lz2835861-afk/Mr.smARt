/**
 * Vercel serverless function: POST /api/ai → Kimi (Moonshot) proxy.
 * Keeps KIMI_API_KEY server-side. See api/_kimi.ts for the actual call.
 */
// NOTE: explicit `.js` extension is required. This project is `"type":
// "module"`, so Vercel compiles the function to native ESM where Node's loader
// does NOT resolve extensionless relative imports — without it the function
// crashes at load with ERR_MODULE_NOT_FOUND (the dev server is unaffected; it
// imports _kimi through Vite, not this file).
import { handleAi } from "./_kimi.js";
import type { AiRequest } from "../src/lib/aiTypes";

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
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as AiRequest;
    const out = await handleAi(body, process.env.KIMI_API_KEY, process.env.KIMI_MODEL);
    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
