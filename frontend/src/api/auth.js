// file: frontend/src/api/auth.js
import axiosInstance from './axios'; // ✅ CAMBIO: axios → axiosInstance

export const authAPI = {
  // Login
  login: async (email, password) => {
    console.log('🔍 [authAPI] Llamando a /auth/login'); // 🆕 DEBUG
    const response = await axiosInstance.post('/auth/login', { email, password });
    console.log('✅ [authAPI] Respuesta login:', response.data); // 🆕 DEBUG
    return response.data;
  },

  // Registro
  register: async (userData) => {
    console.log('🔍 [authAPI] Llamando a /auth/registrar'); // 🆕 DEBUG
    const response = await axiosInstance.post('/auth/registrar', userData);
    console.log('✅ [authAPI] Respuesta registro:', response.data); // 🆕 DEBUG
    return response.data;
  },

  // Obtener perfil actual
  getProfile: async () => {
    const response = await axiosInstance.get('/auth/perfil');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};