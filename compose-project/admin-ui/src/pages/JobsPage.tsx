import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useJobs, useCategories, useUpdateJobStatus, useDeleteJob } from '@/hooks/useJobs'
import { formatDate, truncate } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight, Trash2, Eye } from 'lucide-react'
import type { Job } from '@/types'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'expired', label: 'Expired' },
]

export function JobsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')

  const { data: jobs, isLoading, error: jobsError } = useJobs({
    page,
    page_size: 20,
    q: search || undefined,
    status: status === 'all' ? undefined : status,
    category: category === 'all' ? undefined : category,
  })
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const updateStatus = useUpdateJobStatus()
  const deleteJob = useDeleteJob()

  const handleStatusChange = (jobId: string, newStatus: string) => {
    updateStatus.mutate({ id: jobId, status: newStatus })
  }

  const handleDelete = (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteJob.mutate(jobId)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Jobs" />

      <div className="flex-1 p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="pl-9"
                  />
                </div>
              </div>

              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1) }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name_en}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Jobs {jobs?.meta && `(${jobs.meta.total} total)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : jobsError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-destructive">
                      Failed to load jobs. Please try refreshing the page.
                    </TableCell>
                  </TableRow>
                ) : jobs?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs?.data?.map((job: Job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {truncate(job.title_ge || job.title_en || 'Untitled', 40)}
                      </TableCell>
                      <TableCell>{job.company_name || '-'}</TableCell>
                      <TableCell>{job.category?.name_en || '-'}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{job.views_count}</TableCell>
                      <TableCell>{formatDate(job.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Select
                            value={job.status}
                            onValueChange={(v) => handleStatusChange(job.id, v)}
                          >
                            <SelectTrigger className="w-[100px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(job.source_url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {jobs?.meta && jobs.meta.total_pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {jobs.meta.page} of {jobs.meta.total_pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(jobs.meta.total_pages, p + 1))}
                    disabled={page === jobs.meta.total_pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
