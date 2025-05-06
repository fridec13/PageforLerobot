import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// 요청 인터셉터 – 토큰 자동 주입
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('jwt');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
