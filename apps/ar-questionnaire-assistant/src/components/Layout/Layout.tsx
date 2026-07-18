import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Search, BarChart3, Library, Tag, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘', end: true },
  { to: '/questionnaire', icon: FileText, label: '问卷填写', badge: 3 },
  { to: '/resources', icon: Library, label: '资源中心' },
  { to: '/keywords', icon: Tag, label: '关键词矩阵' },
  { to: '/knowledge', icon: Search, label: '知识库' },
  { to: '/reports', icon: BarChart3, label: '报告追踪' },
];

export default function Layout() {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/') return '仪表盘';
    if (location.pathname.startsWith('/questionnaire')) return '问卷填写';
    if (location.pathname.startsWith('/resources')) return '资源中心';
    if (location.pathname.startsWith('/keywords')) return '关键词矩阵';
    if (location.pathname.startsWith('/knowledge')) return '知识库';
    if (location.pathname.startsWith('/reports')) return '报告追踪';
    return '';
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">AR</div>
          <div>
            <div className="sidebar-logo-text">Mr.smARt</div>
            <div className="sidebar-logo-sub">AR 问卷助手</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">主导航</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}

          <div className="nav-section">设置</div>
          <button className="nav-item">
            <Settings />
            <span>知识源管理</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-item">
            <span className="dot" />
            <span>乐享知识库 · 已连接</span>
          </div>
          <div className="sidebar-footer-item">
            <span className="dot" />
            <span>云知 · 已连接</span>
          </div>
          <div className="sidebar-footer-item">
            <span className="dot" />
            <span>公众号 · 已连接</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h1 className="header-title">{getPageTitle()}</h1>
          <div className="header-actions">
            <div className="header-search">
              <Search size={15} />
              <input type="text" placeholder="搜索知识库、问卷、报告..." />
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
