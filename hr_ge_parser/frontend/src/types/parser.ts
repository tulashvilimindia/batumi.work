// ============================================================
// BASE TYPES
// ============================================================

export interface ParserRun {
  id: number;
  started_at: string | null;
  finished_at: string | null;
  status: string;
  jobs_found: number;
  jobs_created: number;
  jobs_updated: number;
  jobs_failed: number;
  error_message: string | null;
  run_type: string;
}

export type RunType = 'full' | 'incremental';

// ============================================================
// API TYPES
// ============================================================

export interface ParserStatusResponse {
  scheduler_running: boolean;
  next_run_time: string | null;
  interval_hours: number;
  last_run: ParserRun | null;
}

export type ParserHistoryResponse = ParserRun[];

export interface TriggerParserResponse {
  message: string;
  run_id?: number;
}
