/**
 * 腾讯混元大模型 Agent 服务
 *
 * 接入 HY3（混元大模型）作为 Mr.smARt 智能体的核心大脑。
 * 使用 OpenAI 兼容接口 + 流式 SSE 返回。
 *
 * 配置方式：
 *   环境变量 HUNYUAN_API_KEY=你的APIKey
 *   （在 https://console.cloud.tencent.com/hunyuan/start 创建）
 *
 * 未配置 API Key 时，自动降级为本地规则匹配模式。
 */

import OpenAI from 'openai';
import { searchLexiang } from './lexiang.js';
import { searchYunZhi } from './yunzhi.js';
import { searchWechatMP } from './wechatmp.js';

// ====== System Prompt ======
const SYSTEM_PROMPT = `你是 Mr.smARt，腾讯CSIG AR组（分析师合作组）的AI问卷助手。
你由腾讯混元大模型（HY3）驱动，专门帮助团队填写 Gartner、Forrester、IDC、Omdia 等分析师机构的调查问卷。

## 你的核心能力
1. 回答关于 CodeBuddy、WorkBuddy、TKE、TDSQL、混元等腾讯云AI产品的问题
2. 从知识库检索支撑材料，为问卷答案提供依据
3. 按分析师偏好的风格组织答案：**具体可量化、有据可循、结构化呈现**

## 回答格式要求
- 使用结构化格式（标题、列表、emoji标记关键数据）
- 关键数据用 **加粗** 强调
- 每个回答控制在 300-800 字
- 回答简洁专业，避免冗余客套话
- 如果知识库有相关内容，在回答末尾标注引用来源

## 你了解的产品信息（核心数据）
- CodeBuddy：AI编程助手，支持30+语言，月活50万+开发者，38%代码补全采纳率，85%测试覆盖率，ARR增长285%（FY2025），服务10000+企业
- WorkBuddy：AI工作助手，代码采纳率38%，编码时间减少31%，吞吐量提升2.3x
- TKE：腾讯云容器服务，国内市场份额领先
- TDSQL：分布式数据库，金融级高可用
- 混元大模型：多模态大模型，支持文本/图像/视频生成

## 当前活跃问卷
1. Gartner MQ — AI Code Assistants 2026（截止2026-07-25，12题）
2. Forrester Wave — AI Coding Assistants Q3 2026（截止2026-08-18，15题）

请始终保持专业、准确、有帮助。`;

const MARKETING_SYSTEM_PROMPT = `你是 Mr.smARt，腾讯CSIG市场部的AI问卷助手。
你由腾讯混元大模型（HY3）驱动，专注于帮助市场团队管理分析师报告相关的付费资源和知识沉淀。

## 你的核心能力
1. 回答关于市场部付费分析师报告资源的问题
2. 帮助管理团队的知识沉淀和问卷资产
3. 按市场部需求组织答案，简洁实用

## 回答格式
- 结构化呈现，关键数据加粗
- 回答简洁实用，200-500字
- 避免技术细节，聚焦市场和商业价值

请始终保持专业、准确、有帮助。`;

// ====== 知识库检索 ======
async function searchKnowledgeBase(query) {
  try {
    const [lexiangResults, yunzhiResults, wechatResults] = await Promise.allSettled([
      searchLexiang(query, { limit: 5 }),
      searchYunZhi(query, { limit: 3 }),
      searchWechatMP(query, { limit: 3 }),
    ]);

    const sources = [];
    const contextSnippets = [];

    if (lexiangResults.status === 'fulfilled' && Array.isArray(lexiangResults.value)) {
      lexiangResults.value.slice(0, 3).forEach((r) => {
        sources.push({ title: r.title, url: r.url, source: 'lexiang', excerpt: r.summary, relevance: r.relevance || 80 });
        contextSnippets.push(`[乐享] ${r.title}: ${r.summary}`);
      });
    }
    if (yunzhiResults.status === 'fulfilled' && Array.isArray(yunzhiResults.value)) {
      yunzhiResults.value.slice(0, 2).forEach((r) => {
        sources.push({ title: r.title, url: r.url, source: 'yunzhi', excerpt: r.summary, relevance: r.relevance || 75 });
        contextSnippets.push(`[云知] ${r.title}: ${r.summary}`);
      });
    }
    if (wechatResults.status === 'fulfilled' && Array.isArray(wechatResults.value)) {
      wechatResults.value.slice(0, 2).forEach((r) => {
        sources.push({ title: r.title, url: r.url, source: 'wechat', excerpt: r.summary, relevance: r.relevance || 70 });
        contextSnippets.push(`[公众号] ${r.title}: ${r.summary}`);
      });
    }

    return { sources, context: contextSnippets.join('\n') };
  } catch (err) {
    console.error('[HY Agent] 知识库检索失败:', err.message);
    return { sources: [], context: '' };
  }
}

// ====== 获取混元客户端 ======
function getHunyuanClient() {
  const apiKey = process.env.HUNYUAN_API_KEY;

  if (!apiKey) {
    console.warn('[HY Agent] ⚠️  未设置 HUNYUAN_API_KEY，将降级为本地规则匹配');
    return null;
  }

  return new OpenAI({
    apiKey,
    baseURL: 'https://api.hunyuan.cloud.tencent.com/v1',
  });
}

// ====== SSE 流式回复 ======
export async function* streamAgentReply(messages, mode = 'csig') {
  const client = getHunyuanClient();

  // 知识库检索
  const userQuery = messages[messages.length - 1]?.content || '';
  const kbResult = await searchKnowledgeBase(userQuery);

  // 发送知识库检索完成信号
  yield { type: 'kb_search_done', sources: kbResult.sources };

  // 如果没有 API Key，降级为本地规则匹配
  if (!client) {
    yield { type: 'fallback', message: '未配置混元API Key，使用本地规则匹配模式。' };
    return;
  }

  // 构建上下文消息
  const systemPrompt = mode === 'marketing' ? MARKETING_SYSTEM_PROMPT : SYSTEM_PROMPT;

  const contextMessages = [
    { role: 'system', content: systemPrompt },
  ];

  if (kbResult.context) {
    contextMessages.push({
      role: 'system',
      content: `以下是从知识库检索到的相关材料，请在回答时参考使用（需要在回答中标注来源）：\n\n${kbResult.context}`,
    });
  }

  // 只保留最近6轮对话
  const recentMessages = messages.slice(-12);
  const allMessages = [...contextMessages, ...recentMessages];

  try {
    const stream = await client.chat.completions.create({
      model: 'hunyuan-turbos-latest',
      messages: allMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
      enable_enhancement: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        yield { type: 'content', content: delta.content };
      }
      if (chunk.usage) {
        yield { type: 'usage', usage: chunk.usage };
      }
    }
  } catch (error) {
    console.error('[HY Agent] 混元API调用失败:', error.message);
    yield { type: 'error', message: `混元大模型调用失败: ${error.message}` };
  }
}

// ====== 非流式回复（用于不支持SSE的场景） ======
export async function getAgentReply(messages, mode = 'csig') {
  const client = getHunyuanClient();

  const userQuery = messages[messages.length - 1]?.content || '';
  const kbResult = await searchKnowledgeBase(userQuery);

  if (!client) {
    return {
      content: null,
      fallback: true,
      sources: kbResult.sources,
      message: '未配置混元API Key，使用本地规则匹配模式。请设置环境变量 HUNYUAN_API_KEY 以启用混元大模型。',
    };
  }

  const systemPrompt = mode === 'marketing' ? MARKETING_SYSTEM_PROMPT : SYSTEM_PROMPT;

  const contextMessages = [{ role: 'system', content: systemPrompt }];

  if (kbResult.context) {
    contextMessages.push({
      role: 'system',
      content: `以下是从知识库检索到的相关材料，请在回答时参考使用：\n\n${kbResult.context}`,
    });
  }

  const recentMessages = messages.slice(-12);
  const allMessages = [...contextMessages, ...recentMessages];

  try {
    const completion = await client.chat.completions.create({
      model: 'hunyuan-turbos-latest',
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 2000,
      enable_enhancement: true,
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      sources: kbResult.sources,
      usage: completion.usage,
    };
  } catch (error) {
    console.error('[HY Agent] 混元API调用失败:', error.message);
    return {
      content: null,
      error: true,
      sources: kbResult.sources,
      message: `混元大模型调用失败: ${error.message}`,
    };
  }
}
