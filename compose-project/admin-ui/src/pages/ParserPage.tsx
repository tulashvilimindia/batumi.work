import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useParserSources, useParserRuns, useParserStatus, useTriggerParser } from '@/hooks/useParser'
import { formatDateTime } from '@/lib/utils'
import { Bot, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'

export function ParserPage() {
  const { data: sources, isLoading: sourcesLoading } = useParserSources()
  const { data: runs, isLoading: runsLoading } = useParserRuns(20)
  const { data: status } = useParserStatus()
  const triggerParser = useTriggerParser()

  const getStatusBadge = (runStatus: string) => {
    switch (runStatus) {
      case 'completed':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
      case 'running':
        return <Badge variant="warning"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Running</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>
      default:
        return <Badge variant="outline">{runStatus}</Badge>
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Parser" />

      <div className="flex-1 p-6 space-y-6">
        {/* Parser Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Parser Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={status?.is_running ? 'warning' : 'success'}>
                    {status?.is_running ? 'Running' : 'Idle'}
                  </Badge>
                </div>
                {status?.current_source && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Current Source:</span>
                    <span className="text-sm">{status.current_source}</span>
                  </div>
                )}
                {status?.last_run && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Last Run:</span>
                    <span className="text-sm">{formatDateTime(status.last_run.started_at)}</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => triggerParser.mutate(undefined)}
                disabled={triggerParser.isPending || status?.is_running}
                size="lg"
              >
                {triggerParser.isPending || status?.is_running ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4 mr-2" />
                )}
                Trigger Parser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Parser Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Parser Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {sourcesLoading ? (
              <p className="text-muted-foreground">Loading sources...</p>
            ) : sources?.length === 0 ? (
              <p className="text-muted-foreground">No parser sources configured</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources?.map((source) => (
                  <Card key={source.id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{source.name}</h4>
                        <Badge variant={source.is_enabled ? 'success' : 'secondary'}>
                          {source.is_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Slug: {source.slug}</p>
                        <p>Total Parsed: {source.total_jobs_parsed}</p>
                        {source.last_run_at && (
                          <p>Last Run: {formatDateTime(source.last_run_at)}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => triggerParser.mutate(source.slug)}
                        disabled={!source.is_enabled || triggerParser.isPending}
                      >
                        Parse {source.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parser Runs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Finished</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Found</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : runs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No parser runs yet
                    </TableCell>
                  </TableRow>
                ) : (
                  runs?.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.source}</TableCell>
                      <TableCell>{formatDateTime(run.started_at)}</TableCell>
                      <TableCell>
                        {run.finished_at ? formatDateTime(run.finished_at) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell>{run.jobs_found}</TableCell>
                      <TableCell className="text-green-500">+{run.jobs_created}</TableCell>
                      <TableCell className="text-blue-500">{run.jobs_updated}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
