import axios from 'axios';
import { API_BASE_URL } from './endpoints';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor tự động gắn JWT Bearer Token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor xử lý lỗi chung
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Đã xảy ra lỗi kết nối máy chủ.';
    return Promise.reject(new Error(message));
  }
);
