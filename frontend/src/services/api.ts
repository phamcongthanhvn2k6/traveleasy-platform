import axios from 'axios';
import { toast } from '../context/ToastContext';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('traveleasy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      toast.error('Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng kiểm tra kết nối mạng!', 'Lỗi Kết Nối');
    }
    return Promise.reject(error);
  }
);

export default api;
