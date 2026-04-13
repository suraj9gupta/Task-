import axios from 'axios';
import { authStore } from '../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
});

api.interceptors.request.use((config) => {
  const { token, apiKey, apiSecret } = authStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (apiKey) config.headers['x-api-key'] = apiKey;
  if (apiSecret) config.headers['x-api-secret'] = apiSecret;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) console.error('Unauthorized. Please login again.');
    if (error.response?.status === 429) console.error('Rate limit exceeded. Upgrade plan or retry later.');
    return Promise.reject(error);
  },
);
