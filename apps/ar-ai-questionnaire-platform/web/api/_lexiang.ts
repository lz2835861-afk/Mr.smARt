import type { AiRequest, AiSource, AiSourceTier, KnowledgeResponse } from "../src/lib/aiTypes";

const LEXIANG_MCP_URL = "https://mcp.lexiang-app.com/mcp?company_from=csig";
const LEXIANG_COMPANY_DOMAIN = "https://csig.lexiangla.com";

/** 第一优先：云知知识库。 */
const YUNZHI_SPACE_ID = "1ce4ef8c0c9441d4bc5f2117fa538fff";
/** 第二优先：市场营销知识库（其中收录“腾讯云市场精选”公众号/视频号内容）。 */
const MARKET_SPACE_ID = "6125f7d975984835a87363d8963c8c34";
const MARKET_MARKER = "腾讯云市场精选";

interface LexiangDoc {
  target_type?: string;
  target_id?: string;
  title?: string;
  original_title?: string;
  content?: string;
  space_id?: string;
  team_id?: string;
}

interface LexiangSearchPayload {
  code?: number;
  message?: string;
  data?: { docs?: LexiangDoc[] };
}

interface McpContentItem {
  type?: string;
  text?: string;
}

interface McpToolResult {
  content?: McpContentItem[];
  structuredContent?: unknown;
  isError?: boolean;
}

interface JsonRpcResponse {
  id?: number;
  result?: McpToolResult | Record<string, unknown>;
  error?: { code?: number; message?: string };
}

function stripHighlight(value: string): string {
  return value
    .replace(/<\/?em>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function docUrl(doc: LexiangDoc): string {
  const id = doc.target_id ?? "";
  if (!id) return LEXIANG_COMPANY_DOMAIN;
  if (doc.target_type === "kb_file" || doc.target_type === "kb_video") {
    return `${LEXIANG_COMPANY_DOMAIN}/teams/${doc.team_id ?? ""}/docs/${id}`;
  }
  return `${LEXIANG_COMPANY_DOMAIN}/pages/${id}`;
}

function toSource(doc: LexiangDoc, tier: AiSourceTier): AiSource | null {
  if (!doc.target_id) return null;
  const title = stripHighlight(doc.original_title || doc.title || "乐享知识");
  const snippet = stripHighlight(doc.content || "").slice(0, 900);
  return {
    title,
    url: docUrl(doc),
    snippet,
    tier,
    source: tier === "yunzhi" ? "云知知识库" : "腾讯云市场精选",
  };
}

function parseJsonRpcBody(text: string): JsonRpcResponse {
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("{")) return JSON.parse(trimmed) as JsonRpcResponse;

  // Streamable HTTP may reply as text/event-stream. Parse each `data:` line and
  // return the first JSON-RPC response carrying a result/error.
  for (const line of trimmed.split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") continue;
    try {
      const message = JSON.parse(data) as JsonRpcResponse;
      if (message.result || message.error) return message;
    } catch {
      // Ignore heartbeat/non-JSON SSE lines.
    }
  }
  throw new Error("乐享 MCP 返回了无法解析的响应");
}

/** Minimal Streamable HTTP MCP client, avoiding browser-side dependencies. */
class LexiangMcpClient {
  private sessionId = "";
  private nextId = 1;
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(this.sessionId ? { "Mcp-Session-Id": this.sessionId } : {}),
    };
  }

  private async post(payload: Record<string, unknown>, timeoutMs = 20_000): Promise<JsonRpcResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(LEXIANG_MCP_URL, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const session = response.headers.get("mcp-session-id");
      if (session) this.sessionId = session;
      const text = await response.text();
      if (!response.ok) {
        const auth = response.status === 401 ? "（Token 无效或已过期）" : "";
        throw new Error(`乐享 MCP HTTP ${response.status}${auth}: ${text.slice(0, 240)}`);
      }
      return parseJsonRpcBody(text);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw new Error("乐享 MCP 请求超时", { cause: error });
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async connect(): Promise<void> {
    const id = this.nextId++;
    const response = await this.post({
      jsonrpc: "2.0",
      id,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "mr-smart-questionnaire", version: "1.0.0" },
      },
    });
    if (response.error) throw new Error(response.error.message || "乐享 MCP 初始化失败");
    await this.post({ jsonrpc: "2.0", method: "notifications/initialized" }, 8_000);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    const id = this.nextId++;
    const response = await this.post({
      jsonrpc: "2.0",
      id,
      method: "tools/call",
      params: { name, arguments: args },
    });
    if (response.error) throw new Error(response.error.message || "乐享工具调用失败");
    return (response.result ?? {}) as McpToolResult;
  }

  async close(): Promise<void> {
    if (!this.sessionId) return;
    await fetch(LEXIANG_MCP_URL, {
      method: "DELETE",
      headers: this.headers(),
    }).catch(() => {});
  }
}

function parseToolPayload(result: McpToolResult): LexiangSearchPayload {
  if (result.structuredContent && typeof result.structuredContent === "object") {
    return result.structuredContent as LexiangSearchPayload;
  }
  const text = (result.content ?? [])
    .filter((item) => item.type === "text" && item.text)
    .map((item) => item.text)
    .join("\n")
    .trim();
  if (!text) return {};
  try {
    return JSON.parse(text) as LexiangSearchPayload;
  } catch {
    throw new Error("乐享返回了无法解析的搜索结果");
  }
}

async function callSearch(
  client: LexiangMcpClient,
  query: string,
  spaceId: string,
  limit: number,
): Promise<LexiangDoc[]> {
  const result = await client.callTool("search_kb_search", {
    keyword: query,
    type: "doc",
    space_id: spaceId,
    limit,
    highlight: true,
    include_references: false,
  });
  if (result.isError) throw new Error("乐享知识库搜索失败");
  const payload = parseToolPayload(result);
  if (payload.code != null && payload.code !== 0) {
    throw new Error(payload.message || `乐享搜索错误 code=${payload.code}`);
  }
  return payload.data?.docs ?? [];
}

function isTencentCloudMarketDoc(doc: LexiangDoc): boolean {
  if (doc.space_id !== MARKET_SPACE_ID) return false;
  const text = `${doc.title ?? ""}\n${doc.original_title ?? ""}\n${doc.content ?? ""}`;
  // 严格限定为带“腾讯云市场精选”频道标记的内容，避免把市场营销知识库
  // 里其他团队/其他渠道的材料误标成“腾讯云市场公众号”。
  return text.includes(MARKET_MARKER);
}

function dedupeSources(sources: AiSource[]): AiSource[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

/** 搜索顺序：云知知识库 →（云知结果不足时）腾讯云市场精选。 */
export async function searchLexiangKnowledge(
  query: string,
  token: string | undefined,
): Promise<KnowledgeResponse> {
  const cleanQuery = stripHighlight(query).slice(0, 240);
  if (!cleanQuery) {
    return { sources: [], status: "skipped", usedFallback: false, primaryCount: 0, fallbackCount: 0 };
  }
  if (!token) {
    return {
      sources: [],
      status: "not-configured",
      usedFallback: false,
      primaryCount: 0,
      fallbackCount: 0,
      warning: "LEXIANG_TOKEN 未配置，已跳过乐享检索",
    };
  }

  const client = new LexiangMcpClient(token);
  try {
    await client.connect();
    const primaryDocs = await callSearch(client, cleanQuery, YUNZHI_SPACE_ID, 6);
    const primarySources = primaryDocs
      .map((doc) => toSource(doc, "yunzhi"))
      .filter((source): source is AiSource => Boolean(source));

    // 两条以上云知结果即可满足“云知优先”；只有 0–1 条时再补腾讯云市场精选。
    let fallbackSources: AiSource[] = [];
    if (primarySources.length < 2) {
      let fallbackDocs = await callSearch(client, cleanQuery, MARKET_SPACE_ID, 12);
      let marketDocs = fallbackDocs.filter(isTencentCloudMarketDoc);
      if (!marketDocs.length) {
        // 普通关键词结果的摘要可能未包含频道落款，再补一次带频道名的查询；
        // 最终仍通过 exact marker 过滤，不把其他市场材料混进来。
        fallbackDocs = await callSearch(
          client,
          `${MARKET_MARKER} ${cleanQuery}`.slice(0, 240),
          MARKET_SPACE_ID,
          12,
        );
        marketDocs = fallbackDocs.filter(isTencentCloudMarketDoc);
      }
      fallbackSources = marketDocs
        .map((doc) => toSource(doc, "tencent-cloud-market"))
        .filter((source): source is AiSource => Boolean(source));
    }

    const sources = dedupeSources([...primarySources, ...fallbackSources]).slice(0, 6);
    return {
      sources,
      status: "ok",
      usedFallback: fallbackSources.length > 0,
      primaryCount: primarySources.length,
      fallbackCount: fallbackSources.length,
    };
  } finally {
    await client.close();
  }
}

export function buildLexiangQuery(request: AiRequest): string {
  return [request.questionTitle, request.fieldLabel, request.instruction]
    .filter((value): value is string => Boolean(value?.trim()))
    .join("；")
    .slice(0, 240);
}

export function buildLexiangContext(sources: AiSource[]): string {
  if (!sources.length) return "";
  const items = sources.map((source, index) =>
    [
      `[L${index + 1}] ${source.source}｜${source.title}`,
      `链接：${source.url}`,
      source.snippet ? `内容摘录：${source.snippet}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `【腾讯乐享检索证据】\n检索优先级：云知知识库 > 腾讯云市场精选。请只把以下内容作为可引用事实，不要根据标题补全未出现的信息。\n\n${items.join("\n\n")}`;
}
