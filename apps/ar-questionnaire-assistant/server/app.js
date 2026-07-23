/**
 * AR 问卷助手 — Express App（Vercel 兼容版）
 *
 * 与 server/index.js 相同，但不调用 app.listen()，
 * 以便在 Vercel serverless 环境中作为 handler 导出。
 */

import express from 'express';
import cors from 'cors';
import { searchLexiang } from './services/lexiang.js';
import { searchYunZhi } from './services/yunzhi.js';
import { searchWechatMP } from './services/wechatmp.js';
import { streamAgentReply, getAgentReply } from './services/hunyuan.js';

const app = express();

app.use(cors());
app.use(express.json());

// ====== 访问令牌门（外部白名单）======
// 仅允许携带有效 ar_access session cookie（由 /api/access 在校验门户令牌后下发）
// 的请求访问 /api/*，外部直接调用一律 401。/api/health 例外（无害探针）。
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  const cookie = req.headers.cookie || '';
  const ok = cookie
    .split(';')
    .some((c) => c.trim().startsWith('ar_access=1'));
  if (!ok) {
    return res.status(401).json({ error: 'unauthorized: access token required' });
  }
  next();
});

// ====== 数据源配置 ======
const SOURCE_CONFIG = {
  lexiang: {
    name: '腾讯乐享',
    description: '内部知识库，包含产品文档、技术白皮书、案例研究',
    connected: true,
    docCount: 2341,
    icon: '📚',
  },
  yunzhi: {
    name: '云知',
    description: '腾讯云内部知识管理平台，产品技术资料',
    connected: true,
    docCount: 1856,
    icon: '☁️',
  },
  wechat: {
    name: '腾讯云市场部公众号',
    description: '腾讯云官方公众号文章，产品发布、客户案例',
    connected: true,
    docCount: 523,
    icon: '📱',
  },
};

// ====== 健康检查 ======
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    sources: Object.keys(SOURCE_CONFIG).map((key) => ({
      source: key,
      ...SOURCE_CONFIG[key],
    })),
  });
});

// ====== 获取数据源列表 ======
app.get('/api/sources', (_req, res) => {
  const sources = Object.entries(SOURCE_CONFIG).map(([key, config]) => ({
    id: key,
    type: key,
    ...config,
  }));

  res.json({ sources });
});

// ====== 统一搜索接口 ======
app.get('/api/search', async (req, res) => {
  const {
    q = '',
    source = 'all',
    limit = '15',
    spaceId,
    teamId,
    titleOnly,
  } = req.query;

  if (!q.trim()) {
    return res.status(400).json({
      error: '缺少搜索关键词',
      message: '请提供 q 参数作为搜索关键词',
    });
  }

  const queryLimit = Math.min(parseInt(limit, 10) || 15, 50);

  const results = {
    query: q,
    source,
    timestamp: new Date().toISOString(),
    totalResults: 0,
    results: [],
    sources: [],
  };

  try {
    const searchPromises = [];
    const searchMeta = [];

    if (source === 'all' || source === 'lexiang') {
      searchMeta.push('lexiang');
      searchPromises.push(
        searchLexiang(q, {
          limit: source === 'lexiang' ? queryLimit : Math.ceil(queryLimit / 2),
          spaceId,
          teamId,
          titleOnly: titleOnly === 'true',
        }).then((r) => ({ source: 'lexiang', data: r }))
          .catch((err) => {
            console.error('[Search] Lexiang error:', err.message);
            return { source: 'lexiang', data: [], error: err.message };
          })
      );
    }

    if (source === 'all' || source === 'yunzhi') {
      searchMeta.push('yunzhi');
      searchPromises.push(
        searchYunZhi(q, {
          limit: source === 'yunzhi' ? queryLimit : Math.ceil(queryLimit / 2),
        }).then((r) => ({ source: 'yunzhi', data: r }))
          .catch((err) => {
            console.error('[Search] YunZhi error:', err.message);
            return { source: 'yunzhi', data: [], error: err.message };
          })
      );
    }

    if (source === 'all' || source === 'wechat') {
      searchMeta.push('wechat');
      searchPromises.push(
        searchWechatMP(q, {
          limit: source === 'wechat' ? queryLimit : Math.ceil(queryLimit / 2),
        }).then((r) => ({ source: 'wechat', data: r }))
          .catch((err) => {
            console.error('[Search] WeChat error:', err.message);
            return { source: 'wechat', data: [], error: err.message };
          })
      );
    }

    const searchResults = await Promise.all(searchPromises);

    const allResults = [];
    let hasError = false;

    for (const sr of searchResults) {
      if (sr.error) hasError = true;
      if (sr.data && Array.isArray(sr.data)) {
        allResults.push(...sr.data);
      }
    }

    allResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    results.totalResults = allResults.length;
    results.results = allResults.slice(0, queryLimit);
    results.sources = [...new Set(allResults.map((r) => r.source))];

    if (hasError) {
      results.warning = '部分数据源搜索返回了降级结果，请检查 API 配置。';
    }

    res.json(results);
  } catch (error) {
    console.error('[Search] 聚合搜索异常:', error);
    res.status(500).json({
      error: '搜索服务异常',
      message: error.message,
      query: q,
    });
  }
});

// ====== 单独搜索乐享 ======
app.get('/api/search/lexiang', async (req, res) => {
  const { q = '', limit = '15', spaceId, teamId } = req.query;

  if (!q.trim()) {
    return res.status(400).json({ error: '缺少搜索关键词' });
  }

  try {
    const results = await searchLexiang(q, {
      limit: parseInt(limit, 10) || 15,
      spaceId,
      teamId,
    });

    res.json({ query: q, source: 'lexiang', totalResults: results.length, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== 单独搜索云知 ======
app.get('/api/search/yunzhi', async (req, res) => {
  const { q = '', limit = '15' } = req.query;

  if (!q.trim()) {
    return res.status(400).json({ error: '缺少搜索关键词' });
  }

  try {
    const results = await searchYunZhi(q, {
      limit: parseInt(limit, 10) || 15,
    });

    res.json({ query: q, source: 'yunzhi', totalResults: results.length, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== 单独搜索公众号 ======
app.get('/api/search/wechat', async (req, res) => {
  const { q = '', limit = '15' } = req.query;

  if (!q.trim()) {
    return res.status(400).json({ error: '缺少搜索关键词' });
  }

  try {
    const results = await searchWechatMP(q, {
      limit: parseInt(limit, 10) || 15,
    });

    res.json({ query: q, source: 'wechat', totalResults: results.length, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== HY3 Agent 对话接口 ======
app.post('/api/agent/chat', async (req, res) => {
  const { messages = [], mode = 'csig', stream = true } = req.body;

  if (!messages.length) {
    return res.status(400).json({ error: '缺少 messages 参数' });
  }

  if (!stream) {
    try {
      const result = await getAgentReply(messages, mode);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // === 流式 SSE 模式 ===
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  try {
    const streamGen = streamAgentReply(messages, mode);

    for await (const event of streamGen) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('[Agent Chat] 流式响应异常:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
  }

  res.end();
});

// ====== 404 处理 ======
app.use((_req, res) => {
  res.status(404).json({ error: '未知接口', message: '请查看 API 文档' });
});

export default app;
