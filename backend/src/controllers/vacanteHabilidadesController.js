// file: backend/src/controllers/vacanteHabilidadesController.js

/**
 * CONTROLADOR: Habilidades Vacante (Relación N:M)
 * S009.5: Gestión habilidades requeridas con pesos y niveles
 */

const { validationResult } = require('express-validator');
const { 
  Vacante, 
  HabilidadCatalogo,
  VacanteHabilidad,
  Empresa,
  Postulacion 
} = require('../models');
const { registrarAuditoria } = require('../utils/auditHelper');

/**
 * Helpers de respuesta
 */
const exitoRespuesta = (res, statusCode, mensaje, data = null) => {
  return res.status(statusCode).json({
    success: true,
    status: statusCode,
    message: mensaje,
    data
  });
};

const errorRespuesta = (res, statusCode, mensaje, error = null) => {
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: mensaje,
    error: process.env.NODE_ENV === 'development' ? error : null
  });
};

/**
 * 1. AGREGAR HABILIDAD REQUERIDA A VACANTE
 * POST /api/vacantes/:vacante_id/habilidades
 * Rol: EMPRESA, ADMIN
 */
const agregarHabilidad = async (req, res) => {
  try {
    // 1. Validar errores express-validator
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { vacante_id } = req.params;
    const { habilidad_id, nivel_minimo_requerido, obligatoria, peso_ponderacion } = req.body;
    const usuarioId = req.usuario.id;

    // 2. Buscar vacante y verificar permisos
    const vacante = await Vacante.findByPk(vacante_id, {
      include: [{
        model: Empresa,
        as: 'empresa'
      }]
    });

    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    // 3. Verificar que es la empresa propietaria
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para modificar esta vacante');
    }

    // 4. Verificar que la habilidad existe en el catálogo
    const habilidad = await HabilidadCatalogo.findByPk(habilidad_id);
    if (!habilidad) {
      return errorRespuesta(res, 404, 'Habilidad no encontrada en el catálogo');
    }

    // 5. Verificar que no exista ya (duplicado)
    const existente = await VacanteHabilidad.findOne({
      where: {
        vacante_id: vacante_id,
        habilidad_id: habilidad_id
      }
    });

    if (existente) {
      return errorRespuesta(res, 400, 'Esta habilidad ya está agregada a la vacante');
    }

    // 6. Crear relación
    const vacanteHabilidad = await VacanteHabilidad.create({
      vacante_id: vacante_id,
      habilidad_id: habilidad_id,
      nivel_minimo_requerido: nivel_minimo_requerido || 'basico',
      obligatoria: obligatoria !== undefined ? obligatoria : false,
      peso_ponderacion: peso_ponderacion || 10
    });

    // 7. Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'AGREGAR_HABILIDAD_VACANTE',
      entidad: 'vacante_habilidades',
      entidad_id: vacanteHabilidad.id,
      datos_adicionales: JSON.stringify({
        vacante_id: vacante_id,
        habilidad_id: habilidad_id,
        habilidad_nombre: habilidad.nombre,
        nivel: nivel_minimo_requerido,
        peso: peso_ponderacion
      })
    });

    console.log(`✅ Habilidad ${habilidad.nombre} agregada a vacante ${vacante_id}`);

    // 8. Retornar con datos de la habilidad
    const resultado = await VacanteHabilidad.findByPk(vacanteHabilidad.id, {
      include: [{
        model: HabilidadCatalogo,
        as: 'habilidad',
        attributes: ['id', 'nombre', 'categoria', 'descripcion']
      }]
    });

    return exitoRespuesta(res, 201, 'Habilidad agregada exitosamente', resultado);

  } catch (error) {
    console.error('❌ Error al agregar habilidad:', error);
    return errorRespuesta(res, 500, 'Error al agregar habilidad', error.message);
  }
};

/**
 * 2. LISTAR HABILIDADES DE UNA VACANTE
 * GET /api/vacantes/:vacante_id/habilidades
 * Rol: TODOS (público)
 */
const listarHabilidades = async (req, res) => {
  try {
    const { vacante_id } = req.params;

    // 1. Verificar que la vacante existe
    const vacante = await Vacante.findByPk(vacante_id);
    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    // 2. Obtener habilidades con información del catálogo
    const habilidades = await VacanteHabilidad.findAll({
      where: { vacante_id: vacante_id },
      include: [{
        model: HabilidadCatalogo,
        as: 'habilidad',
        attributes: ['id', 'nombre', 'categoria', 'descripcion', 'demanda_mercado']
      }],
      order: [
        ['obligatoria', 'DESC'],  // Obligatorias primero
        ['peso_ponderacion', 'DESC']  // Luego por peso
      ]
    });

    // 3. Calcular totales
    const totales = {
      total_habilidades: habilidades.length,
      obligatorias: habilidades.filter(h => h.obligatoria).length,
      peso_total: habilidades.reduce((sum, h) => sum + h.peso_ponderacion, 0)
    };

    console.log(`📋 Listadas ${habilidades.length} habilidades de vacante ${vacante_id}`);

    return exitoRespuesta(res, 200, 'Habilidades obtenidas', {
      habilidades: habilidades.map(vh => ({
        id: vh.habilidad.id,
        nombre: vh.habilidad.nombre,
        categoria: vh.habilidad.categoria,
        descripcion: vh.habilidad.descripcion,
        demanda_mercado: vh.habilidad.demanda_mercado,
        nivel_minimo_requerido: vh.nivel_minimo_requerido,
        obligatoria: vh.obligatoria,
        peso_ponderacion: vh.peso_ponderacion
      })),
      totales
    });

  } catch (error) {
    console.error('❌ Error al listar habilidades:', error);
    return errorRespuesta(res, 500, 'Error al listar habilidades', error.message);
  }
};

/**
 * 3. ACTUALIZAR HABILIDAD DE VACANTE
 * PATCH /api/vacantes/:vacante_id/habilidades/:habilidad_id
 * Rol: EMPRESA, ADMIN
 */
const actualizarHabilidad = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { vacante_id, habilidad_id } = req.params;
    const { nivel_minimo_requerido, obligatoria, peso_ponderacion } = req.body;
    const usuarioId = req.usuario.id;

    // 1. Verificar vacante y permisos
    const vacante = await Vacante.findByPk(vacante_id);
    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para modificar esta vacante');
    }

    // 2. Buscar relación vacante-habilidad
    const vacanteHabilidad = await VacanteHabilidad.findOne({
      where: {
        vacante_id: vacante_id,
        habilidad_id: habilidad_id
      },
      include: [{
        model: HabilidadCatalogo,
        as: 'habilidad',
        attributes: ['nombre']
      }]
    });

    if (!vacanteHabilidad) {
      return errorRespuesta(res, 404, 'Habilidad no encontrada en esta vacante');
    }

    // 3. Actualizar campos permitidos
    const actualizaciones = {};
    if (nivel_minimo_requerido !== undefined) {
      actualizaciones.nivel_minimo_requerido = nivel_minimo_requerido;
    }
    if (obligatoria !== undefined) {
      actualizaciones.obligatoria = obligatoria;
    }
    if (peso_ponderacion !== undefined) {
      actualizaciones.peso_ponderacion = peso_ponderacion;
    }

    await vacanteHabilidad.update(actualizaciones);

    // 4. Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'ACTUALIZAR_HABILIDAD_VACANTE',
      entidad: 'vacante_habilidades',
      entidad_id: vacanteHabilidad.id,
      datos_adicionales: JSON.stringify({
        vacante_id,
        habilidad_id,
        habilidad_nombre: vacanteHabilidad.habilidad.nombre,
        cambios: actualizaciones
      })
    });

    console.log(`✏️ Habilidad ${habilidad_id} actualizada en vacante ${vacante_id}`);

    return exitoRespuesta(res, 200, 'Habilidad actualizada exitosamente', vacanteHabilidad);

  } catch (error) {
    console.error('❌ Error al actualizar habilidad:', error);
    return errorRespuesta(res, 500, 'Error al actualizar habilidad', error.message);
  }
};

/**
 * 4. ELIMINAR HABILIDAD DE VACANTE
 * DELETE /api/vacantes/:vacante_id/habilidades/:habilidad_id
 * Rol: EMPRESA, ADMIN
 */
const eliminarHabilidad = async (req, res) => {
  try {
    const { vacante_id, habilidad_id } = req.params;
    const usuarioId = req.usuario.id;

    // 1. Verificar vacante y permisos
    const vacante = await Vacante.findByPk(vacante_id, {
      include: [{
        model: Postulacion,
        as: 'postulaciones',
        attributes: ['id']
      }]
    });

    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para modificar esta vacante');
    }

    // 2. Advertencia si tiene postulaciones (afecta scoring)
    if (vacante.postulaciones && vacante.postulaciones.length > 0) {
      console.warn(`⚠️ Eliminando habilidad de vacante con ${vacante.postulaciones.length} postulaciones`);
    }

    // 3. Buscar y eliminar relación
    const vacanteHabilidad = await VacanteHabilidad.findOne({
      where: {
        vacante_id: vacante_id,
        habilidad_id: habilidad_id
      },
      include: [{
        model: HabilidadCatalogo,
        as: 'habilidad',
        attributes: ['nombre']
      }]
    });

    if (!vacanteHabilidad) {
      return errorRespuesta(res, 404, 'Habilidad no encontrada en esta vacante');
    }

    // 4. Auditoría ANTES de eliminar
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'ELIMINAR_HABILIDAD_VACANTE',
      entidad: 'vacante_habilidades',
      entidad_id: vacanteHabilidad.id,
      datos_adicionales: JSON.stringify({
        vacante_id,
        habilidad_id,
        habilidad_nombre: vacanteHabilidad.habilidad.nombre,
        nivel: vacanteHabilidad.nivel_minimo_requerido,
        peso: vacanteHabilidad.peso_ponderacion,
        postulaciones_afectadas: vacante.postulaciones.length
      })
    });

    // 5. Eliminar
    await vacanteHabilidad.destroy();

    console.log(`🗑️ Habilidad ${habilidad_id} eliminada de vacante ${vacante_id}`);

    return exitoRespuesta(res, 200, 'Habilidad eliminada exitosamente');

  } catch (error) {
    console.error('❌ Error al eliminar habilidad:', error);
    return errorRespuesta(res, 500, 'Error al eliminar habilidad', error.message);
  }
};

/**
 * 5. LISTAR SOLO HABILIDADES OBLIGATORIAS
 * GET /api/vacantes/:vacante_id/habilidades/obligatorias
 * Rol: TODOS (público)
 */
const listarObligatorias = async (req, res) => {
  try {
    const { vacante_id } = req.params;

    // 1. Verificar que la vacante existe
    const vacante = await Vacante.findByPk(vacante_id);
    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    // 2. Obtener solo habilidades obligatorias
    const habilidadesObligatorias = await VacanteHabilidad.findAll({
      where: { 
        vacante_id: vacante_id,
        obligatoria: true 
      },
      include: [{
        model: HabilidadCatalogo,
        as: 'habilidad',
        attributes: ['id', 'nombre', 'categoria', 'descripcion']
      }],
      order: [['peso_ponderacion', 'DESC']]
    });

    console.log(`🔴 ${habilidadesObligatorias.length} habilidades obligatorias en vacante ${vacante_id}`);

    return exitoRespuesta(res, 200, 'Habilidades obligatorias obtenidas', {
      total: habilidadesObligatorias.length,
      habilidades: habilidadesObligatorias.map(vh => ({
        id: vh.habilidad.id,
        nombre: vh.habilidad.nombre,
        categoria: vh.habilidad.categoria,
        descripcion: vh.habilidad.descripcion,
        nivel_minimo_requerido: vh.nivel_minimo_requerido,
        peso_ponderacion: vh.peso_ponderacion
      }))
    });

  } catch (error) {
    console.error('❌ Error al listar habilidades obligatorias:', error);
    return errorRespuesta(res, 500, 'Error al listar habilidades obligatorias', error.message);
  }
};

module.exports = {
  agregarHabilidad,
  listarHabilidades,
  actualizarHabilidad,
  eliminarHabilidad,
  listarObligatorias
};