import { useState, useMemo } from 'react';
import { productTracks, searchKeywordLibrary } from '../data/mockData';
import { Tag, Search, Filter, BookOpen, Library } from 'lucide-react';

const firms = ['Gartner', 'Forrester', 'IDC'] as const;
type Firm = typeof firms[number];

const firmColors: Record<Firm, string> = {
  'Gartner': '#DC2626',
  'Forrester': '#7C3AED',
  'IDC': '#0891B2',
};

export default function KeywordMatrixPage() {
  const [search, setSearch] = useState('');
  const [activeFirm, setActiveFirm] = useState<Firm | 'all'>('all');

  const filteredTracks = useMemo(() => {
    if (!search) return productTracks;
    const q = search.toLowerCase();
    return productTracks.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.keywords.cn.some(k => k.toLowerCase().includes(q)) ||
      t.keywords.en.some(k => k.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="kw-page">
      {/* ===== 顶部：产品赛道总览 ===== */}
      <section className="kw-overview">
        <div>
          <h2 className="section-title">产品赛道 × 关键词矩阵</h2>
          <p className="section-sub">为每条产品赛道建立标准化的中英文关键词库，并对应到各机构报告类型</p>
        </div>
        <div className="kw-search-box">
          <Search size={14} />
          <input
            type="text"
            placeholder="搜索产品赛道或关键词（中/英）..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* ===== 关键词库（测评类 + 趋势类） ===== */}
      <section className="kw-library">
        <h3 className="library-title"><Library size={16} /> 搜索关键词库</h3>
        <div className="library-grid">
          {Object.values(searchKeywordLibrary).map(group => (
            <div key={group.label} className="library-block">
              <div className="library-block-label">{group.label}</div>
              <div className="library-block-items">
                {group.items.map((item, idx) => (
                  <div key={idx} className="library-item">
                    <span className="library-firm-tag" style={{ background: firmColors[item.firm as Firm] || '#6B7280' }}>{item.firm}</span>
                    {item.keywords.map((kw, i) => (
                      <span key={i} className="library-kw-chip">{kw}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="library-formula">
          <strong>搜索逻辑：</strong>
          <span className="formula-item">产品赛道</span>
          <span>×</span>
          <span className="formula-item">类型（测评/趋势关键词）</span>
          <span>×</span>
          <span className="formula-item">关键词（各产品赛道的关键词）</span>
        </div>
      </section>

      {/* ===== 矩阵表格 ===== */}
      <section className="kw-matrix">
        <div className="matrix-toolbar">
          <span className="matrix-label">机构过滤：</span>
          <button className={`matrix-firm-btn${activeFirm === 'all' ? ' active' : ''}`} onClick={() => setActiveFirm('all')}>全部</button>
          {firms.map(f => (
            <button
              key={f}
              className={`matrix-firm-btn${activeFirm === f ? ' active' : ''}`}
              onClick={() => setActiveFirm(f)}
              style={activeFirm === f ? { background: firmColors[f], color: '#fff' } : {}}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="matrix-table">
          <div className="matrix-head">
            <div className="matrix-cell-th track-col">产品赛道</div>
            <div className="matrix-cell-th">中文关键词</div>
            <div className="matrix-cell-th">英文关键词</div>
            <div className="matrix-cell-th">Gartner 报告</div>
            <div className="matrix-cell-th">Forrester 报告</div>
            <div className="matrix-cell-th">IDC 报告</div>
          </div>
          {filteredTracks.map(track => (
            <div key={track.id} className="matrix-row">
              <div className="matrix-cell track-name">{track.name}</div>
              <div className="matrix-cell">
                {track.keywords.cn.map((k, i) => <span key={i} className="kw-chip cn">{k}</span>)}
              </div>
              <div className="matrix-cell">
                {track.keywords.en.map((k, i) => <span key={i} className="kw-chip en">{k}</span>)}
              </div>
              {(['Gartner', 'Forrester', 'IDC'] as Firm[]).map(f => {
                const reports = track.keywords.analyst[f.toLowerCase() as 'gartner' | 'forrester' | 'idc'] || [];
                return (
                  <div key={f} className="matrix-cell">
                    {reports.length === 0 ? (
                      <span className="matrix-empty">—</span>
                    ) : (
                      reports.map((r, i) => (
                        <span
                          key={i}
                          className={`report-chip${activeFirm === f ? ' highlight' : ''}`}
                          style={activeFirm === f ? { background: firmColors[f], color: '#fff' } : {}}
                        >
                          {r}
                        </span>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
