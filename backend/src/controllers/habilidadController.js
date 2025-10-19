// file: backend/src/controllers/habilidadController.js
const { Habilidad } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { body, validationResult } = require('express-validator');

exports.crear = [
  body('nombre').trim().notEmpty().isLength({ max: 100 })
    .withMessage('Nombre de habilidad requerido'),
  body('tipo_habilidad').isIn(['TECNICA', 'BLANDA', 'IDIOMA', 'HERRAMIENTA'])
    .withMessage('Tipo de habilidad inválido'),
  body('nivel').isIn(['BASICO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO'])
    .withMessage('Nivel inválido'),

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

      const habilidad = await Habilidad.create({
        candidato_id: candidatoId,
        ...req.body
      });

      return successResponse(res, habilidad, 'Habilidad creada exitosamente', 201);
    } catch (error) {
      console.error('Error en crear habilidad:', error);
      return errorResponse(res, 'Error al crear habilidad', 500);
    }
  }
];

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

    const habilidades = await Habilidad.findAll({
      where: { candidato_id: candidatoId },
      order: [['tipo_habilidad', 'ASC'], ['nivel', 'DESC']]
    });

    return successResponse(res, habilidades, 'Habilidades obtenidas exitosamente');
  } catch (error) {
    console.error('Error en listar habilidades:', error);
    return errorResponse(res, 'Error al obtener habilidades', 500);
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const candidatoId = req.user.candidato_id;

    const habilidad = await Habilidad.findByPk(id);
    if (!habilidad) {
      return errorResponse(res, 'Habilidad no encontrada', 404);
    }

    if (habilidad.candidato_id !== candidatoId) {
      return errorResponse(res, 'No autorizado', 403);
    }

    await habilidad.update(req.body);
    return successResponse(res, habilidad, 'Habilidad actualizada exitosamente');
  } catch (error) {
    console.error('Error en actualizar habilidad:', error);
    return errorResponse(res, 'Error al actualizar habilidad', 500);
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const candidatoId = req.user.candidato_id;

    const habilidad = await Habilidad.findByPk(id);
    if (!habilidad) {
      return errorResponse(res, 'Habilidad no encontrada', 404);
    }

    if (habilidad.candidato_id !== candidatoId) {
      return errorResponse(res, 'No autorizado', 403);
    }

    await habilidad.destroy();
    return successResponse(res, null, 'Habilidad eliminada exitosamente');
  } catch (error) {
    console.error('Error en eliminar habilidad:', error);
    return errorResponse(res, 'Error al eliminar habilidad', 500);
  }
};


