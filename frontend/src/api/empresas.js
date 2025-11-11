// file: frontend/src/api/empresas.js

import axiosInstance from './axios';

export const empresasAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/empresas');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/empresas/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/empresas/${id}`, data);
    return response.data;
  },

  // ============================================
  // 🆕 FUNCIONES S008.3 - REFERENCIAS VERIFICADAS
  // ============================================

  /**
   * Obtener referencias verificadas de un candidato
   * Solo empresas pueden acceder
   */
  obtenerReferenciasVerificadas: async (candidatoId) => {
    try {
      const response = await axiosInstance.get(`/referencias/candidatos/${candidatoId}/verificadas`);
      return response.data;
    } catch (error) {
      console.error('Error obtenerReferenciasVerificadas:', error);
      throw error.response?.data || { mensaje: 'Error al obtener referencias verificadas' };
    }
  },

  /**
   * Registrar acceso de empresa a referencia
   * Crea log de auditoría y envía notificación
   */
  registrarAccesoReferencia: async (referenciaId, data) => {
    try {
      const response = await axiosInstance.post(`/referencias/${referenciaId}/registrar-acceso`, data);
      return response.data;
    } catch (error) {
      console.error('Error registrarAccesoReferencia:', error);
      throw error.response?.data || { mensaje: 'Error al registrar acceso a referencia' };
    }
  },
};