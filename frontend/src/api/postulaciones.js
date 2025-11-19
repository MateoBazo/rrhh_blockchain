// file: frontend/src/api/postulaciones.js

/**
 * 📬 API SERVICE: Postulaciones (S009.3-S009.6)
 * Sistema completo de postulaciones con scoring automático
 * 
 * FSM Estados:
 * postulado → revisado → preseleccionado → entrevista → contratado
 *                                                      ↘ rechazado
 *                                       ↘ retirado (candidato)
 * 
 * Endpoints disponibles:
 * - POST   /postulaciones                  : Postular a vacante (scoring automático)
 * - GET    /postulaciones/candidato/:id    : Mis postulaciones (CANDIDATO)
 * - GET    /postulaciones/vacante/:id      : Postulaciones vacante (EMPRESA)
 * - GET    /postulaciones/:id              : Detalle postulación
 * - PATCH  /postulaciones/:id/estado       : Cambiar estado (EMPRESA)
 * - PATCH  /postulaciones/:id/retirar      : Retirar postulación (CANDIDATO)
 * - DELETE /postulaciones/:id              : Eliminar postulación
 */

import axiosInstance from './axios';

export const postulacionesAPI = {
  /**
   * 🆕 Postular a vacante
   * Backend calcula automáticamente:
   * - score_compatibilidad (0-100)
   * - desglose_scoring (habilidades, experiencia, educación, ubicación)
   * - ranking_posicion (entre postulantes de esa vacante)
   * 
   * @param {Object} data - Datos de la postulación
   * @param {number} data.vacante_id - ID de la vacante
   * @param {string} data.carta_presentacion - Carta de presentación (opcional)
   * @param {File} data.cv_postulacion - CV específico para esta postulación (opcional)
   * 
   * @returns {Promise<Object>} { postulacion, score_compatibilidad, desglose_scoring }
   */
  postular: async (data) => {
    console.log('🔍 [postulacionesAPI] Postulando a vacante:', data);
    
    // Si hay archivo CV, usar FormData
    if (data.cv_postulacion instanceof File) {
      const formData = new FormData();
      formData.append('vacante_id', data.vacante_id);
      formData.append('carta_presentacion', data.carta_presentacion || '');
      formData.append('cv_postulacion', data.cv_postulacion);
      
      return await axiosInstance.post('/postulaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    // Sin archivo, JSON normal
    return await axiosInstance.post('/postulaciones', data);
  },

  /**
   * 🆕 Obtener mis postulaciones (CANDIDATO)
   * 
   * @param {number} candidatoId - ID del candidato (opcional, usa JWT si no se pasa)
   * @param {Object} filtros - Filtros opcionales
   * @param {string} filtros.estado - Filtrar por estado
   * @param {number} filtros.pagina - Página actual
   * @param {number} filtros.limite - Límite por página
   * @param {string} filtros.ordenar - Campo para ordenar (default: fecha_postulacion DESC)
   * 
   * @returns {Promise<Object>} { postulaciones: [], total, pagina, limite }
   */
  obtenerMisPostulaciones: async (candidatoId = null, filtros = {}) => {
    const url = candidatoId 
      ? `/postulaciones/candidato/${candidatoId}`
      : '/postulaciones/candidato/me'; // Backend usa JWT para obtener candidato_id
    
    console.log('🔍 [postulacionesAPI] Obteniendo mis postulaciones');
    return await axiosInstance.get(url, { params: filtros });
  },

  /**
   * 🆕 Obtener postulaciones de una vacante (EMPRESA)
   * Solo la empresa propietaria de la vacante puede ver postulaciones
   * 
   * @param {number} vacanteId - ID de la vacante
   * @param {Object} filtros - Filtros opcionales
   * @param {string} filtros.estado - Filtrar por estado
   * @param {number} filtros.score_min - Score mínimo de compatibilidad
   * @param {number} filtros.pagina - Página actual
   * @param {number} filtros.limite - Límite por página
   * @param {string} filtros.ordenar - 'score' | 'fecha' (default: score DESC)
   * 
   * @returns {Promise<Object>} { postulaciones: [], total, estadisticas }
   */
  obtenerPorVacante: async (vacanteId, filtros = {}) => {
    console.log('🔍 [postulacionesAPI] Obteniendo postulaciones de vacante:', vacanteId);
    return await axiosInstance.get(`/postulaciones/vacante/${vacanteId}`, { params: filtros });
  },

  /**
   * 🆕 Obtener detalle completo de postulación
   * Incluye: candidato, vacante, desglose_scoring, timeline de estados
   * 
   * @param {number} id - ID de la postulación
   * @returns {Promise<Object>} Postulación completa
   */
  obtenerPorId: async (id) => {
    console.log('🔍 [postulacionesAPI] Obteniendo postulación ID:', id);
    return await axiosInstance.get(`/postulaciones/${id}`);
  },

  /**
   * 🆕 Cambiar estado de postulación (EMPRESA)
   * Backend valida transiciones FSM válidas
   * 
   * Estados válidos:
   * - postulado → revisado
   * - revisado → preseleccionado | rechazado
   * - preseleccionado → entrevista | rechazado
   * - entrevista → contratado | rechazado
   * 
   * @param {number} id - ID de la postulación
   * @param {Object} data - Datos del cambio de estado
   * @param {string} data.estado - Nuevo estado
   * @param {string} data.notas_empresa - Notas internas (opcional)
   * @param {Date} data.fecha_entrevista - Fecha de entrevista (si estado = 'entrevista')
   * 
   * @returns {Promise<Object>} Postulación actualizada + email enviado
   */
  cambiarEstado: async (id, data) => {
    console.log('🔍 [postulacionesAPI] Cambiando estado postulación:', id, data);
    return await axiosInstance.patch(`/postulaciones/${id}/estado`, data);
  },

  /**
   * 🆕 Retirar postulación (CANDIDATO)
   * El candidato puede retirar su postulación en cualquier momento
   * Estado final: 'retirado' (no reversible)
   * 
   * @param {number} id - ID de la postulación
   * @returns {Promise<Object>} Postulación con estado 'retirado'
   */
  retirar: async (id) => {
    console.log('🔍 [postulacionesAPI] Retirando postulación ID:', id);
    return await axiosInstance.patch(`/postulaciones/${id}/retirar`);
  },

  /**
   * 🆕 Eliminar postulación
   * Solo ADMIN puede eliminar postulaciones
   * ⚠️ Acción destructiva, usar con precaución
   * 
   * @param {number} id - ID de la postulación
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  eliminar: async (id) => {
    console.log('🔍 [postulacionesAPI] Eliminando postulación ID:', id);
    return await axiosInstance.delete(`/postulaciones/${id}`);
  },
};