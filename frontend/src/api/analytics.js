// file: frontend/src/api/analytics.js

/**
 * 📊 API SERVICE: Analytics Empresa (S009.8)
 * Métricas y KPIs para toma de decisiones
 * 
 * Endpoints disponibles:
 * - GET /analytics/empresa/general         : Estadísticas generales empresa
 * - GET /analytics/empresa/vacante/:id     : Métricas vacante específica
 * - GET /analytics/empresa/funnel          : Funnel conversión postulaciones
 * - GET /analytics/empresa/tendencias      : Tendencias temporales
 */

import axiosInstance from './axios';

export const analyticsAPI = {
  /**
   * 🆕 Obtener estadísticas generales de la empresa
   * KPIs principales para dashboard principal
   * 
   * @returns {Promise<Object>} Estadísticas generales
   * @example
   * {
   *   total_postulaciones: 45,
   *   por_estado: {
   *     postulado: 15,
   *     revisado: 10,
   *     preseleccionado: 8,
   *     entrevista: 5,
   *     contratado: 3,
   *     rechazado: 4
   *   },
   *   score_promedio: "76.23",
   *   tasa_conversion: "6.67", // % postulaciones → contrataciones
   *   vacantes_activas: 3,
   *   vacantes_cerradas: 2,
   *   tiempo_promedio_contratacion_dias: 18.5
   * }
   */
  obtenerEstadisticasGenerales: async () => {
    console.log('🔍 [analyticsAPI] Obteniendo estadísticas generales empresa');
    return await axiosInstance.get('/analytics/empresa/general');
  },

  /**
   * 🆕 Obtener métricas de vacante específica
   * Análisis detallado de rendimiento de una vacante
   * 
   * @param {number} vacanteId - ID de la vacante
   * @returns {Promise<Object>} Métricas de la vacante
   * @example
   * {
   *   vacante: { id, titulo, estado, fecha_publicacion },
   *   total_postulaciones: 12,
   *   distribucion_scores: [
   *     { rango: "90-100", count: 2 },
   *     { rango: "80-89", count: 4 },
   *     { rango: "70-79", count: 3 },
   *     { rango: "60-69", count: 2 },
   *     { rango: "0-59", count: 1 }
   *   ],
   *   score_promedio: 78.5,
   *   por_estado: {
   *     postulado: 3,
   *     revisado: 4,
   *     preseleccionado: 2,
   *     entrevista: 2,
   *     contratado: 1
   *   },
   *   timeline_30_dias: [
   *     { fecha: "2025-11-01", count: 2 },
   *     { fecha: "2025-11-02", count: 3 },
   *     ...
   *   ],
   *   top_candidatos: [
   *     {
   *       postulacion_id: 9,
   *       candidato: { id, nombre_completo, foto_perfil },
   *       score: 92,
   *       estado: "preseleccionado"
   *     }
   *   ]
   * }
   */
  obtenerMetricasVacante: async (vacanteId) => {
    console.log('🔍 [analyticsAPI] Obteniendo métricas de vacante:', vacanteId);
    return await axiosInstance.get(`/analytics/empresa/vacante/${vacanteId}`);
  },

  /**
   * 🆕 Obtener funnel de conversión
   * Visualizar embudo de contratación con tasas de conversión
   * 
   * @param {Object} filtros - Filtros opcionales
   * @param {number} filtros.vacante_id - Filtrar por vacante específica
   * @param {string} filtros.fecha_inicio - Fecha inicio (ISO format)
   * @param {string} filtros.fecha_fin - Fecha fin (ISO format)
   * 
   * @returns {Promise<Object>} Datos del funnel
   * @example
   * {
   *   funnel: {
   *     postulado: 15,
   *     revisado: 10,
   *     preseleccionado: 8,
   *     entrevista: 5,
   *     contratado: 3,
   *     rechazado: 4,
   *     retirado: 0
   *   },
   *   tasas_conversion: {
   *     postulado_a_revisado: 66.67,      // (10/15) * 100
   *     revisado_a_preseleccionado: 80.00, // (8/10) * 100
   *     preseleccionado_a_entrevista: 62.50, // (5/8) * 100
   *     entrevista_a_contratado: 60.00,   // (3/5) * 100
   *     global_conversion: 6.67           // (3/45) * 100
   *   },
   *   total_procesadas: 45
   * }
   */
  obtenerFunnelConversion: async (filtros = {}) => {
    console.log('🔍 [analyticsAPI] Obteniendo funnel de conversión');
    return await axiosInstance.get('/analytics/empresa/funnel', { params: filtros });
  },

  /**
   * 🆕 Obtener tendencias temporales
   * Evolución de postulaciones y contrataciones en el tiempo
   * 
   * @param {Object} params - Parámetros de consulta
   * @param {string} params.periodo - 'dia' | 'semana' | 'mes' (default: 'dia')
   * @param {string} params.fecha_inicio - Fecha inicio (ISO format)
   * @param {string} params.fecha_fin - Fecha fin (ISO format)
   * @param {number} params.vacante_id - Filtrar por vacante específica (opcional)
   * 
   * @returns {Promise<Object>} Serie temporal de datos
   * @example
   * {
   *   periodo: "dia",
   *   fecha_inicio: "2025-10-18",
   *   fecha_fin: "2025-11-18",
   *   series: [
   *     {
   *       fecha: "2025-11-01",
   *       postulaciones: 5,
   *       contrataciones: 1,
   *       score_promedio: 78.2
   *     },
   *     {
   *       fecha: "2025-11-02",
   *       postulaciones: 3,
   *       contrataciones: 0,
   *       score_promedio: 82.5
   *     },
   *     ...
   *   ],
   *   totales: {
   *     postulaciones: 45,
   *     contrataciones: 3,
   *     score_promedio: 76.8
   *   }
   * }
   */
  obtenerTendencias: async (params = {}) => {
    console.log('🔍 [analyticsAPI] Obteniendo tendencias temporales');
    return await axiosInstance.get('/analytics/empresa/tendencias', { params });
  },
};