import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add cognito auth token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
