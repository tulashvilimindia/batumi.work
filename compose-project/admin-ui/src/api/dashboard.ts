import apiClient from './client'
import type { DashboardData, HealthStatus } from '@/types'

export async function getDashboardData(): Promise<DashboardData> {
  const { data } = await apiClient.get('/dashboard')
  return data
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const { data } = await apiClient.get('/health')
  return data
}
