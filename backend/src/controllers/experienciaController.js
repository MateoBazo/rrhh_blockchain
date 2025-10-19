// file: backend/src/controllers/experienciaController.js
const { ExperienciaLaboral } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { body, validationResult } = require('express-validator');

/**
 * @desc    Crear experiencia laboral
 * @route   POST /api/experiencia
 * @access  Private (CANDIDATO)
 */
exports.crear = [
  body('empresa').trim().notEmpty().isLength({ max: 200 })
    .withMessage('Nombre de empresa requerido'),
  body('cargo').trim().notEmpty().isLength({ max: 150 })
    .withMessage('Cargo requerido'),
  body('tipo_empleo').isIn(['TIEMPO_COMPLETO', 'MEDIO_TIEMPO', 'FREELANCE', 'PRACTICAS', 'VOLUNTARIADO'])
    .withMessage('Tipo de empleo inválido'),
  body('fecha_inicio').isISO8601().withMessage('Fecha de inicio inválida'),
  body('fecha_fin').optional().isISO8601().withMessage('Fecha de fin inválida'),

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

      const experiencia = await ExperienciaLaboral.create({
        candidato_id: candidatoId,
        ...req.body
      });

      return successResponse(res, experiencia, 'Experiencia creada exitosamente', 201);
    } catch (error) {
      console.error('Error en crear experiencia:', error);
      return errorResponse(res, 'Error al crear experiencia', 500);
    }
  }
];

/**
 * @desc    Listar experiencia laboral
 * @route   GET /api/experiencia
 * @access  Private
 */
exports.listar = async (req, res) => {
  try {
    const candidatoId = req.user.candidato_id || req.query.candidato_id;

    if (!candidatoId) {
      return errorResponse(res, 'ID de candidato requerido', 400);
    }

    if (req.user.rol !== 'ADMIN' && 
        req.user.rol !== 'EMPRESA' && 
        req.user.candidato_id !== parseInt(candidatoId)) {
      return errorResponse(res, 'No autorizado', 403);
    }

    const experiencias = await ExperienciaLaboral.findAll({
      where: { candidato_id: candidatoId },
      order: [['fecha_inicio', 'DESC']]
    });

    return successResponse(res, experiencias, 'Experiencia obtenida exitosamente');
  } catch (error) {
    console.error('Error en listar experiencia:', error);
    return errorResponse(res, 'Error al obtener experiencia', 500);
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const candidatoId = req.user.candidato_id;

    const experiencia = await ExperienciaLaboral.findByPk(id);
    if (!experiencia) {
      return errorResponse(res, 'Experiencia no encontrada', 404);
    }

    if (experiencia.candidato_id !== candidatoId) {
      return errorResponse(res, 'No autorizado', 403);
    }

    await experiencia.update(req.body);
    return successResponse(res, experiencia, 'Experiencia actualizada exitosamente');
  } catch (error) {
    console.error('Error en actualizar experiencia:', error);
    return errorResponse(res, 'Error al actualizar experiencia', 500);
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const candidatoId = req.user.candidato_id;

    const experiencia = await ExperienciaLaboral.findByPk(id);
    if (!experiencia) {
      return errorResponse(res, 'Experiencia no encontrada', 404);
    }

    if (experiencia.candidato_id !== candidatoId) {
      return errorResponse(res, 'No autorizado', 403);
    }

    await experiencia.destroy();
    return successResponse(res, null, 'Experiencia eliminada exitosamente');
  } catch (error) {
    console.error('Error en eliminar experiencia:', error);
    return errorResponse(res, 'Error al eliminar experiencia', 500);
  }
};