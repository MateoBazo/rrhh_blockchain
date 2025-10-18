// file: backend/src/routes/candidatoRoutes.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  obtenerCandidatos,
  obtenerCandidatoPorId,
  guardarPerfilCandidato
} = require('../controllers/candidatoController');
const { verificarToken, verificarRoles } = require('../middlewares/auth');

/**
 * GET /api/candidatos
 * Obtener todos los candidatos (con filtros)
 */
router.get('/', verificarToken, obtenerCandidatos);

/**
 * GET /api/candidatos/:id
 * Obtener candidato por ID
 */
router.get('/:id', [
  verificarToken,
  param('id').isInt().withMessage('ID debe ser un número entero')
], obtenerCandidatoPorId);

/**
 * POST/PUT /api/candidatos/perfil
 * Crear o actualizar perfil de candidato
 */
router.post('/perfil', [
  verificarToken,
  body('nombres')
    .notEmpty().withMessage('Los nombres son requeridos')
    .isLength({ max: 100 }),
  body('apellido_paterno')
    .notEmpty().withMessage('El apellido paterno es requerido')
    .isLength({ max: 100 }),
  body('ci')
    .optional()
    .isLength({ max: 20 }),
  body('telefono')
    .optional()
    .isLength({ max: 20 }),
  body('profesion')
    .optional()
    .isLength({ max: 150 }),
  body('nivel_educativo')
    .optional()
    .isIn(['Secundaria', 'Técnico', 'Universitario', 'Postgrado', 'Maestría', 'Doctorado']),
  body('estado_laboral')
    .optional()
    .isIn(['Empleado', 'Desempleado', 'Buscando', 'Freelance', 'Estudiante']),
  body('disponibilidad')
    .optional()
    .isIn(['Inmediata', '15 días', '1 mes', '2 meses', 'No disponible']),
  body('modalidad_preferida')
    .optional()
    .isIn(['Presencial', 'Remoto', 'Híbrido', 'Indiferente'])
], guardarPerfilCandidato);

module.exports = router;//.