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
  }
};