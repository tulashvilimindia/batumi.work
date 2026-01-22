import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { DashboardPage } from '@/pages/DashboardPage'
import { JobsPage } from '@/pages/JobsPage'
import { ParserPage } from '@/pages/ParserPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { BackupsPage } from '@/pages/BackupsPage'
import { DatabasePage } from '@/pages/DatabasePage'
import { LogsPage } from '@/pages/LogsPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/parser" element={<ParserPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/backups" element={<BackupsPage />} />
        <Route path="/database" element={<DatabasePage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
