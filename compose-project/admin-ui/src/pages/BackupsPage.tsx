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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useBackups,
  useBackupStatus,
  useTriggerBackup,
  useDeleteBackup,
  useDownloadBackup,
  useRestoreBackup,
} from '@/hooks/useBackups'
import { formatDateTime } from '@/lib/utils'
import { useState } from 'react'
import {
  HardDrive,
  Download,
  Trash2,
  RotateCcw,
  Plus,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react'

export function BackupsPage() {
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)

  const { data: backups, isLoading } = useBackups()
  const { data: status } = useBackupStatus()
  const triggerBackup = useTriggerBackup()
  const deleteBackup = useDeleteBackup()
  const { downloadBackup } = useDownloadBackup()
  const restoreBackup = useRestoreBackup()

  const handleRestore = (filename: string) => {
    setSelectedBackup(filename)
    setRestoreDialogOpen(true)
  }

  const confirmRestore = () => {
    if (selectedBackup) {
      restoreBackup.mutate(selectedBackup)
      setRestoreDialogOpen(false)
      setSelectedBackup(null)
    }
  }

  const handleDelete = (filename: string) => {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      deleteBackup.mutate(filename)
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Backups" />

      <div className="flex-1 p-6 space-y-6">
        {/* Backup Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Backup Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Health</p>
                <div className="flex items-center gap-2">
                  {getHealthIcon(status?.health || '')}
                  <span className="font-medium capitalize">{status?.health || 'Unknown'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Backup</p>
                <p className="font-medium">
                  {status?.last_backup ? formatDateTime(status.last_backup) : 'Never'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="font-medium">{status?.total_size_mb?.toFixed(2) || 0} MB</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Backup Count</p>
                <p className="font-medium">
                  {(status?.backup_count_daily || 0) + (status?.backup_count_weekly || 0) + (status?.backup_count_manual || 0)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Button
                onClick={() => triggerBackup.mutate()}
                disabled={triggerBackup.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                {triggerBackup.isPending ? 'Creating...' : 'Create Backup'}
              </Button>

              {status?.next_scheduled && (
                <div className="flex items-center text-sm text-muted-foreground">
                  Next scheduled: {formatDateTime(status.next_scheduled)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Backups List */}
        <Card>
          <CardHeader>
            <CardTitle>Backup Files</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : backups?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No backups found
                    </TableCell>
                  </TableRow>
                ) : (
                  backups?.map((backup) => (
                    <TableRow key={backup.filename}>
                      <TableCell className="font-medium font-mono text-sm">
                        {backup.filename}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          backup.type === 'daily' ? 'default' :
                          backup.type === 'weekly' ? 'secondary' : 'outline'
                        }>
                          {backup.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{backup.size_mb?.toFixed(2)} MB</TableCell>
                      <TableCell>{formatDateTime(backup.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadBackup(backup.filename)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRestore(backup.filename)}
                            title="Restore"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(backup.filename)}
                            className="text-destructive"
                            title="Delete"
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
          </CardContent>
        </Card>
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Restore</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore from <strong>{selectedBackup}</strong>?
              This will overwrite all current data in the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRestore}
              disabled={restoreBackup.isPending}
            >
              {restoreBackup.isPending ? 'Restoring...' : 'Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
