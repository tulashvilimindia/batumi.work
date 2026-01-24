import { apiClient } from './client';
import type {
  Job,
  JobsResponse,
  JobFilters,
  Company,
  CompaniesResponse,
  CompanyFilters,
  DashboardStats,
  LocationStatsResponse,
  SalaryStats,
  ParserStatusResponse,
  ParserHistoryResponse,
  TriggerParserResponse,
  RunType,
} from '@/types';

// ============================================================
// JOBS API
// ============================================================

export const jobsApi = {
  getJobs: async (filters: JobFilters = {}): Promise<JobsResponse> => {
    const { data } = await apiClient.get('/api/v1/jobs', { params: filters });
    return data;
  },

  getJob: async (id: number): Promise<Job> => {
    const { data } = await apiClient.get(`/api/v1/jobs/${id}`);
    return data;
  },

  getLatestJobs: async (limit: number = 10): Promise<Job[]> => {
    const { data } = await apiClient.get('/api/v1/jobs/latest', { params: { limit } });
    return data;
  },

  searchJobs: async (query: string, page: number = 1): Promise<JobsResponse> => {
    const { data } = await apiClient.get('/api/v1/jobs/search', { params: { q: query, page } });
    return data;
  },
};

// ============================================================
// COMPANIES API
// ============================================================

export const companiesApi = {
  getCompanies: async (filters: CompanyFilters = {}): Promise<CompaniesResponse> => {
    const { data } = await apiClient.get('/api/v1/companies', { params: filters });
    return data;
  },

  getCompany: async (id: number): Promise<Company> => {
    const { data } = await apiClient.get(`/api/v1/companies/${id}`);
    return data;
  },

  getCompanyJobs: async (id: number, page: number = 1): Promise<JobsResponse> => {
    const { data } = await apiClient.get(`/api/v1/companies/${id}/jobs`, { params: { page } });
    return data;
  },
};

// ============================================================
// STATS API
// ============================================================

export const statsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/api/v1/stats');
    return data;
  },

  getLocationStats: async (): Promise<LocationStatsResponse> => {
    const { data } = await apiClient.get('/api/v1/stats/by-location');
    return data;
  },

  getSalaryStats: async (): Promise<SalaryStats> => {
    const { data } = await apiClient.get('/api/v1/stats/salary');
    return data;
  },
};

// ============================================================
// PARSER API
// ============================================================

export const parserApi = {
  getStatus: async (): Promise<ParserStatusResponse> => {
    const { data } = await apiClient.get('/api/v1/parser/status');
    return data;
  },

  getHistory: async (page: number = 1): Promise<ParserHistoryResponse> => {
    const { data } = await apiClient.get('/api/v1/parser/history', { params: { page } });
    return data;
  },

  triggerRun: async (runType: RunType = 'incremental'): Promise<TriggerParserResponse> => {
    const { data } = await apiClient.post('/api/v1/parser/run', { run_type: runType });
    return data;
  },
};
