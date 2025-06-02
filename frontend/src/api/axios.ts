import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE
});

// Request interceptor to add cognito auth token
instance.interceptors.request.use(async (config) => {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
