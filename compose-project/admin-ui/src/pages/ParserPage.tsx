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
import { useParserConfig, useParseJobs, useParserProgress, useParserStats, useTriggerParser, useControlJob } from '@/hooks/useParser'
import { formatDateTime } from '@/lib/utils'
import { Bot, RefreshCw, CheckCircle, XCircle, Clock, Pause, Play, Square, RotateCcw, AlertCircle } from 'lucide-react'
import type { ParseJob } from '@/types'

export function ParserPage() {
  const { data: config, isLoading: configLoading, error: configError } = useParserConfig()
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useParseJobs(20)
  const { data: progress, error: progressError } = useParserProgress()
  const { data: stats, error: statsError } = useParserStats()
  const triggerParser = useTriggerParser()
  const controlJob = useControlJob()

  // Debug: Log any errors
  if (configError) console.error('Config error:', configError)
  if (jobsError) console.error('Jobs error:', jobsError)
  if (progressError) console.error('Progress error:', progressError)
  if (statsError) console.error('Stats error:', statsError)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
      case 'running':
        return <Badge variant="warning"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Running</Badge>
      case 'paused':
        return <Badge variant="secondary"><Pause className="h-3 w-3 mr-1" /> Paused</Badge>
      case 'stopping':
        return <Badge variant="warning"><Square className="h-3 w-3 mr-1" /> Stopping</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleControl = (jobId: string, action: 'pause' | 'resume' | 'stop' | 'cancel' | 'restart') => {
    controlJob.mutate({ jobId, action })
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Parser" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Error Banner */}
        {(configError || jobsError || statsError) && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>Some data failed to load. Please refresh the page.</span>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <Badge variant={progress?.running ? 'warning' : 'success'}>
                    {progress?.running ? 'Running' : 'Idle'}
                  </Badge>
                </div>
                {progress?.running && progress.jobs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Current:</span>
                    <span className="text-sm">
                      {progress.jobs[0].scope.region || 'all regions'} - {progress.jobs[0].progress.percentage}%
                    </span>
                  </div>
                )}
                {stats?.last_parsed && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Last Parsed:</span>
                    <span className="text-sm">{formatDateTime(stats.last_parsed)}</span>
                  </div>
                )}
                {stats && (
                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-sm">
                      <span className="text-muted-foreground">Total Jobs:</span> {stats.total_jobs.toLocaleString()}
                    </span>
                    <span className="text-sm">
                      <span className="text-muted-foreground">Parsed Today:</span> {stats.parsed_today}
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => triggerParser.mutate(undefined)}
                disabled={triggerParser.isPending || progress?.running}
                size="lg"
              >
                {triggerParser.isPending || progress?.running ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4 mr-2" />
                )}
                Trigger Parser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Parser Regions */}
        <Card>
          <CardHeader>
            <CardTitle>Parser Regions</CardTitle>
          </CardHeader>
          <CardContent>
            {configLoading ? (
              <p className="text-muted-foreground">Loading regions...</p>
            ) : !config?.regions?.length ? (
              <p className="text-muted-foreground">No regions configured</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {config.regions.map((region) => (
                  <Card key={region.id} className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{region.name_en}</h4>
                        <Badge variant={region.enabled ? 'success' : 'secondary'} className="text-xs">
                          {region.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{region.name_ge}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Running Jobs */}
        {progress?.running && progress.jobs.length > 0 && (
          <Card className="border-warning/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Running Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progress.jobs.map((job) => (
                  <div key={job.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <span className="text-sm font-medium">{job.scope.region || 'All Regions'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.controls?.can_pause && (
                          <Button size="sm" variant="outline" onClick={() => handleControl(job.id, 'pause')}>
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        {job.controls?.can_resume && (
                          <Button size="sm" variant="outline" onClick={() => handleControl(job.id, 'resume')}>
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        {job.controls?.can_stop && (
                          <Button size="sm" variant="destructive" onClick={() => handleControl(job.id, 'stop')}>
                            <Square className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${job.progress.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{job.progress.processed} / {job.progress.total} processed</span>
                      <span className="text-green-500">+{job.progress.new} new</span>
                      <span className="text-blue-500">{job.progress.updated} updated</span>
                      <span>{job.progress.skipped} skipped</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parse Job History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Parse Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : !jobsData?.jobs?.length ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No parse jobs yet
                    </TableCell>
                  </TableRow>
                ) : (
                  jobsData.jobs.map((job: ParseJob) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.scope.region || 'All'}</TableCell>
                      <TableCell>{job.timing.started_at ? formatDateTime(job.timing.started_at) : '-'}</TableCell>
                      <TableCell>
                        {job.timing.completed_at ? formatDateTime(job.timing.completed_at) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{job.progress.percentage}%</TableCell>
                      <TableCell className="text-green-500">+{job.progress.new}</TableCell>
                      <TableCell className="text-blue-500">{job.progress.updated}</TableCell>
                      <TableCell>
                        {job.controls?.can_restart && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleControl(job.id, 'restart')}
                            disabled={controlJob.isPending}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 7-Day Statistics */}
        {stats?.parse_jobs_7d && (
          <Card>
            <CardHeader>
              <CardTitle>7-Day Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats.parse_jobs_7d.total}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-500">{stats.parse_jobs_7d.completed}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">New Items</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.parse_jobs_7d.new_items}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Updated Items</p>
                  <p className="text-2xl font-bold text-purple-500">{stats.parse_jobs_7d.updated_items}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
