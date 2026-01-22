import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBackups,
  getBackupStatus,
  triggerBackup,
  deleteBackup,
  downloadBackup,
  restoreBackup,
} from '@/api/backups'

export function useBackups() {
  return useQuery({
    queryKey: ['backups', 'list'],
    queryFn: getBackups,
    staleTime: 0, // Always consider data stale to ensure fresh data after mutations
  })
}

export function useBackupStatus() {
  return useQuery({
    queryKey: ['backups', 'status'],
    queryFn: getBackupStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useTriggerBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: triggerBackup,
    onSuccess: () => {
      // Invalidate both list and status queries
      queryClient.invalidateQueries({ queryKey: ['backups', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['backups', 'status'] })
    },
    onError: (error) => {
      console.error('Failed to create backup:', error)
    },
  })
}

export function useDeleteBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ backupType, filename }: { backupType: string; filename: string }) =>
      deleteBackup(backupType, filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })
}

export function useDownloadBackup() {
  const handleDownload = async (backupType: string, filename: string) => {
    const blob = await downloadBackup(backupType, filename)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return { downloadBackup: handleDownload }
}

export function useRestoreBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    // Takes the full path (e.g., "manual/backup_file.sql.gz")
    mutationFn: (backupPath: string) => restoreBackup(backupPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })
}
