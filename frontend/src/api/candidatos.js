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
  },

  // ============================================
  // 🆕 S009.9 - BÚSQUEDA AVANZADA DE CANDIDATOS
  // ============================================

  /**
   * 🆕 Búsqueda avanzada de candidatos con 10 filtros combinables
   * Solo EMPRESA y ADMIN pueden usar esta búsqueda
   * 
   * @param {Object} params - Parámetros de búsqueda (todos opcionales)
   * @param {string} params.habilidades - IDs de habilidades separados por coma "1,2,3"
   * @param {string} params.nivel_habilidad - 'basico' | 'intermedio' | 'avanzado' | 'experto'
   * @param {number} params.experiencia_min - Experiencia mínima en años
   * @param {number} params.experiencia_max - Experiencia máxima en años
   * @param {string} params.nivel_educativo - 'Secundaria' | 'Técnico' | 'Licenciatura' | 'Maestría' | 'Doctorado'
   * @param {string} params.ubicacion_ciudad - Ciudad del candidato
   * @param {string} params.ubicacion_departamento - Departamento del candidato
   * @param {string} params.modalidad - 'remoto' | 'presencial' | 'hibrido'
   * @param {string} params.disponibilidad - 'inmediata' | '1_semana' | '2_semanas' | '1_mes'
   * @param {number} params.salario_min - Salario esperado mínimo
   * @param {number} params.salario_max - Salario esperado máximo
   * @param {string} params.busqueda - Búsqueda full-text (nombre, título profesional)
   * @param {number} params.pagina - Página actual (default: 1)
   * @param {number} params.limite - Límite por página (default: 20)
   * @param {string} params.ordenar - 'experiencia' | 'salario' | 'fecha_registro' | 'nombre'
   * 
   * @returns {Promise<Object>} { candidatos: [], total, pagina, limite, filtros_aplicados }
   * @example
   * const resultado = await candidatosAPI.buscarAvanzado({
   *   habilidades: "1,5,12",
   *   nivel_habilidad: "avanzado",
   *   experiencia_min: 3,
   *   ubicacion_ciudad: "Cochabamba",
   *   modalidad: "remoto",
   *   salario_min: 5000,
   *   pagina: 1,
   *   limite: 20
   * });
   */
  buscarAvanzado: async (params = {}) => {
    console.log('🔍 [candidatosAPI] Búsqueda avanzada con filtros:', params);
    return await axiosInstance.get('/candidatos/buscar-avanzado', { params });
  },

  /**
   * 🆕 Obtener candidatos recomendados para una vacante específica
   * Backend calcula compatibilidad automáticamente
   * 
   * @param {number} vacanteId - ID de la vacante
   * @param {Object} params - Parámetros opcionales
   * @param {number} params.limite - Número de candidatos recomendados (default: 10)
   * @param {number} params.score_minimo - Score mínimo de compatibilidad (default: 60)
   * 
   * @returns {Promise<Object>} { candidatos_recomendados: [], vacante: {} }
   * @example
   * {
   *   vacante: { id: 7, titulo: "Senior Full Stack Developer" },
   *   candidatos_recomendados: [
   *     {
   *       candidato: { id, nombre_completo, foto_perfil, titulo_profesional },
   *       score_compatibilidad: 92,
   *       desglose_scoring: {
   *         habilidades: { puntos: 45, peso: 50, detalle: "..." },
   *         experiencia: { puntos: 23, peso: 25, detalle: "..." },
   *         educacion: { puntos: 12, peso: 15, detalle: "..." },
   *         ubicacion: { puntos: 10, peso: 10, detalle: "..." }
   *       },
   *       motivo_recomendacion: "Habilidades clave: React (avanzado), Node.js (experto)"
   *     }
   *   ],
   *   total_recomendados: 5
   * }
   */
  obtenerRecomendadosVacante: async (vacanteId, params = {}) => {
    console.log('🔍 [candidatosAPI] Obteniendo recomendados para vacante:', vacanteId);
    return await axiosInstance.get(`/candidatos/recomendados-vacante/${vacanteId}`, { params });
  },
};