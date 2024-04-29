// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://intelli-python-backend.onrender.com',
});

export default api;