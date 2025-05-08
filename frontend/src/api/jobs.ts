import axios from './axios';
import { Job } from '../types/job';

export async function getJobs(): Promise<Job[]> {
  const res = await axios.get('/jobs');
  return res.data;
}

export async function addJob(job: Omit<Job, 'jobId'>): Promise<Job> {
  const res = await axios.post('/jobs', job);
  return res.data;
}

export async function deleteJob(id: string): Promise<void> {
  await axios.delete(`/jobs/${id}`);
}

export async function updateJobStatus(jobId: string, status: Job['status']): Promise<Job> {
  const res = await axios.patch(`/jobs/${jobId}/status`, { status });
  return res.data;
}