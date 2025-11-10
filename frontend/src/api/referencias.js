// file: frontend/src/api/referencias.js

/**
 * API SERVICE: Referencias
 * Comunicación con backend /api/referencias
 */

import api from './axios';

export const referenciasAPI = {
  /**
   * Obtener referencias de un candidato
   */
  obtenerReferencias: async (candidatoId) => {
    return api.get(`/referencias?candidato_id=${candidatoId}`);
  },

  /**
   * Crear nueva referencia
   */
  crear: async (data) => {
    return api.post('/referencias', data);
  },

  /**
   * Obtener referencia por ID
   */
  obtenerPorId: async (id) => {
    return api.get(`/referencias/${id}`);
  },

  /**
   * Actualizar referencia
   */
  actualizar: async (id, data) => {
    return api.put(`/referencias/${id}`, data);
  },

  /**
   * Eliminar referencia
   */
  eliminar: async (id) => {
    return api.delete(`/referencias/${id}`);
  },

  // 🆕 NUEVOS MÉTODOS S008.2 - VERIFICACIÓN

  /**
   * Enviar email de verificación
   */
  enviarVerificacion: async (id) => {
    return api.post(`/referencias/${id}/enviar-verificacion`);
  },

  /**
   * Verificar referencia con token (sin autenticación)
   */
  verificarReferencia: async (token) => {
    // Usar axios directamente sin interceptor de auth
    const axios = (await import('axios')).default;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return axios.get(`${API_URL}/api/referencias/verificar/${token}`);
  }
};