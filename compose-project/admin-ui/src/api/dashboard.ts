import apiClient from './client'
import type { DashboardStats, HealthStatus } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get('/dashboard')
  return data
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const { data } = await apiClient.get('/health')
  return data
}
