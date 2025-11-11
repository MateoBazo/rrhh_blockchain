// file: frontend/src/api/candidatos.js
import axiosInstance from './axios';

export const candidatosAPI = {
    /**
   * 🆕 S008.3 - Obtener candidatos con referencias verificadas (para empresas)
   */
  getCandidatosConReferenciasVerificadas: async () => {
    const response = await axiosInstance.get('/candidatos/con-referencias-verificadas');
    return response.data;
  },

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

  /**
   * 🆕 UPLOAD FOTO DE PERFIL
   */
  uploadFoto: async (formData) => {
    return await axiosInstance.post('/upload/foto', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 🆕 ELIMINAR FOTO DE PERFIL
   */
  eliminarFoto: async () => {
    return await axiosInstance.delete('/upload/foto');
  },

  /**
   * 🆕 UPLOAD CV
   */
  uploadCV: async (formData) => {
    return await axiosInstance.post('/upload/cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Funciones existentes (mantener compatibilidad)
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
  }
};