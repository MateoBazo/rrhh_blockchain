// file: backend/src/controllers/certificacionesController.js
const { Certificacion, Candidato } = require('../models');
const { exitoRespuesta, errorRespuesta } = require('../utils/responses');
const { validationResult } = require('express-validator');

/**
 * POST /api/certificaciones
 * Crear nueva certificación
 */
const crearCertificacion = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    // ✅ CORREGIDO: req.usuario en lugar de req.user
    const candidato = await Candidato.findOne({
      where: { usuario_id: req.usuario.id }
    });

    if (!candidato) {
      return errorRespuesta(res, 404, 'Debe crear un perfil de candidato primero.');
    }

    // ✅ CORREGIDO: Usar nombres de campos del modelo Certificacion.js
    const {
      nombre,
      institucion_emisora,
      fecha_obtencion,
      fecha_vencimiento,
      credencial_id,
      credencial_url,
      habilidades_relacionadas,
      descripcion
    } = req.body;

    // Validar fechas
    if (fecha_vencimiento && new Date(fecha_vencimiento) < new Date(fecha_obtencion)) {
      return errorRespuesta(res, 400, 'La fecha de vencimiento debe ser posterior a la fecha de obtención.');
    }

    if (fecha_obtencion && new Date(fecha_obtencion) > new Date()) {
      return errorRespuesta(res, 400, 'La fecha de obtención no puede ser futura.');
    }

    const nuevaCertificacion = await Certificacion.create({
      candidato_id: candidato.id,
      nombre,
      institucion_emisora,
      fecha_obtencion,
      fecha_vencimiento,
      credencial_id,
      credencial_url,
      habilidades_relacionadas,
      descripcion
    });

    return exitoRespuesta(res, 201, 'Certificación creada exitosamente', nuevaCertificacion);

  } catch (error) {
    console.error('❌ Error al crear certificación:', error);
    return errorRespuesta(res, 500, 'Error al crear certificación', error.message);
  }
};

/**
 * GET /api/certificaciones
 * Obtener certificaciones del candidato
 */
const obtenerCertificaciones = async (req, res) => {
  try {
    const { candidato_id } = req.query;

    let candidatoIdFiltro = candidato_id;

    if (!candidatoIdFiltro) {
      const candidato = await Candidato.findOne({
        where: { usuario_id: req.usuario.id }
      });

      if (!candidato) {
        return errorRespuesta(res, 404, 'No se encontró perfil de candidato para este usuario.');
      }

      candidatoIdFiltro = candidato.id;
    }

    // RBAC
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'EMPRESA') {
      const candidato = await Candidato.findOne({
        where: { usuario_id: req.usuario.id }
      });

      if (!candidato || candidato.id !== parseInt(candidatoIdFiltro)) {
        return errorRespuesta(res, 403, 'No tienes permiso para ver estas certificaciones.');
      }
    }

    const certificaciones = await Certificacion.findAll({
      where: { candidato_id: candidatoIdFiltro },
      order: [['fecha_obtencion', 'DESC'], ['created_at', 'DESC']],
      limit: 50
    });

    return exitoRespuesta(res, 200, 'Certificaciones obtenidas exitosamente', {
      total: certificaciones.length,
      certificaciones
    });

  } catch (error) {
    console.error('❌ Error al obtener certificaciones:', error);
    return errorRespuesta(res, 500, 'Error al obtener certificaciones', error.message);
  }
};

/**
 * GET /api/certificaciones/:id
 * Obtener certificación por ID
 */
const obtenerCertificacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const certificacion = await Certificacion.findByPk(id, {
      include: [{ 
        model: Candidato, 
        as: 'candidato',
        attributes: ['id', 'nombres', 'apellido_paterno', 'usuario_id']
      }]
    });

    if (!certificacion) {
      return errorRespuesta(res, 404, 'Certificación no encontrada.');
    }

    // RBAC
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'EMPRESA') {
      if (certificacion.candidato.usuario_id !== req.usuario.id) {
        return errorRespuesta(res, 403, 'No tienes permiso para ver esta certificación.');
      }
    }

    return exitoRespuesta(res, 200, 'Certificación obtenida exitosamente', certificacion);

  } catch (error) {
    console.error('❌ Error al obtener certificación:', error);
    return errorRespuesta(res, 500, 'Error al obtener certificación', error.message);
  }
};

/**
 * PUT /api/certificaciones/:id
 * Actualizar certificación
 */
const actualizarCertificacion = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { id } = req.params;

    const certificacion = await Certificacion.findByPk(id, {
      include: [{ model: Candidato, as: 'candidato' }]
    });

    if (!certificacion) {
      return errorRespuesta(res, 404, 'Certificación no encontrada.');
    }

    // Verificar ownership
    if (certificacion.candidato.usuario_id !== req.usuario.id && req.usuario.rol !== 'ADMIN') {
      return errorRespuesta(res, 403, 'No tienes permiso para actualizar esta certificación.');
    }

    // Validar fechas
    const { fecha_obtencion, fecha_vencimiento } = req.body;
    
    if (fecha_vencimiento && fecha_obtencion) {
      if (new Date(fecha_vencimiento) < new Date(fecha_obtencion)) {
        return errorRespuesta(res, 400, 'La fecha de vencimiento debe ser posterior a la fecha de obtención.');
      }
    }

    await certificacion.update(req.body);

    return exitoRespuesta(res, 200, 'Certificación actualizada exitosamente', certificacion);

  } catch (error) {
    console.error('❌ Error al actualizar certificación:', error);
    return errorRespuesta(res, 500, 'Error al actualizar certificación', error.message);
  }
};

/**
 * DELETE /api/certificaciones/:id
 * Eliminar certificación
 */
const eliminarCertificacion = async (req, res) => {
  try {
    const { id } = req.params;

    const certificacion = await Certificacion.findByPk(id, {
      include: [{ model: Candidato, as: 'candidato' }]
    });

    if (!certificacion) {
      return errorRespuesta(res, 404, 'Certificación no encontrada.');
    }

    // Verificar ownership
    if (certificacion.candidato.usuario_id !== req.usuario.id && req.usuario.rol !== 'ADMIN') {
      return errorRespuesta(res, 403, 'No tienes permiso para eliminar esta certificación.');
    }

    await certificacion.destroy();

    return exitoRespuesta(res, 200, 'Certificación eliminada exitosamente');

  } catch (error) {
    console.error('❌ Error al eliminar certificación:', error);
    return errorRespuesta(res, 500, 'Error al eliminar certificación', error.message);
  }
};

module.exports = {
  crearCertificacion,
  obtenerCertificaciones,
  obtenerCertificacionPorId,
  actualizarCertificacion,
  eliminarCertificacion
};