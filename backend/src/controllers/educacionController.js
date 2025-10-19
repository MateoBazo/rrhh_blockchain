// file: backend/src/controllers/educacionController.js
const { Educacion, Candidato } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { body, validationResult } = require('express-validator');

/**
 * @desc    Crear registro de educación
 * @route   POST /api/educacion
 * @access  Private (CANDIDATO)
 */
exports.crear = [
  // Validaciones
  body('nivel_educacion').isIn(['SECUNDARIA', 'TECNICO', 'UNIVERSITARIO', 'POSTGRADO', 'MAESTRIA', 'DOCTORADO'])
    .withMessage('Nivel de educación inválido'),
  body('institucion').trim().notEmpty().isLength({ max: 200 })
    .withMessage('Institución requerida (máx 200 caracteres)'),
  body('titulo_obtenido').trim().notEmpty().isLength({ max: 200 })
    .withMessage('Título obtenido requerido'),
  body('fecha_inicio').isISO8601().withMessage('Fecha de inicio inválida'),
  body('fecha_fin').optional().isISO8601().withMessage('Fecha de fin inválida'),
  body('promedio').optional().isFloat({ min: 0, max: 100 }).withMessage('Promedio debe estar entre 0 y 100'),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Errores de validación', 400, errors.array());
      }

      const candidatoId = req.user.candidato_id;
      if (!candidatoId) {
        return errorResponse(res, 'Usuario no tiene perfil de candidato', 403);
      }

      // Validar que fecha_fin sea posterior a fecha_inicio
      if (req.body.fecha_fin && req.body.fecha_inicio) {
        const inicio = new Date(req.body.fecha_inicio);
        const fin = new Date(req.body.fecha_fin);
        if (fin < inicio) {
          return errorResponse(res, 'Fecha de fin debe ser posterior a fecha de inicio', 400);
        }
      }

      const educacion = await Educacion.create({
        candidato_id: candidatoId,
        ...req.body
      });

      return successResponse(res, educacion, 'Educación creada exitosamente', 201);
    } catch (error) {
      console.error('Error en crear educación:', error);
      return errorResponse(res, 'Error al crear educación', 500);
    }
  }
];

/**
 * @desc    Listar educación del candidato
 * @route   GET /api/educacion
 * @access  Private
 */
exports.listar = async (req, res) => {
  try {
    const candidatoId = req.user.candidato_id || req.query.candidato_id;

    if (!candidatoId) {
      return errorResponse(res, 'ID de candidato requerido', 400);
    }

    // Verificar permisos
    if (req.user.rol !== 'ADMIN' && 
        req.user.rol !== 'EMPRESA' && 
        req.user.candidato_id !== parseInt(candidatoId)) {
      return errorResponse(res, 'No autorizado', 403);
    }

    const educaciones = await Educacion.findAll({
      where: { candidato_id: candidatoId },
      order: [['fecha_inicio', 'DESC']]
    });

    return successResponse(res, educaciones, 'Educación obtenida exitosamente');
  } catch (error) {
    console.error('Error en listar educación:', error);
    return errorResponse(res, 'Error al obtener educación', 500);
  }
};

/**
 * @desc    Actualizar educación
 * @route   PUT /api/educacion/:id
 * @access  Private (CANDIDATO propietario)
 */
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const candidatoId = req.user.candidato_id;

    const educacion = await Educacion.findByPk(id);
    if (!educacion) {
      return errorResponse(res, 'Educación no encontrada', 404);
    }

    // Verificar pertenencia
    if (educacion.candidato_id !== candidatoId) {
      return errorResponse(res, 'No autorizado', 403);
    }

    await educacion.update(req.body);
    return successResponse(res, educacion, 'Educación actualizada exitosamente');
  } catch (error) {
    console.error('Error en actualizar educación:', error);
    return errorResponse(res, 'Error al actualizar educación', 500);
  }
};

/**
 * @desc    Eliminar educación
 * @route   DELETE /api/educacion/:id
 * @access  Private (CANDIDATO propietario)
 */
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const candidatoId = req.user.candidato_id;

    const educacion = await Educacion.findByPk(id);
    if (!educacion) {
      return errorResponse(res, 'Educación no encontrada', 404);
    }

    if (educacion.candidato_id !== candidatoId) {
      return errorResponse(res, 'No autorizado', 403);
    }

    await educacion.destroy();
    return successResponse(res, null, 'Educación eliminada exitosamente');
  } catch (error) {
    console.error('Error en eliminar educación:', error);
    return errorResponse(res, 'Error al eliminar educación', 500);
  }
};