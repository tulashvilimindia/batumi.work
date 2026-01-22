import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLogs, useServices } from '@/hooks/useLogs'
import { ScrollText, RefreshCw, Search, Pause, Play } from 'lucide-react'

const LOG_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'debug', label: 'Debug' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
]

export function LogsPage() {
  const [service, setService] = useState('admin')
  const [level, setLevel] = useState('')
  const [search, setSearch] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const { data: services } = useServices()
  const { data: logs, isLoading, refetch } = useLogs(
    {
      service: service || 'admin',
      level: level || undefined,
      search: search || undefined,
      limit: 200,
    },
    autoRefresh
  )

  const getLevelBadge = (logLevel: string) => {
    switch (logLevel) {
      case 'error':
        return <Badge variant="destructive">ERROR</Badge>
      case 'warning':
        return <Badge variant="warning">WARN</Badge>
      case 'info':
        return <Badge variant="default">INFO</Badge>
      case 'debug':
        return <Badge variant="secondary">DEBUG</Badge>
      default:
        return <Badge variant="outline">{logLevel}</Badge>
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Logs" />

      <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={service} onValueChange={setService}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Services</SelectItem>
                  {services?.map((svc) => (
                    <SelectItem key={svc} value={svc}>
                      {svc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {LOG_LEVELS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {autoRefresh ? 'Stop' : 'Auto'}
              </Button>

              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Viewer */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ScrollText className="h-5 w-5" />
              Log Output
              {autoRefresh && (
                <Badge variant="default" className="ml-2">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Live
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full overflow-auto bg-black/50 font-mono text-xs">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading logs...
                </div>
              ) : logs?.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No logs found
                </div>
              ) : (
                <div className="p-4 space-y-1">
                  {logs?.map((log, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-1 rounded hover:bg-white/5 ${
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warning' ? 'text-yellow-400' :
                        log.level === 'debug' ? 'text-gray-500' :
                        'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="w-16">{getLevelBadge(log.level)}</span>
                      {log.service && (
                        <span className="text-blue-400 whitespace-nowrap">
                          [{log.service}]
                        </span>
                      )}
                      <span className="flex-1 break-all">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
