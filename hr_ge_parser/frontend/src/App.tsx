import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import {
  Dashboard,
  Jobs,
  JobDetail,
  Companies,
  CompanyDetail,
  Analytics,
  Parser,
  ParserHistory,
  Settings,
} from '@/pages';
import { ROUTES } from '@/utils/constants';

// ============================================================
// COMPONENT
// ============================================================

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.JOBS} element={<Jobs />} />
        <Route path={ROUTES.JOB_DETAIL} element={<JobDetail />} />
        <Route path={ROUTES.COMPANIES} element={<Companies />} />
        <Route path={ROUTES.COMPANY_DETAIL} element={<CompanyDetail />} />
        <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
        <Route path={ROUTES.PARSER} element={<Parser />} />
        <Route path={ROUTES.PARSER_HISTORY} element={<ParserHistory />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
      </Routes>
    </Layout>
  );
}
