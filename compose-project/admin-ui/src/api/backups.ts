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
    path: b.path,  // Store the full path (e.g., "manual/backup_file.sql.gz")
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

export async function triggerBackup(): Promise<{ success: boolean; name: string; path: string; size_mb: number }> {
  // Backend endpoint is POST /backups (not /backups/trigger)
  const { data } = await apiClient.post('/backups')
  return data
}

export async function deleteBackup(backupType: string, filename: string): Promise<void> {
  // Backend expects: DELETE /backups/{backup_type}/{filename}
  await apiClient.delete(`/backups/${encodeURIComponent(backupType)}/${encodeURIComponent(filename)}`)
}

export async function downloadBackup(backupType: string, filename: string): Promise<Blob> {
  // Backend expects: GET /backups/{backup_type}/{filename}
  const { data } = await apiClient.get(`/backups/${encodeURIComponent(backupType)}/${encodeURIComponent(filename)}`, {
    responseType: 'blob',
  })
  return data
}

export async function restoreBackup(backupPath: string): Promise<{ success: boolean; message: string }> {
  // Backend expects: POST /backups/restore with { filename: "type/filename.sql.gz" }
  const { data } = await apiClient.post('/backups/restore', { filename: backupPath })
  return data
}
