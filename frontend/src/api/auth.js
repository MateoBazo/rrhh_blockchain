// file: src/api/auth.js
import axios from './axios';

export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await axios.post('/auth/login', { email, password });
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await axios.post('/auth/registrar', userData);
    return response.data;
  },

  // Obtener perfil actual
  getProfile: async () => {
    const response = await axios.get('/auth/perfil');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};