export type JobStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed";

export interface Job {
  job_id: string;
  status: JobStatus;
  filename: string;
  created_at: string; // ISO date string from backend
}

export interface JobResponse {
  job_id: string;
  status: JobStatus;
  filename: string;
  created_at: string;
}
