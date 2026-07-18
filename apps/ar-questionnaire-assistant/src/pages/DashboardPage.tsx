import { useNavigate } from 'react-router-dom';
import { products, reports } from '../data/mockData';
import { Clock, TrendingUp, FileText, CheckCircle, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const totalReports = reports.length;
  const inProgress = reports.filter(r => r.status !== '已完成').length;
  const questionnaires = reports.filter(r => r.status === '问卷中').length;

  const statusLabel = (status: string) => {
    const map: Record<string, string> = { '问卷中': '问卷中', '评审中': '评审中', 'Briefing': 'Briefing', '已完成': '已完成' };
    return map[status] || status;
  };

  const statusClass = (status: string) => {
    const map: Record<string, string> = { '问卷中': 'status-questionnaire', '评审中': 'status-reviewing', 'Briefing': 'status-briefing', '已完成': 'status-completed' };
    return map[status] || '';
  };

  const firmClass = (firm: string) => {
    const map: Record<string, string> = { 'Gartner': 'gartner', 'Forrester': 'forrester', 'IDC': 'idc', 'Omdia': 'omdia' };
    return map[firm] || '';
  };

  // Calculate product report counts for leaderboard
  const productReportCounts = products.map(p => ({
    ...p,
    reportCount: reports.filter(r => r.productId === p.id).length,
    productReports: reports.filter(r => r.productId === p.id),
  })).sort((a, b) => b.reportCount - a.reportCount);

  return (
    <div className="page-container">
      <h2 className="page-title">AR 问卷助手</h2>
      <p className="page-subtitle">
        把好产品讲成好排名 — 从起草、引用到提交，帮 AR 与产品团队把每一次分析师评估准备到位
      </p>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{totalReports}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>参与报告总数</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{inProgress}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>进行中</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{questionnaires}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>问卷待填写</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{products.length}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>参与产品</div>
          </div>
        </div>
      </div>

      {/* Product Cards */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          进行中的报告
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 400 }}>来看看谁在 AR 的牌桌上</span>
        </h3>
      </div>

      <div className="product-cards">
        {productReportCounts.map((product, index) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => navigate('/questionnaire')}
          >
            <div className="product-card-header">
              <div className="product-card-icon" style={{ background: product.color + '15' }}>
                {product.icon}
              </div>
              <div className="product-card-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3>{product.name}</h3>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: index === 0 ? '#FEF3C7' : index === 1 ? '#E5E7EB' : '#FDE8CF', color: index === 0 ? '#D97706' : index === 1 ? '#6B7280' : '#B45309' }}>
                    #{index + 1}
                  </span>
                </div>
                <p>{product.description}</p>
              </div>
            </div>
            <div className="product-card-stats">
              {[...new Set(product.productReports.map(r => r.firm))].map(firm => (
                <span key={firm} className={`firm-badge ${firmClass(firm)}`}>{firm}</span>
              ))}
            </div>
            <div className="product-card-reports">
              {product.productReports.map(report => (
                <div key={report.id} className="report-item">
                  <div className="report-item-info">
                    <span className="report-item-name">{report.type} · {report.name}</span>
                    <span className={`report-item-status ${statusClass(report.status)}`}>
                      {statusLabel(report.status)}
                    </span>
                  </div>
                  <div className="report-item-deadline">
                    截止 {report.deadline.replace('2026-', '')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Section */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <span className="card-title">产品参与排行</span>
          <button className="btn btn-sm" onClick={() => navigate('/reports')}>
            查看完整排行榜 <ArrowRight size={14} />
          </button>
        </div>
        <div className="leaderboard">
          {productReportCounts.map((product, index) => (
            <div key={product.id} className="leaderboard-item">
              <div className={`leaderboard-rank r${index + 1}`}>
                {index + 1}
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: product.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                {product.icon}
              </div>
              <div className="leaderboard-info">
                <h4>{product.name}</h4>
                <p>{product.description}</p>
              </div>
              <div className="leaderboard-firms">
                {[...new Set(product.productReports.map(r => r.firm))].map(firm => (
                  <span key={firm} className={`firm-badge ${firmClass(firm)}`}>{firm}</span>
                ))}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#4F46E5' }}>
                {product.reportCount}
                <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 400 }}> 项</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '28px' }}>
        <div className="card" style={{ opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#FEF3C7', color: '#D97706' }}>即将推出</span>
          </div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>友商排名监控</h4>
          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>
            持续追踪腾讯云各产品线在 Gartner、Forrester、IDC 等报告里相对友商的排位变化
          </p>
        </div>
        <div className="card" style={{ opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#FEF3C7', color: '#D97706' }}>即将推出</span>
          </div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Market Insight</h4>
          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>
            分析师叙事、竞争信号，加上随手就能取用的素材，给市场部前台用的一线洞察
          </p>
        </div>
      </div>
    </div>
  );
}
