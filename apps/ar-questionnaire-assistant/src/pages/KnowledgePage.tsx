import { useState, useEffect, useCallback } from 'react';
import { knowledgeSources, knowledgeEntries as allKnowledgeEntries } from '../data/mockData';
import type { KnowledgeEntry, AnswerSource } from '../types';
import * as api from '../services/api';
import type { SearchResult, SourceInfo } from '../services/api';
import { Search, Database, ExternalLink, RefreshCw, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

const sourceConfig: Record<string, { icon: string; label: string; color: string }> = {
  lexiang: { icon: '📚', label: '腾讯乐享', color: '#4F46E5' },
  yunzhi: { icon: '☁️', label: '云知', color: '#059669' },
  wechat: { icon: '📱', label: '公众号', color: '#D97706' },
  vb: { icon: '🌐', label: 'VentureBeat', color: '#E11D48' },
  official: { icon: '🏢', label: '腾讯云官网', color: '#374151' },
  external: { icon: '🔗', label: '外部来源', color: '#7C3AED' },
};

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AnswerSource['type'] | 'all'>('all');
  const [results, setResults] = useState<KnowledgeEntry[]>([]);
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [apiError, setApiError] = useState('');
  const [backendSources, setBackendSources] = useState<SourceInfo[]>([]);
  const [mode, setMode] = useState<'api' | 'mock'>('api');

  // 启动时检查后端连接
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    setApiStatus('connecting');
    try {
      const health = await api.checkHealth();
      setApiStatus('connected');
      setBackendSources(health.sources);
      setMode('api');
    } catch {
      setApiStatus('disconnected');
      setApiError('后端搜索服务未启动，使用本地示例数据');
      setMode('mock');
    }
  };

  // API 搜索
  const handleApiSearch = useCallback(async (query: string, filter: string) => {
    if (!query.trim()) {
      setApiResults([]);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const source = filter === 'all' ? 'all' : (filter as 'lexiang' | 'yunzhi' | 'wechat');
      const response = await api.unifiedSearch(query, source, 20);

      setApiResults(response.results);

      if (response.warning) {
        setApiError(response.warning);
      }
    } catch (err: any) {
      setApiError(err.message || '搜索请求失败');
      setApiResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 本地 Mock 搜索
  const handleMockSearch = useCallback((query: string, filter: AnswerSource['type'] | 'all') => {
    let filtered = allKnowledgeEntries as KnowledgeEntry[];

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter((e: KnowledgeEntry) =>
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter((e: KnowledgeEntry) => e.type === filter);
    }

    setResults(filtered);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (mode === 'api') {
      handleApiSearch(query, activeFilter);
    } else {
      handleMockSearch(query, activeFilter);
    }
  };

  const handleFilter = (filter: AnswerSource['type'] | 'all') => {
    setActiveFilter(filter);
    if (mode === 'api') {
      handleApiSearch(searchQuery, filter);
    } else {
      handleMockSearch(searchQuery, filter);
    }
  };

  // 转换为统一的结果展示格式
  const displayResults = mode === 'api'
    ? apiResults.map((r): KnowledgeEntry => ({
        id: r.id,
        title: r.title,
        url: r.url,
        type: r.source,
        source: r.sourceName,
        summary: r.summary,
        tags: r.tags,
        date: r.date,
        relevance: r.relevance,
      }))
    : results;

  const totalCount = displayResults.length;

  return (
    <div className="page-container knowledge-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>知识库</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* 连接状态 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '20px',
            background: apiStatus === 'connected' ? '#ECFDF5' : apiStatus === 'connecting' ? '#FEF3C7' : '#FEF2F2',
            fontSize: '12px', fontWeight: 500
          }}>
            {apiStatus === 'connected' ? (
              <><Wifi size={14} color="#059669" /> <span style={{ color: '#059669' }}>API 已连接</span></>
            ) : apiStatus === 'connecting' ? (
              <><RefreshCw size={14} color="#D97706" className="spin" /> <span style={{ color: '#D97706' }}>连接中...</span></>
            ) : (
              <><WifiOff size={14} color="#DC2626" /> <span style={{ color: '#DC2626' }}>离线模式</span></>
            )}
          </div>
          {apiStatus === 'disconnected' && (
            <button
              className="btn btn-sm"
              onClick={checkBackendHealth}
              style={{ fontSize: '12px' }}
            >
              <RefreshCw size={12} /> 重试
            </button>
          )}
        </div>
      </div>
      <p className="page-subtitle">
        整合腾讯乐享、云知、腾讯云市场部公众号等资料，为问卷答案提供可溯源依据
      </p>

      {/* 后端警告 */}
      {apiError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', borderRadius: '8px',
          background: '#FFFBEB', border: '1px solid #FDE68A',
          marginBottom: '18px', fontSize: '13px', color: '#92400E'
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{apiError}</span>
        </div>
      )}

      {/* Knowledge Sources */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} /> 已连接知识源
        </h3>
        <div className="knowledge-sources-grid">
          {knowledgeSources.map(source => {
            const config = sourceConfig[source.type] || sourceConfig.external;
            // 从后端获取实时连接状态
            const backendSource = backendSources.find(s => s.type === source.type);
            const isConnected = backendSource ? backendSource.connected : source.connected;
            const count = backendSource ? backendSource.docCount : source.docCount;

            return (
              <div key={source.id} className={`knowledge-source-card${!isConnected ? ' disconnected' : ''}`}>
                <div className="knowledge-source-header">
                  <div className="knowledge-source-icon" style={{ background: config.color + '15' }}>
                    {config.icon}
                  </div>
                  <div className="knowledge-source-name">{source.name}</div>
                </div>
                <div className="knowledge-source-desc">{source.description}</div>
                <div className="knowledge-source-meta">
                  <span className={`knowledge-source-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                  <span>{isConnected ? '已连接' : '未连接'}</span>
                  <span>·</span>
                  <span>{count.toLocaleString()} 篇文档</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="knowledge-search-bar">
        <input
          className="knowledge-search-input"
          type="text"
          placeholder="搜索产品文档、技术白皮书、客户案例、市场报道..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value === '') {
              setApiResults([]);
              setResults([]);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchQuery);
            }
          }}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleSearch(searchQuery)}
          disabled={loading}
        >
          {loading ? (
            <><RefreshCw size={15} className="spin" /> 搜索中...</>
          ) : (
            <><Search size={15} /> 搜索</>
          )}
        </button>
      </div>

      {/* 数据源筛选 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm${activeFilter === 'all' ? ' btn-primary' : ''}`}
          onClick={() => handleFilter('all')}
        >
          全部
        </button>
        {Object.entries(sourceConfig)
          .filter(([key]) => key !== 'vb' && key !== 'official' && key !== 'external')
          .map(([key, config]) => (
            <button
              key={key}
              className={`btn btn-sm${activeFilter === key ? ' btn-primary' : ''}`}
              onClick={() => handleFilter(key as AnswerSource['type'])}
            >
              {config.icon} {config.label}
            </button>
          ))}
      </div>

      {/* Results */}
      {searchQuery && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            {loading ? (
              '正在搜索...'
            ) : (
              <>
                共找到 <strong>{totalCount}</strong> 条结果
                关于 "<strong>{searchQuery}</strong>"
                {mode === 'api' && (
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#9CA3AF' }}>
                    ({apiResults.length > 0 ? `${[...new Set(apiResults.map(r => r.sourceName))].join('、')}` : ''})
                  </span>
                )}
              </>
            )}
          </span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '60px 20px', color: '#6B7280'
        }}>
          <RefreshCw size={32} className="spin" style={{ marginBottom: '12px', color: '#4F46E5' }} />
          <p style={{ fontSize: '14px' }}>正在从乐享、云知、公众号检索相关内容...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && searchQuery && totalCount === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>未找到相关内容</h3>
          <p>尝试调整搜索关键词或切换数据源</p>
        </div>
      )}

      {/* No search yet */}
      {!loading && !searchQuery && (
        <div style={{
          textAlign: 'center', padding: '60px 20px', color: '#9CA3AF'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', color: '#6B7280' }}>
            输入关键词搜索知识库
          </h3>
          <p style={{ fontSize: '13px' }}>
            支持 CodeBuddy、WorkBuddy、混元大模型、TKE、TDSQL 等产品
          </p>
        </div>
      )}

      {/* Results list */}
      {!loading && displayResults.length > 0 && (
        <div className="knowledge-results">
          {displayResults.map(entry => {
            const config = sourceConfig[entry.type] || sourceConfig.external;
            const highlightedSummary = searchQuery
              ? entry.summary.replace(
                  new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                  '<mark>$1</mark>'
                )
              : entry.summary;

            return (
              <div key={entry.id} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px',
                    background: config.color + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', flexShrink: 0
                  }}>
                    {config.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                        <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1A1A2E', textDecoration: 'none' }}>
                          {entry.title}
                        </a>
                      </h4>
                      <span className={`source-type-badge ${entry.type}`} style={{ flexShrink: 0 }}>
                        {config.label}
                      </span>
                      {entry.relevance !== undefined && (
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '2px 6px',
                          borderRadius: '4px',
                          background: entry.relevance >= 90 ? '#ECFDF5' : entry.relevance >= 80 ? '#FFFBEB' : '#F3F4F6',
                          color: entry.relevance >= 90 ? '#059669' : entry.relevance >= 80 ? '#D97706' : '#6B7280',
                          flexShrink: 0,
                        }}>
                          相关度 {entry.relevance}%
                        </span>
                      )}
                    </div>
                    <p
                      style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.6, marginBottom: '10px' }}
                      dangerouslySetInnerHTML={{ __html: highlightedSummary }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {entry.date && (
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{entry.date}</span>
                      )}
                      {entry.tags && entry.tags.filter(Boolean).map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '10px', fontWeight: 500, padding: '2px 8px',
                            borderRadius: '10px', background: '#F3F4F6', color: '#6B7280'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#4F46E5', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        查看原文 <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 溯源标签 - API 结果特有 */}
                {mode === 'api' && (
                  <div style={{
                    marginTop: '12px', paddingTop: '10px',
                    borderTop: '1px solid #F3F4F6',
                    fontSize: '11px', color: '#9CA3AF',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <Database size={11} />
                    <span>来源: {entry.source}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
