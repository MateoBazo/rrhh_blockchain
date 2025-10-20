import axios from './axios';

export const authAPI = {
  login: async (email, password) => {
    const response = await axios.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post('/auth/registro', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get('/auth/perfil');
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};