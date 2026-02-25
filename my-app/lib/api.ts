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

// Response interceptor: retry once on 429 (rate limited)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 429 && !originalRequest._retried) {
      originalRequest._retried = true;
      const retryAfter = error.response.headers['retry-after'];
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
      await new Promise(resolve => setTimeout(resolve, waitMs));
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
