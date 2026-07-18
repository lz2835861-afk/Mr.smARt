import { useState } from 'react';
import { reports, products } from '../data/mockData';
import type { AnalystFirm, ReportStatus } from '../types';
import { Filter, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function ReportsPage() {
  const [filterFirm, setFilterFirm] = useState<AnalystFirm | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');

  const productMap = new Map(products.map(p => [p.id, p]));

  const filteredReports = reports.filter(r => {
    if (filterFirm !== 'all' && r.firm !== filterFirm) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const firms: AnalystFirm[] = ['Gartner', 'Forrester', 'IDC', 'Omdia'];
  const statuses: ReportStatus[] = ['问卷中', '评审中', 'Briefing', '已完成'];

  const firmClass = (firm: string) => {
    const map: Record<string, string> = { 'Gartner': 'gartner', 'Forrester': 'forrester', 'IDC': 'idc', 'Omdia': 'omdia' };
    return map[firm] || '';
  };

  const statusClass = (status: string) => {
    const map: Record<string, string> = { '问卷中': 'status-questionnaire', '评审中': 'status-reviewing', 'Briefing': 'status-briefing', '已完成': 'status-completed' };
    return map[status] || '';
  };

  const statusIcon = (status: ReportStatus) => {
    const map: Record<ReportStatus, JSX.Element> = {
      '问卷中': <FileText size={14} />,
      '评审中': <Clock size={14} />,
      'Briefing': <AlertCircle size={14} />,
      '已完成': <CheckCircle size={14} />,
    };
    return map[status];
  };

  return (
    <div className="page-container">
      <h2 className="page-title">报告追踪</h2>
      <p className="page-subtitle">
        追踪所有参与的分析师报告状态和进度
      </p>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '8px', textTransform: 'uppercase' }}>分析师机构</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm${filterFirm === 'all' ? ' btn-primary' : ''}`}
                onClick={() => setFilterFirm('all')}
              >全部</button>
              {firms.map(firm => (
                <button
                  key={firm}
                  className={`btn btn-sm${filterFirm === firm ? ' btn-primary' : ''}`}
                  onClick={() => setFilterFirm(firm)}
                >{firm}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', marginBottom: '8px', textTransform: 'uppercase' }}>状态</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm${filterStatus === 'all' ? ' btn-primary' : ''}`}
                onClick={() => setFilterStatus('all')}
              >全部</button>
              {statuses.map(status => (
                <button
                  key={status}
                  className={`btn btn-sm${filterStatus === status ? ' btn-primary' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >{status}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="reports-table">
          <thead>
            <tr>
              <th>产品</th>
              <th>报告</th>
              <th>机构</th>
              <th>状态</th>
              <th>进度</th>
              <th>截止日期</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => {
              const product = productMap.get(report.productId);
              return (
                <tr key={report.id} className="report-row">
                  <td>
                    {product && (
                      <div className="report-product-cell">
                        <div className="report-product-icon" style={{ background: product.color + '15' }}>
                          {product.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{product.name}</div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{product.description}</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{report.type}</span>
                    <span style={{ color: '#6B7280' }}> · {report.name}</span>
                  </td>
                  <td>
                    <span className={`firm-badge ${firmClass(report.firm)}`}>{report.firm}</span>
                  </td>
                  <td>
                    <span className={`report-item-status ${statusClass(report.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {statusIcon(report.status)}
                      {report.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="progress-bar" style={{ width: '120px' }}>
                        <div className="progress-fill" style={{ width: `${report.progress}%` }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>{report.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>{report.deadline}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>无匹配报告</h3>
            <p>调整筛选条件查看其他报告</p>
          </div>
        )}
      </div>
    </div>
  );
}
