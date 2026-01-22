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
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })
}

export function useDeleteBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (filename: string) => deleteBackup(filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })
}

export function useDownloadBackup() {
  const handleDownload = async (filename: string) => {
    const blob = await downloadBackup(filename)
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
    mutationFn: (filename: string) => restoreBackup(filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
    },
  })
}
