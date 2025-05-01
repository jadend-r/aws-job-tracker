import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// // Optional: Add interceptors for auth, error logging, etc.
// instance.interceptors.response.use(
//   res => res,
//   err => {
//     console.error('API error:', err.response?.data || err.message);
//     return Promise.reject(err);
//   }
// );

export default instance;
