import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// ดักจับ Request เพื่อแนบ JWT Token เข้าไปใน Header ทุกครั้ง
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;