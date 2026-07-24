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
import {
  buildLexiangContext,
  buildLexiangQuery,
  searchLexiangKnowledge,
} from "./_lexiang.js";
import { requireAccess } from "./_access.js";
import type { AiRequest, KnowledgeResponse } from "../src/lib/aiTypes";

interface Req {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | undefined>;
}
interface Res {
  status: (code: number) => Res;
  json: (data: unknown) => void;
}

export default async function handler(req: Req, res: Res): Promise<void> {
  if (!requireAccess(req, res)) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as AiRequest;
    const shouldRetrieve = body.mode === "ask" || body.mode === "draft" || body.mode === "custom";
    let knowledge: KnowledgeResponse = {
      sources: [],
      status: "skipped",
      usedFallback: false,
      primaryCount: 0,
      fallbackCount: 0,
    };

    if (shouldRetrieve) {
      try {
        knowledge = await searchLexiangKnowledge(
          buildLexiangQuery(body),
          process.env.LEXIANG_TOKEN,
        );
      } catch (error) {
        // 乐享暂时不可用不应阻断 Kimi；把状态返回给前端，答案仍可基于用户材料生成。
        knowledge = {
          sources: [],
          status: "error",
          usedFallback: false,
          primaryCount: 0,
          fallbackCount: 0,
          warning: (error as Error).message,
        };
      }
    }

    const lexiangContext = buildLexiangContext(knowledge.sources);
    const enrichedBody: AiRequest = lexiangContext
      ? {
          ...body,
          material: [body.material, lexiangContext].filter(Boolean).join("\n\n"),
        }
      : body;
    // 双轨：配了 HUNYUAN_API_KEY 走境内混元，否则回退 Kimi。切换无需改代码。
    const useHunyuan = !!process.env.HUNYUAN_API_KEY;
    const apiKey = process.env.HUNYUAN_API_KEY || process.env.KIMI_API_KEY;
    const aiModel = useHunyuan ? process.env.HUNYUAN_MODEL : process.env.KIMI_MODEL;
    const out = await handleAi(enrichedBody, apiKey, aiModel, useHunyuan ? "hunyuan" : "kimi");
    const { sources, ...knowledgeMeta } = knowledge;
    res.status(200).json({ ...out, sources, knowledge: knowledgeMeta });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
