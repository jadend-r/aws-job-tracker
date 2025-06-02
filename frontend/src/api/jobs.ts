import axios from './axios';
import { Job } from '../types/job';

export async function getJobs(): Promise<Job[]> {
  const res = await axios.get('/jobs');
  return res.data;
}

export async function addJob(job: Omit<Job, 'jobId'>, resumeFile?: File): Promise<Job> {
  const res = await axios.post('/jobs', job);
  const savedJob = res.data;
   if (resumeFile) {
    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('jobId', savedJob.jobId); 

    await axios.post('/resumes/upload', formData);
  }
  return savedJob;
}

export async function deleteJob(id: string): Promise<void> {
  await axios.delete(`/jobs/${id}`);
}

export async function updateJobStatus(jobId: string, status: Job['status']): Promise<Job> {
  const res = await axios.patch(`/jobs/${jobId}/status`, { status });
  return res.data;
}