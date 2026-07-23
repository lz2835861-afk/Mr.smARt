import path from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { handleAi } from "./api/_kimi";
import { handleExtract } from "./api/_extract";
import {
  buildLexiangContext,
  buildLexiangQuery,
  searchLexiangKnowledge,
} from "./api/_lexiang";
import type { AiRequest, ExtractRequest, KnowledgeResponse } from "./src/lib/aiTypes";

/**
 * Dev-only mirror of the Vercel /api/ai function. Reads KIMI_API_KEY from the
 * node-side env (NOT exposed to the client bundle) so the AI assistant works
 * under `vite dev` exactly like in production.
 */
function aiDevProxy(apiKey?: string, model?: string, lexiangToken?: string): Plugin {
  return {
    name: "ai-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/api/ai", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let raw = "";
        req.on("data", (c) => (raw += c));
        req.on("end", async () => {
          try {
            const body = JSON.parse(raw || "{}") as AiRequest;
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
                knowledge = await searchLexiangKnowledge(buildLexiangQuery(body), lexiangToken);
              } catch (error) {
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
            const context = buildLexiangContext(knowledge.sources);
            const enrichedBody = context
              ? { ...body, material: [body.material, context].filter(Boolean).join("\n\n") }
              : body;
            const out = await handleAi(enrichedBody, apiKey, model);
            const { sources, ...knowledgeMeta } = knowledge;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ ...out, sources, knowledge: knowledgeMeta }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ error: (e as Error).message }));
          }
        });
      });

      server.middlewares.use("/api/knowledge", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let raw = "";
        req.on("data", (c) => (raw += c));
        req.on("end", async () => {
          try {
            const body = JSON.parse(raw || "{}") as { query?: string };
            const query = body.query?.trim() ?? "";
            if (!query) throw new Error("缺少 query");
            const out = await searchLexiangKnowledge(query, lexiangToken);
            res.statusCode = out.status === "not-configured" ? 503 : 200;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify(out));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ error: (e as Error).message }));
          }
        });
      });

      server.middlewares.use("/api/extract", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let raw = "";
        req.on("data", (c) => (raw += c));
        req.on("end", async () => {
          try {
            const body = JSON.parse(raw || "{}") as ExtractRequest;
            const out = await handleExtract(body, apiKey);
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify(out));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ error: (e as Error).message }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    resolve: {
      alias: {
        // Local stand-in for the license-gated @heroui-pro/react package.
        // The /css entry MUST come first — @rollup/plugin-alias picks the first
        // matching prefix, and the bare-package alias would otherwise swallow it.
        "@heroui-pro/react/css": path.resolve(
          __dirname,
          "./src/shims/heroui-pro/css.css",
        ),
        "@heroui-pro/react": path.resolve(
          __dirname,
          "./src/shims/heroui-pro/index.tsx",
        ),
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      aiDevProxy(env.KIMI_API_KEY, env.KIMI_MODEL, env.LEXIANG_TOKEN),
    ],
    server: { port: 5173, host: true },
  };
});
