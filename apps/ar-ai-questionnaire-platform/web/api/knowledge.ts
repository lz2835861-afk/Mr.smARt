import { searchLexiangKnowledge } from "./_lexiang.js";
import { requireAccess } from "./_access.js";

interface Req {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | undefined>;
}
interface Res {
  status: (code: number) => Res;
  json: (data: unknown) => void;
}

/**
 * Vercel serverless function: POST /api/knowledge { query }
 * Token is read only from LEXIANG_TOKEN on the server.
 */
export default async function handler(req: Req, res: Res): Promise<void> {
  if (!requireAccess(req, res)) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
      query?: string;
    };
    const query = body?.query?.trim() ?? "";
    if (!query) {
      res.status(400).json({ error: "缺少 query" });
      return;
    }
    const out = await searchLexiangKnowledge(query, process.env.LEXIANG_TOKEN);
    res.status(out.status === "not-configured" ? 503 : 200).json(out);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
