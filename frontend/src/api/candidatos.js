// file: frontend/src/api/candidatos.js
import axiosInstance from './axios';

export const candidatosAPI = {
  /**
   * 🆕 Obtener perfil del candidato actual (usuario logueado)
   */
  obtenerPerfil: async () => {
    return await axiosInstance.get('/candidatos/me');
  },

  /**
   * 🆕 Actualizar perfil de candidato
   */
  actualizarPerfil: async (id, datos) => {
    return await axiosInstance.put(`/candidatos/${id}`, datos);
  },

  /**
   * 🆕 Obtener perfil completo con todas las relaciones
   */
  obtenerPerfilCompleto: async (id) => {
    return await axiosInstance.get(`/candidatos/${id}/perfil-completo`);
  },

  /**
   * 🆕 Buscar candidatos (solo para EMPRESA y ADMIN)
   */
  buscarCandidatos: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    return await axiosInstance.get(`/candidatos?${params}`);
  },

  // ♻️ Funciones existentes (mantener compatibilidad):
  getAll: async (filters = {}) => {
    const response = await axiosInstance.get('/candidatos', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/candidatos/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/candidatos/${id}`, data);
    return response.data;
  },

  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append('cv', file);
    const response = await axiosInstance.post('/upload/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('foto', file);
    const response = await axiosInstance.post('/upload/foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};