import axios from './axios';
import { Job } from '../types/job';

export async function getJobs(): Promise<Job[]> {
  const res = await axios.get('/jobs');
  return res.data;
}

export async function addJob(job: Omit<Job, 'id'>): Promise<Job> {
  const res = await axios.post('/jobs', job);
  return res.data;
}

export async function deleteJob(id: string): Promise<void> {
  await axios.delete(`/jobs/${id}`);
}
