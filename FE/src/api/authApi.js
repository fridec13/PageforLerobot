import api from './axios';

export const login = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  localStorage.setItem('jwt', data.token);
};
