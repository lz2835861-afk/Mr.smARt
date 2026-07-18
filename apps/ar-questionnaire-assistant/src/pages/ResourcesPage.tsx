import { useState, useMemo } from 'react';
import { questionnaireList, meetingNotes, experts, userRoles } from '../data/mockData';
import type { QuestionnaireListItem, MeetingNote, ExpertProfile, UserRole } from '../types';
import {
  FileText, Users, MessageSquare, UserCircle, BookOpen,
  ExternalLink, Search, Calendar, Building2, Tag, ChevronRight, Filter, Plus
} from 'lucide-react';

type TabKey = 'questionnaire' | 'meeting' | 'communication' | 'expert';

const tabs: { key: TabKey; label: string; icon: any; count: number }[] = [
  { key: 'questionnaire', label: '问卷清单', icon: FileText, count: questionnaireList.length },
  { key: 'meeting', label: '会议纪要', icon: MessageSquare, count: meetingNotes.filter(m => m.type === 'meeting').length },
  { key: 'communication', label: '沟通纪要', icon: MessageSquare, count: meetingNotes.filter(m => m.type === 'communication').length },
  { key: 'expert', label: '专家库', icon: UserCircle, count: experts.length },
];

const scopeConfig = {
  'teambrain': { label: '团队智囊 (TeamBrain)', sub: '对内 · AR团队', color: '#7C3AED', icon: '🧠', desc: '提升团队资源沉淀与协作效率' },
  'csig-helper': { label: 'CSIG 助手', sub: '对外 · BG整体', color: '#0891B2', icon: '🤝', desc: '洞察行业、辅助决策、助力产品' },
  'cloud-helper': { label: '云助手', sub: '对客户', color: '#D97706', icon: '☁️', desc: '让客户快速了解腾讯云优势' },
};

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('questionnaire');
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('all');
  const [firmFilter, setFirmFilter] = useState('all');

  // 问卷清单
  const filteredQ = useMemo(() => {
    let list = questionnaireList;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(x => x.title.toLowerCase().includes(q) || x.productTrack.toLowerCase().includes(q) || x.institution.toLowerCase().includes(q));
    }
    if (trackFilter !== 'all') list = list.filter(x => x.productTrack === trackFilter);
    if (firmFilter !== 'all') list = list.filter(x => x.institution.startsWith(firmFilter));
    return list;
  }, [search, trackFilter, firmFilter]);

  const filteredM = useMemo(() => {
    const list = meetingNotes.filter(m => m.type === activeTab);
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(m => m.event.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q));
  }, [search, activeTab]);

  const filteredE = useMemo(() => {
    if (!search) return experts;
    const q = search.toLowerCase();
    return experts.filter(e => e.name.toLowerCase().includes(q) || e.firm.toLowerCase().includes(q) || e.focus.toLowerCase().includes(q));
  }, [search]);

  const productTracks = Array.from(new Set(questionnaireList.map(q => q.productTrack)));
  const firms = Array.from(new Set(questionnaireList.map(q => q.institution.split(' ')[0])));

  // 按scope分组用户角色
  const rolesByScope = useMemo(() => {
    const m: Record<string, UserRole[]> = { 'teambrain': [], 'csig-helper': [], 'cloud-helper': [] };
    userRoles.forEach(r => m[r.scope].push(r));
    return m;
  }, []);

  return (
    <div className="resources-page">
      {/* ===== 用户范围层级 ===== */}
      <section className="scope-hierarchy">
        <h2 className="section-title">用户范围 · AI智能体项目的范围从内部到外部</h2>
        <p className="section-sub">不同角色、不同权限、可访问不同层级的内容</p>
        <div className="scope-cards">
          {(Object.keys(scopeConfig) as Array<keyof typeof scopeConfig>).map((key, idx) => {
            const cfg = scopeConfig[key];
            const roles = rolesByScope[key];
            return (
              <div key={key} className="scope-card" style={{ borderTop: `4px solid ${cfg.color}` }}>
                <div className="scope-card-head">
                  <div className="scope-card-icon" style={{ background: cfg.color }}>{cfg.icon}</div>
                  <div>
                    <div className="scope-card-label">{cfg.label}</div>
                    <div className="scope-card-sub">{cfg.sub}</div>
                  </div>
                </div>
                <div className="scope-card-desc">{cfg.desc}</div>
                <div className="scope-card-roles">
                  {roles.map(r => (
                    <div key={r.id} className="scope-role-chip">
                      <span>{r.icon}</span>
                      <span>{r.name}</span>
                    </div>
                  ))}
                </div>
                <div className="scope-card-stat">
                  <div><strong>{roles.length}</strong> 角色</div>
                  <div><strong>{roles.reduce((s, r) => s + r.needs.length, 0)}</strong> 需求点</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 资源 Tab 切换 ===== */}
      <section className="resources-section">
        <div className="resources-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`resources-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <t.icon size={16} />
              <span>{t.label}</span>
              <span className="resources-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="resources-toolbar">
          <div className="resources-search">
            <Search size={14} />
            <input
              type="text"
              placeholder={`搜索${tabs.find(t => t.key === activeTab)?.label}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {activeTab === 'questionnaire' && (
            <>
              <div className="resources-filter">
                <Filter size={14} />
                <select value={trackFilter} onChange={e => setTrackFilter(e.target.value)}>
                  <option value="all">全部赛道</option>
                  {productTracks.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="resources-filter">
                <Building2 size={14} />
                <select value={firmFilter} onChange={e => setFirmFilter(e.target.value)}>
                  <option value="all">全部机构</option>
                  {firms.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </>
          )}
          <button className="btn-primary">
            <Plus size={14} />
            新建{tabs.find(t => t.key === activeTab)?.label.replace(/[清单纪要库]$/, '')}
          </button>
        </div>

        {/* ===== 问卷清单表格 ===== */}
        {activeTab === 'questionnaire' && (
          <div className="resources-table">
            <div className="resources-table-head">
              <div>问卷序号</div>
              <div>产品赛道</div>
              <div>问卷机构</div>
              <div>问卷名称</div>
              <div>创建时间</div>
              <div>状态</div>
              <div>操作</div>
            </div>
            {filteredQ.length === 0 ? (
              <div className="empty-state">暂无匹配的问卷</div>
            ) : filteredQ.map((q: QuestionnaireListItem) => (
              <div key={q.id} className="resources-table-row">
                <div className="cell-index">{q.index.toString().padStart(2, '0')}</div>
                <div><span className="track-chip">{q.productTrack}</span></div>
                <div><span className="firm-chip">{q.institution}</span></div>
                <div className="cell-title">{q.title}</div>
                <div className="cell-date"><Calendar size={12} /> {q.createdAt}</div>
                <div>
                  <span className={`status-pill status-${q.status}`}>
                    {q.status === 'in-progress' ? '进行中' : q.status === 'completed' ? '已完成' : '待开始'}
                  </span>
                </div>
                <div>
                  <a className="cell-link" href={q.docUrl} target="_blank" rel="noreferrer">
                    打开 <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 会议/沟通纪要 ===== */}
        {(activeTab === 'meeting' || activeTab === 'communication') && (
          <div className="resources-table">
            <div className="resources-table-head">
              <div>序号</div>
              <div>{activeTab === 'meeting' ? '会议事件' : '沟通事件'}</div>
              <div>时间</div>
              <div>关联摘要</div>
              <div>关联资料</div>
            </div>
            {filteredM.length === 0 ? (
              <div className="empty-state">暂无相关{activeTab === 'meeting' ? '会议' : '沟通'}纪要</div>
            ) : filteredM.map((m: MeetingNote) => (
              <div key={m.id} className="resources-table-row">
                <div className="cell-index">{m.index.toString().padStart(2, '0')}</div>
                <div className="cell-title">{m.event}</div>
                <div className="cell-date"><Calendar size={12} /> {m.date}</div>
                <div className="cell-summary">{m.summary}</div>
                <div>
                  {m.relatedUrl ? (
                    <a className="cell-link" href={m.relatedUrl} target="_blank" rel="noreferrer">
                      {m.relatedDoc || '查看资料'} <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="cell-doc-text">《{m.relatedDoc}》</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 专家库 ===== */}
        {activeTab === 'expert' && (
          <div className="experts-grid">
            {Object.keys(rolesByScope).map(scope => {
              const expertsByFirm: Record<string, ExpertProfile[]> = {};
              filteredE.filter(e => e.firm).forEach(e => {
                if (!expertsByFirm[e.firm]) expertsByFirm[e.firm] = [];
                expertsByFirm[e.firm].push(e);
              });
              return Object.entries(expertsByFirm).map(([firm, list]) => (
                <div key={firm} className="expert-firm-block">
                  <div className="expert-firm-head">
                    <Building2 size={16} />
                    <h3>{firm}</h3>
                    <span className="expert-firm-count">{list.length} 位专家</span>
                  </div>
                  <div className="expert-cards">
                    {list.map(e => (
                      <div key={e.id} className="expert-card">
                        <div className="expert-avatar">{e.name.slice(-1)}</div>
                        <div className="expert-info">
                          <div className="expert-name">{e.name}</div>
                          <div className="expert-focus"><Tag size={11} /> {e.focus}</div>
                          <div className="expert-history">{e.history}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })}
          </div>
        )}
      </section>
    </div>
  );
}
