// file: frontend/src/api/vacantes.js
import axiosInstance from './axios';

export const vacantesAPI = {
  /**
   * 🆕 Crear nueva vacante
   * Solo EMPRESA puede crear vacantes
   * 
   * @param {Object} data - Datos de la vacante
   * @param {string} data.titulo - Título de la vacante
   * @param {string} data.descripcion - Descripción detallada
   * @param {string} data.ciudad - Ciudad
   * @param {string} data.modalidad - 'remoto' | 'presencial' | 'hibrido'
   * @param {number} data.experiencia_requerida_anios - Años de experiencia
   * @param {string} data.nivel_educativo_minimo - Nivel educativo mínimo
   * @param {number} data.salario_min - Salario mínimo
   * @param {number} data.salario_max - Salario máximo
   * @param {boolean} data.mostrar_salario - Mostrar salario públicamente
   * @param {string} data.tipo_contrato - 'indefinido' | 'temporal' | 'por_proyecto' | 'practicas'
   * @param {string} data.jornada_laboral - 'completa' | 'parcial' | 'por_horas'
   * @param {string} data.estado - 'borrador' | 'abierta' | 'pausada' | 'cerrada'
   * @param {Date} data.fecha_cierre - Fecha de cierre (opcional)
   * @param {Array} data.habilidades_requeridas - [{ habilidad_id, nivel_requerido, peso }]
   * 
   * @returns {Promise<Object>} Vacante creada con ID
   */
  crear: async (data) => {
    console.log('🔍 [vacantesAPI] Creando vacante:', data);
    return await axiosInstance.post('/vacantes', data);
  },

  /**
   * 🆕 Publicar vacante (borrador → abierta)
   * Solo la EMPRESA propietaria puede publicar
   * 
   * @param {number} id - ID de la vacante
   * @returns {Promise<Object>} Vacante publicada
   */
  publicar: async (id) => {
    console.log('📢 [vacantesAPI] Publicando vacante ID:', id);
    return await axiosInstance.post(`/vacantes/${id}/publicar`);
  },

  /**
   * 🆕 Listar vacantes con filtros opcionales
   * 
   * @param {Object} filtros - Filtros de búsqueda (todos opcionales)
   * @param {string} filtros.ciudad - Filtrar por ciudad
   * @param {string} filtros.modalidad - Filtrar por modalidad
   * @param {number} filtros.salario_min - Salario mínimo
   * @param {number} filtros.experiencia_min - Experiencia mínima años
   * @param {string} filtros.estado - Estado de la vacante
   * @param {number} filtros.pagina - Página actual (default: 1)
   * @param {number} filtros.limite - Límite por página (default: 20)
   * 
   * @returns {Promise<Object>} { vacantes: [], total, pagina, limite }
   */
  listar: async (filtros = {}) => {
    console.log('🔍 [vacantesAPI] Listando vacantes con filtros:', filtros);
    return await axiosInstance.get('/vacantes', { params: filtros });
  },

  /**
   * 🆕 Obtener vacante por ID
   * Incluye relaciones: empresa, habilidades_requeridas, postulaciones_count
   * 
   * @param {number} id - ID de la vacante
   * @returns {Promise<Object>} Vacante completa
   */
  obtenerPorId: async (id) => {
    console.log('🔍 [vacantesAPI] Obteniendo vacante ID:', id);
    return await axiosInstance.get(`/vacantes/${id}`);
  },

  /**
   * 🆕 Actualizar vacante
   * Solo la EMPRESA propietaria puede actualizar
   * 
   * @param {number} id - ID de la vacante
   * @param {Object} data - Datos a actualizar (parcial)
   * @returns {Promise<Object>} Vacante actualizada
   */
  actualizar: async (id, datos) => {
    console.log('✏️ [vacantesAPI] Actualizando vacante ID:', id, datos);
    return await axiosInstance.patch(`/vacantes/${id}`, datos);
  },

  /**
   * 🆕 Pausar vacante (abierta → pausada)
   * La vacante deja de ser visible para candidatos temporalmente
   * 
   * @param {number} id - ID de la vacante
   * @returns {Promise<Object>} Vacante pausada
   */
  pausar: async (id) => {
    console.log('⏸️ [vacantesAPI] Pausando vacante ID:', id);
    return await axiosInstance.patch(`/vacantes/${id}/pausar`);
  },

  /**
   * 🆕 Reabrir vacante (pausada → abierta)
   * La vacante vuelve a ser visible para candidatos
   * 
   * @param {number} id - ID de la vacante
   * @returns {Promise<Object>} Vacante reabierta
   */
  reabrir: async (id) => {
    console.log('▶️ [vacantesAPI] Reabriendo vacante ID:', id);
    return await axiosInstance.patch(`/vacantes/${id}/reabrir`);
  },

  /**
   * 🆕 Cerrar vacante (cualquier estado → cerrada)
   * Cambia estado a 'cerrada' y registra fecha_cierre
   * ⚠️ Acción irreversible
   * 
   * @param {number} id - ID de la vacante
   * @returns {Promise<Object>} Vacante cerrada
   */
  cerrar: async (id) => {
    console.log('🔒 [vacantesAPI] Cerrando vacante ID:', id);
    return await axiosInstance.patch(`/vacantes/${id}/cerrar`);
  },

  /**
   * 🆕 Eliminar vacante
   * Solo la EMPRESA propietaria puede eliminar
   * ⚠️ Solo se puede eliminar si está en estado 'borrador' y sin postulaciones
   * 
   * @param {number} id - ID de la vacante
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  eliminar: async (id) => {
    console.log('🗑️ [vacantesAPI] Eliminando vacante ID:', id);
    return await axiosInstance.delete(`/vacantes/${id}`);
  },

  /**
   * 🆕 Obtener vacantes de mi empresa
   * Solo accesible por la empresa propietaria
   * 
   * @param {Object} params - Filtros opcionales
   * @param {string} params.estado - Filtrar por estado
   * @param {number} params.pagina - Página actual
   * @param {number} params.limite - Límite por página
   * @returns {Promise<Object>} { vacantes: [], total, estadisticas }
   */
  listarPorEmpresa: async (params = {}) => {
    console.log('🔍 [vacantesAPI] Listando vacantes de mi empresa con filtros:', params);
    return await axiosInstance.get('/vacantes/empresa/mis-vacantes', { params });
  },

  /**
   * 🆕 Búsqueda avanzada de vacantes
   * Múltiples filtros combinables con búsqueda full-text
   * 
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.busqueda - Búsqueda full-text (título, descripción)
   * @param {string} params.ciudad - Ciudad
   * @param {string} params.departamento - Departamento
   * @param {string} params.modalidad - Modalidad de trabajo
   * @param {number} params.salario_min - Salario mínimo
   * @param {number} params.salario_max - Salario máximo
   * @param {number} params.experiencia_min - Experiencia mínima
   * @param {string} params.nivel_educativo - Nivel educativo mínimo
   * @param {string} params.tipo_contrato - Tipo de contrato
   * @param {string} params.ordenar - Campo para ordenar (default: fecha_publicacion)
   * @param {string} params.direccion - 'asc' | 'desc'
   * @param {number} params.pagina - Página actual
   * @param {number} params.limite - Límite por página
   * 
   * @returns {Promise<Object>} { vacantes: [], total, pagina, limite }
   */
  buscarAvanzado: async (params = {}) => {
    console.log('🔍 [vacantesAPI] Búsqueda avanzada:', params);
    return await axiosInstance.get('/vacantes/buscar', { params });
  },
};