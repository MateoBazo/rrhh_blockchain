// file: backend/src/controllers/certificacionesController.js
const { Certificacion } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { validationResult } = require('express-validator');

/**
 * @desc    Crear nueva certificación
 * @route   POST /api/certificaciones
 * @access  Private (CANDIDATO)
 */
exports.crearCertificacion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    const candidatoId = req.user.id;
    const {
      nombre_certificacion,
      entidad_emisora,
      fecha_emision,
      fecha_vencimiento,
      codigo_credencial,
      url_verificacion
    } = req.body;

    // Validación: fecha_vencimiento debe ser futura (si se proporciona)
    if (fecha_vencimiento) {
      const fechaVenc = new Date(fecha_vencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaVenc < hoy) {
        return errorResponse(res, 'La fecha de vencimiento debe ser futura o igual a hoy', 400);
      }
    }

    // Validación: fecha_emision ≤ hoy
    if (fecha_emision) {
      const fechaEmis = new Date(fecha_emision);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      
      if (fechaEmis > hoy) {
        return errorResponse(res, 'La fecha de emisión no puede ser futura', 400);
      }
    }

    const certificacion = await Certificacion.create({
      candidato_id: candidatoId,
      nombre_certificacion,
      entidad_emisora,
      fecha_emision,
      fecha_vencimiento,
      codigo_credencial,
      url_verificacion
    });

    return successResponse(res, certificacion, 'Certificación creada exitosamente', 201);
  } catch (error) {
    console.error('Error en crearCertificacion:', error);
    return errorResponse(res, 'Error al crear la certificación', 500);
  }
};

/**
 * @desc    Obtener todas las certificaciones del candidato
 * @route   GET /api/certificaciones
 * @access  Private (CANDIDATO)
 */
exports.obtenerCertificaciones = async (req, res) => {
  try {
    const candidatoId = req.user.id;

    const certificaciones = await Certificacion.findAll({
      where: { candidato_id: candidatoId },
      order: [['fecha_emision', 'DESC']]
    });

    return successResponse(res, certificaciones, `${certificaciones.length} certificación(es) encontrada(s)`);
  } catch (error) {
    console.error('Error en obtenerCertificaciones:', error);
    return errorResponse(res, 'Error al obtener certificaciones', 500);
  }
};

/**
 * @desc    Obtener certificación por ID
 * @route   GET /api/certificaciones/:id
 * @access  Private (CANDIDATO - solo propias)
 */
exports.obtenerCertificacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const candidatoId = req.user.id;

    const certificacion = await Certificacion.findOne({
      where: { id, candidato_id: candidatoId }
    });

    if (!certificacion) {
      return errorResponse(res, 'Certificación no encontrada', 404);
    }

    return successResponse(res, certificacion, 'Certificación obtenida exitosamente');
  } catch (error) {
    console.error('Error en obtenerCertificacionPorId:', error);
    return errorResponse(res, 'Error al obtener certificación', 500);
  }
};

/**
 * @desc    Actualizar certificación
 * @route   PUT /api/certificaciones/:id
 * @access  Private (CANDIDATO - solo propias)
 */
exports.actualizarCertificacion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    const { id } = req.params;
    const candidatoId = req.user.id;
    const {
      nombre_certificacion,
      entidad_emisora,
      fecha_emision,
      fecha_vencimiento,
      codigo_credencial,
      url_verificacion
    } = req.body;

    const certificacion = await Certificacion.findOne({
      where: { id, candidato_id: candidatoId }
    });

    if (!certificacion) {
      return errorResponse(res, 'Certificación no encontrada', 404);
    }

    // Validar fechas si se proporcionan
    if (fecha_vencimiento) {
      const fechaVenc = new Date(fecha_vencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaVenc < hoy) {
        return errorResponse(res, 'La fecha de vencimiento debe ser futura o igual a hoy', 400);
      }
    }

    if (fecha_emision) {
      const fechaEmis = new Date(fecha_emision);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      
      if (fechaEmis > hoy) {
        return errorResponse(res, 'La fecha de emisión no puede ser futura', 400);
      }
    }

    await certificacion.update({
      nombre_certificacion: nombre_certificacion || certificacion.nombre_certificacion,
      entidad_emisora: entidad_emisora || certificacion.entidad_emisora,
      fecha_emision: fecha_emision || certificacion.fecha_emision,
      fecha_vencimiento: fecha_vencimiento !== undefined ? fecha_vencimiento : certificacion.fecha_vencimiento,
      codigo_credencial: codigo_credencial !== undefined ? codigo_credencial : certificacion.codigo_credencial,
      url_verificacion: url_verificacion !== undefined ? url_verificacion : certificacion.url_verificacion
    });

    return successResponse(res, certificacion, 'Certificación actualizada exitosamente');
  } catch (error) {
    console.error('Error en actualizarCertificacion:', error);
    return errorResponse(res, 'Error al actualizar certificación', 500);
  }
};

/**
 * @desc    Eliminar certificación
 * @route   DELETE /api/certificaciones/:id
 * @access  Private (CANDIDATO - solo propias)
 */
exports.eliminarCertificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const candidatoId = req.user.id;

    const certificacion = await Certificacion.findOne({
      where: { id, candidato_id: candidatoId }
    });

    if (!certificacion) {
      return errorResponse(res, 'Certificación no encontrada', 404);
    }

    await certificacion.destroy();

    return successResponse(res, null, 'Certificación eliminada exitosamente');
  } catch (error) {
    console.error('Error en eliminarCertificacion:', error);
    return errorResponse(res, 'Error al eliminar certificación', 500);
  }
};