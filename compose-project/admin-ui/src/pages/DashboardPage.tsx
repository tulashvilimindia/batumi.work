import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDashboardStats, useHealthStatus } from '@/hooks/useDashboard'
import { useParserStatus, useTriggerParser } from '@/hooks/useParser'
import { formatNumber } from '@/lib/utils'
import {
  Briefcase,
  CheckCircle,
  DollarSign,
  Eye,
  Bot,
  Database,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: health } = useHealthStatus()
  const { data: parserStatus } = useParserStatus()
  const triggerParser = useTriggerParser()

  const statsCards = [
    {
      title: 'Total Jobs',
      value: stats?.total_jobs ?? 0,
      icon: Briefcase,
      color: 'text-blue-500',
    },
    {
      title: 'Active Jobs',
      value: stats?.active_jobs ?? 0,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Jobs with Salary',
      value: stats?.jobs_with_salary ?? 0,
      icon: DollarSign,
      color: 'text-yellow-500',
    },
    {
      title: 'Total Views',
      value: stats?.total_views ?? 0,
      icon: Eye,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold">
                      {statsLoading ? '...' : formatNumber(card.value)}
                    </p>
                  </div>
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <Badge variant={health?.status === 'healthy' ? 'success' : 'destructive'}>
                  {health?.status || 'Unknown'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant={health?.database === 'connected' ? 'success' : 'destructive'}>
                  {health?.database || 'Unknown'}
                </Badge>
              </div>
              {health?.version && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Version</span>
                  <span className="text-sm text-muted-foreground">{health.version}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parser Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Parser Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={parserStatus?.is_running ? 'warning' : 'success'}>
                  {parserStatus?.is_running ? 'Running' : 'Idle'}
                </Badge>
              </div>
              {parserStatus?.current_source && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Source</span>
                  <span className="text-sm text-muted-foreground">
                    {parserStatus.current_source}
                  </span>
                </div>
              )}
              {parserStatus?.last_run && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Run</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(parserStatus.last_run.started_at).toLocaleString()}
                  </span>
                </div>
              )}
              <Button
                onClick={() => triggerParser.mutate(undefined)}
                disabled={triggerParser.isPending || parserStatus?.is_running}
                className="w-full"
              >
                {triggerParser.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4 mr-2" />
                )}
                Trigger Parser
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild>
                <a href="/jobs">Manage Jobs</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/analytics">View Analytics</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/backups">Manage Backups</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/logs">View Logs</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-400">React Admin Dashboard</p>
              <p className="text-xs text-muted-foreground">
                This is the new React-based admin interface running on port 9001.
                The original Alpine.js admin is still available at /admin/.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
