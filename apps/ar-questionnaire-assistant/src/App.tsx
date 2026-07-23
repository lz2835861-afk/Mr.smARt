import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import QuestionnairePage from './pages/QuestionnairePage';
import KnowledgePage from './pages/KnowledgePage';
import ReportsPage from './pages/ReportsPage';
import ResourcesPage from './pages/ResourcesPage';
import KeywordMatrixPage from './pages/KeywordMatrixPage';
import { AccessGate } from './lib/accessGate';
import './App.css';

export default function App() {
  return (
    <AccessGate>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="questionnaire" element={<QuestionnairePage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="keywords" element={<KeywordMatrixPage />} />
            <Route path="knowledge" element={<KnowledgePage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AccessGate>
  );
}
