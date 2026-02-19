import axios from 'axios';

// Load the base URL from the environment variable
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Interceptor to include the authorization token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // Replace with your token retrieval method
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
