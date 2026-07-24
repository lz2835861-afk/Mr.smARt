/**
 * Framework-agnostic Kimi (Moonshot) chat handler. Shared by the Vercel
 * function (api/ai.ts) and the Vite dev middleware (vite.config.ts).
 *
 * The API key is read from the SERVER environment (KIMI_API_KEY) and never
 * leaves the server. The client only ever talks to /api/ai.
 *
 * Moonshot is OpenAI-compatible: POST {base}/chat/completions.
 */
import type { AiRequest, AiResponse } from "../src/lib/aiTypes";

/**
 * 双 provider（2026-07 合规改造）：
 *   - "kimi"    → 境外 Kimi/Moonshot 国际站（Vercel 连不上 .cn，用 .ai）。过渡期默认。
 *   - "hunyuan" → 境内 腾讯混元（api.hunyuan.cloud.tencent.com），迁内网合规态。
 * 由 api/ai.ts 依据配置了哪个环境变量自动决定，切换无需改代码。
 * 两家都是 OpenAI 兼容接口：POST {base}/chat/completions。
 */
export type AiProvider = "kimi" | "hunyuan";

interface ProviderConfig {
  base: string;
  defaultModel: string;
  fallbackModels: string[];
  tempFor: (m: string) => number;
  extraBody?: Record<string, unknown>;
  label: string;
}

const PROVIDERS: Record<AiProvider, ProviderConfig> = {
  kimi: {
    base: "https://api.moonshot.ai/v1",
    defaultModel: "kimi-k2.6",
    fallbackModels: ["kimi-k2.6"],
    tempFor: (m) => (/^kimi-k2/.test(m) ? 1 : 0.3),
    label: "Kimi",
  },
  hunyuan: {
    base: "https://api.hunyuan.cloud.tencent.com/v1",
    defaultModel: "hunyuan-turbos-latest",
    fallbackModels: ["hunyuan-turbos-latest", "hunyuan-standard", "hunyuan-lite"],
    tempFor: () => 0.3,
    extraBody: { enable_enhancement: true },
    label: "混元",
  },
};

const RETRIES_PER_MODEL = 2;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const EXPANSION_RE = /更详细|扩写|展开|丰富|补充细节|写长|增加细节/i;
const compactText = (value: string) =>
  value.replace(/\s+/g, "").replace(/[，。；：、,.!?！？()[\]【】]/g, "");

const SYSTEM = `你是腾讯云分析师关系（AR）团队的中文写作助手，帮助产品同学把事实要点写成分析师（Gartner/Forrester/IDC/Omdia）认可的问卷答案。
原则：
- 只用给定的事实，不要编造数字、客户名、认证。缺事实时用方括号占位，如 [X 个可用区]，并提示需补充。
- 语气克制、可验证，避免营销话术（如"业界领先""一键"），用具体能力和证据说话。
- 保持腾讯云第一人称视角。
- 如果【参考资料】中出现【腾讯乐享检索证据】，优先使用这些证据；只采用摘录中明确出现的事实，在相关句末标注对应的 [L1]、[L2]，不要自行补全标题里未写明的信息。
- 除非要求翻译，否则用中文输出。直接给正文，不要前后多余的解释。
- 信心闸门（重要）：你的回答必须建立在【给定的事实/资料/草稿】之上。只要命中以下任一情况，就在正文之后【另起一行】只输出标记 [[need-reference]]（必须原样照抄：半角方括号、全小写、英文，不要翻译、不要改成中文括号【】；这一行只放这个标记，不要别的字）：
  · 问题涉及战略、愿景、roadmap、未来规划/预测、对外承诺、投资计划等需要权威或内部信源才能可靠回答的内容；
  · 需要具体数字、日期、金额、客户名称、案例、认证清单、份额/排名等，而给定资料里并没有明确给出；
  · 你主要依靠通用知识/训练记忆作答，而不是给定资料；
  · 你对答案的准确性或时效性没有十足把握。
  原则是「宁可多标，不要漏标」——只要稍有不确定，就输出 [[need-reference]]。只有当答案完全由给定资料直接支撑、且你非常有把握时，才不输出它。你仍然可以先给出力所能及的简要回答，但该标记必须照常输出。`;

function buildUserPrompt(r: AiRequest): string {
  const ctx: string[] = [];
  if (r.questionTitle) ctx.push(`题目：${r.questionTitle}`);
  if (r.fieldLabel) ctx.push(`字段：${r.fieldLabel}`);
  if (r.wordLimit) ctx.push(`字数上限：约 ${r.wordLimit} 字/词`);
  const header = ctx.length ? ctx.join("\n") + "\n\n" : "";

  const selectionBlock = r.selection
    ? `\n\n【用户选中的段落（请优先处理这段）】\n${r.selection}`
    : "";
  const expansionRule = EXPANSION_RE.test(r.instruction ?? "")
    ? `\n\n【扩写要求】必须产出比原文更具体、结构更完整且有实质变化的版本，不得原样返回。只能展开给定事实的含义、范围和组织方式，不得新增材料中没有的数字、客户、产品能力或承诺；若事实不足以支持用户期待的细节，仍先完成安全范围内的扩写，并按信心闸门输出 [[need-reference]]。`
    : "";

  switch (r.mode) {
    case "polish":
      if (r.selection) {
        return `${header}用户在中栏选中了下面这段文字。请只润色选中部分：更精炼、可验证、去营销腔，不改变事实。输出润色后的选中段落即可（不要附带未选中内容）。保留 [占位符]。${selectionBlock}${
          r.zh ? `\n\n【完整草稿（仅供理解上下文）】\n${r.zh}` : ""
        }`;
      }
      return `${header}请润色下面这段中文答案：让它更精炼、更可验证、去掉营销腔，但不改变事实与立场。保留所有 [占位符]。\n\n---\n${r.zh ?? ""}`;
    case "translate":
      if (r.selection) {
        return `${header}请把用户选中的这段中文翻译成提交用的专业英文（分析师问卷语气）。只输出英文译文。${selectionBlock}`;
      }
      return `${header}请把下面的中文答案翻译成提交用的专业英文（分析师问卷语气）。术语用业界通用译法，保留所有 [占位符]。只输出英文。\n\n---\n${r.zh ?? ""}`;
    case "draft":
      return `${header}下面是产品同学提供的事实要点/材料。请据此起草一版中文答案（结构清晰、可验证、无营销腔）。只用材料里的事实，缺的用 [占位符] 标出。${selectionBlock}\n\n材料：\n${r.material ?? ""}${
        r.zh ? `\n\n现有草稿（可参考/改写）：\n${r.zh}` : ""
      }`;
    case "ask":
      return `${header}用户在向你提问或请求帮助——请直接、简洁地回答这个问题，用中文。${
        r.material
          ? "用户提供了【参考资料】，请优先依据其中的事实作答，并在相关处体现它。"
          : ""
      }下面的「答案草稿」只是背景，帮你理解用户指代的是什么（例如某个术语、缩写、产品名），${
        r.selection ? "用户还选中了其中一段一并参考。" : ""
      }请勿改写、重述或输出整段草稿，也不要把你的回答当成新版答案——这是一次对话，不是改稿。若资料/草稿不足以可靠回答（尤其涉及战略、愿景、roadmap、未来、具体数字/客户/认证等），可以给出力所能及的简要说明，但务必按上面的「信心闸门」在末尾另起一行输出 [[need-reference]]，提示用户去云知核实。\n\n【用户的问题】\n${
        r.instruction ?? ""
      }${r.selection ? `\n\n【用户选中的片段（背景）】\n${r.selection}` : ""}${
        r.material ? `\n\n【参考资料（用户上传，请优先依据）】\n${r.material}` : ""
      }${r.zh ? `\n\n【当前答案草稿（仅作背景，请勿改写）】\n${r.zh}` : ""}`;
    case "batch-rewrite":
      return `${header}你正在执行 Omdia Market Radar 主权云问卷的专家团批量改写。请同时扮演分析师写手、证据审计员、合规审查员和英文编辑。

严格规则：
1. 只能使用【事实与证据包】以及现有草稿里的事实；不得增加包中没有的数字、客户、认证、产品能力、市场排名、合同承诺或未来计划。
2. 普通能力题应在安全范围内写得更完整：直接回答、实现/覆盖范围、客户价值、证据边界。中文通常 150–300 字；如果材料很少，可以更短，但不能空泛凑字。
3. 如果现有草稿以 [REVIEW: 开头，保留该标记，不得把待确认事项伪装成已验证事实；应清楚写明已知事实、缺失信息、需要谁确认。
4. 中文和英文必须事实一致。英文使用克制、专业的 analyst questionnaire 语气，不做机械逐字翻译。
5. 不要输出 Markdown 代码块或任何解释。只输出可被 JSON.parse 解析的单行 JSON：{"zh":"中文答案","en":"English answer","status":"READY 或 NEEDS_REVIEW","note":"一句话说明证据边界"}。

【现有中文草稿】
${r.zh ?? ""}

【现有英文草稿】
${r.en ?? ""}

【事实与证据包】
${r.material ?? ""}`;
    case "custom":
      if (r.selection) {
        return `${header}用户在中栏选中了下面这段文字，并给出一条指令。请只按指令修改这段【选中文字】，其余未选中的内容一律保持不变、不要重写整段答案。只输出修改后的选中段落本身（不要附带未选中的内容，不要加引号或解释）。保留所有 [占位符]。\n\n【指令】\n${r.instruction ?? ""}${selectionBlock}${
          r.zh ? `\n\n【完整草稿（仅供理解上下文，请勿整体改写）】\n${r.zh}` : ""
        }${r.material ? `\n\n【补充材料】\n${r.material}` : ""}${expansionRule}`;
      }
      return `${header}请按下面的指令处理这段中文草稿，输出处理后的完整中文答案。保留所有 [占位符]。\n\n【指令】\n${r.instruction ?? ""}\n\n【当前中文草稿】\n${r.zh ?? ""}${
        r.material ? `\n\n【补充材料】\n${r.material}` : ""
      }${expansionRule}`;
    default:
      return r.zh ?? "";
  }
}

interface MoonshotChoice {
  message?: { content?: string };
}
interface MoonshotResponse {
  choices?: MoonshotChoice[];
  error?: { message?: string };
}

export async function handleAi(
  body: AiRequest,
  apiKey: string | undefined,
  model: string | undefined,
  provider: AiProvider = "kimi",
): Promise<AiResponse> {
  const cfg = PROVIDERS[provider] ?? PROVIDERS.kimi;
  if (!apiKey) throw new Error(`${cfg.label} API Key 未配置（服务端）`);
  if (!body?.mode) throw new Error("缺少 mode");

  const messages = [
    { role: "system", content: SYSTEM },
    { role: "user", content: buildUserPrompt(body) },
  ];
  const expansionRequested = EXPANSION_RE.test(body.instruction ?? "");
  const originalText = body.selection || body.zh || "";

  // Try the configured model first, then fall back across the family. Each
  // model gets a couple of retries with backoff before moving on.
  const primary = model || cfg.defaultModel;
  const models = [primary, ...cfg.fallbackModels.filter((m) => m !== primary)];

  let lastError = `${cfg.label}调用失败`;
  for (const usedModel of models) {
    for (let attempt = 1; attempt <= RETRIES_PER_MODEL; attempt++) {
      let resp: Response;
      try {
        resp = await fetch(`${cfg.base}/chat/completions`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: usedModel,
            temperature: cfg.tempFor(usedModel),
            messages,
            ...(cfg.extraBody ?? {}),
          }),
        });
      } catch (error) {
        const cause = (error as Error & {
          cause?: { code?: string; message?: string };
        }).cause;
        const detail = [cause?.code, cause?.message || (error as Error).message]
          .filter(Boolean)
          .join(": ");
        const wrapped = new Error(
          `${cfg.label} API 网络连接失败（${new URL(cfg.base).hostname}）：${detail}`,
        ) as Error & { cause?: unknown };
        wrapped.cause = error;
        throw wrapped;
      }

      const json = (await resp.json().catch(() => ({}))) as MoonshotResponse;

      if (resp.ok) {
        const text = json.choices?.[0]?.message?.content?.trim() ?? "";
        if (text) {
          const unchangedExpansion =
            expansionRequested &&
            originalText &&
            compactText(text.replace(/\[\[need-reference\]\]/gi, "")) ===
              compactText(originalText);
          if (!unchangedExpansion) return { text, model: usedModel };

          lastError = `${cfg.label}未产生实质扩写，请补充事实材料或换一个更具体的指令`;
          if (attempt < RETRIES_PER_MODEL) {
            await sleep(500 * attempt);
            continue;
          }
          break;
        }
        lastError = `${cfg.label}返回空内容`;
        break; // empty body — try the next model
      }

      lastError = json.error?.message || `${cfg.label} API HTTP ${resp.status}`;
      const overloaded =
        resp.status === 429 ||
        resp.status >= 500 ||
        /overload/i.test(lastError);
      // Non-transient (400 bad request, 401 auth, …) → fail fast, don't retry.
      if (!overloaded) throw new Error(lastError);

      // Transient: back off before retrying this model (last attempt falls through
      // to the next model immediately).
      if (attempt < RETRIES_PER_MODEL) await sleep(500 * attempt);
    }
  }

  throw new Error(lastError);
}
