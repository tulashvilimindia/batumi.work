import apiClient from './client'
import type { Backup, BackupStatus } from '@/types'

interface BackupApiResponse {
  name: string
  path: string
  type: string
  size_mb: number
  created_at: string
}

export async function getBackups(): Promise<Backup[]> {
  const { data } = await apiClient.get('/backups')
  // Map API response to match frontend type
  return (data.backups || []).map((b: BackupApiResponse) => ({
    filename: b.name,
    size_bytes: Math.round(b.size_mb * 1024 * 1024),
    size_mb: b.size_mb,
    created_at: b.created_at,
    type: b.type as 'daily' | 'weekly' | 'manual',
  }))
}

export async function getBackupStatus(): Promise<BackupStatus> {
  const { data } = await apiClient.get('/backups/status')
  // Map API response to match frontend type
  return {
    last_backup: data.latest?.created_at,
    last_backup_size_mb: data.latest?.size_mb,
    backup_count_daily: 0,
    backup_count_weekly: 0,
    backup_count_manual: data.count || 0,
    total_size_mb: data.total_size_mb || 0,
    health: data.health as 'healthy' | 'warning' | 'error',
    next_scheduled: undefined,
  }
}

export async function triggerBackup(): Promise<{ message: string; filename: string }> {
  const { data } = await apiClient.post('/backups/trigger')
  return data
}

export async function deleteBackup(filename: string): Promise<void> {
  await apiClient.delete(`/backups/${encodeURIComponent(filename)}`)
}

export async function downloadBackup(filename: string): Promise<Blob> {
  const { data } = await apiClient.get(`/backups/download/${encodeURIComponent(filename)}`, {
    responseType: 'blob',
  })
  return data
}

export async function restoreBackup(filename: string): Promise<{ message: string }> {
  const { data } = await apiClient.post('/backups/restore', { filename })
  return data
}
