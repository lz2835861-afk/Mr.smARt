/**
 * AR 问卷助手 — 前端 API 客户端
 *
 * 统一封装对后端搜索服务的调用
 */

// 通过 Vite proxy 转发到后端 (localhost:3001)
const API_BASE = '/api';

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  source: 'lexiang' | 'yunzhi' | 'wechat' | 'vb' | 'official' | 'external';
  sourceName: string;
  summary: string;
  tags: string[];
  date: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  query: string;
  source: string;
  timestamp: string;
  totalResults: number;
  results: SearchResult[];
  sources: string[];
  warning?: string;
}

export interface SourceInfo {
  id: string;
  type: string;
  name: string;
  description: string;
  connected: boolean;
  docCount: number;
  icon: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  sources: SourceInfo[];
}

/**
 * 检查后端服务健康状态
 */
export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

/**
 * 获取数据源列表
 */
export async function getSources(): Promise<{ sources: SourceInfo[] }> {
  const res = await fetch(`${API_BASE}/sources`);
  if (!res.ok) throw new Error(`Get sources failed: ${res.status}`);
  return res.json();
}

/**
 * 统一搜索接口
 * @param query 搜索关键词
 * @param source 数据源: all | lexiang | yunzhi | wechat
 * @param limit 返回数量
 */
export async function unifiedSearch(
  query: string,
  source: 'all' | 'lexiang' | 'yunzhi' | 'wechat' = 'all',
  limit = 15
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    source,
    limit: String(limit),
  });

  const res = await fetch(`${API_BASE}/search?${params}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Search failed: ${res.status}`);
  }

  return res.json();
}

/**
 * 搜索乐享知识库
 */
export async function searchLexiang(
  query: string,
  limit = 15
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${API_BASE}/search/lexiang?${params}`);
  if (!res.ok) throw new Error(`Lexiang search failed: ${res.status}`);
  return res.json();
}

/**
 * 搜索云知
 */
export async function searchYunZhi(
  query: string,
  limit = 15
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${API_BASE}/search/yunzhi?${params}`);
  if (!res.ok) throw new Error(`YunZhi search failed: ${res.status}`);
  return res.json();
}

/**
 * 向 Mr.smARt 智能体发送消息（流式 SSE）
 * @param messages 对话历史
 * @param mode 智能体模式: csig | marketing
 * @param onChunk 每当收到内容片段时回调
 * @param onSources 知识库检索完成时回调
 * @param onDone 流结束时回调
 * @param onError 出错时回调
 */
export async function agentChatStream(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  mode: 'csig' | 'marketing' = 'csig',
  callbacks: {
    onChunk?: (content: string) => void;
    onSources?: (sources: Array<{ title: string; url: string; source: string; excerpt: string; relevance: number }>) => void;
    onDone?: (fullContent: string) => void;
    onFallback?: () => void;
    onError?: (error: string) => void;
  } = {}
): Promise<void> {
  const { onChunk, onSources, onDone, onFallback, onError } = callbacks;

  try {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, mode, stream: true }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      onError?.(err.message || '请求失败');
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError?.('浏览器不支持流式读取');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          onDone?.(fullContent);
          return;
        }

        try {
          const event = JSON.parse(data);
          switch (event.type) {
            case 'kb_search_done':
              onSources?.(event.sources || []);
              break;
            case 'content':
              fullContent += event.content;
              onChunk?.(event.content);
              break;
            case 'fallback':
              onFallback?.();
              break;
            case 'error':
              onError?.(event.message || '未知错误');
              break;
          }
        } catch {
          // 忽略解析失败的行
        }
      }
    }

    onDone?.(fullContent);
  } catch (error: any) {
    onError?.(error.message || '网络请求失败');
  }
}

/**
 * 非流式 Agent 对话
 */
export async function agentChat(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  mode: 'csig' | 'marketing' = 'csig'
): Promise<{
  content: string | null;
  sources: Array<{ title: string; url: string; source: string; excerpt: string; relevance: number }>;
  fallback?: boolean;
  error?: boolean;
  message?: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}> {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode, stream: false }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Agent chat failed');
  }

  return res.json();
}
