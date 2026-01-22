import apiClient from './client'
import type { Backup, BackupStatus } from '@/types'

export async function getBackups(): Promise<Backup[]> {
  const { data } = await apiClient.get('/backups')
  return data
}

export async function getBackupStatus(): Promise<BackupStatus> {
  const { data } = await apiClient.get('/backups/status')
  return data
}

export async function triggerBackup(): Promise<{ message: string; filename: string }> {
  const { data } = await apiClient.post('/backups/trigger')
  return data
}

export async function deleteBackup(filename: string): Promise<void> {
  await apiClient.delete(`/backups/${filename}`)
}

export async function downloadBackup(filename: string): Promise<Blob> {
  const { data } = await apiClient.get(`/backups/${filename}`, {
    responseType: 'blob',
  })
  return data
}

export async function restoreBackup(filename: string): Promise<{ message: string }> {
  const { data } = await apiClient.post('/backups/restore', { filename })
  return data
}
