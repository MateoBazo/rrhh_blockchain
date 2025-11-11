// file: backend/src/routes/candidatoRoutes.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  obtenerMiPerfil,           
  obtenerCandidatos,
  obtenerCandidatoPorId,
  actualizarPerfil,          
  guardarPerfilCandidato,
  obtenerPerfilCompleto,
  obtenerCandidatosConReferenciasVerificadas
} = require('../controllers/candidatoController');
const { verificarToken, verificarRoles } = require('../middlewares/auth');

router.get('/con-referencias-verificadas', 
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  obtenerCandidatosConReferenciasVerificadas
);

// ============================================
// 🆕 RUTAS NUEVAS S007.3.1
// ============================================

/**
 * GET /api/candidatos/me
 * Obtener perfil del candidato actual (usuario logueado)
 * Rol: CANDIDATO, ADMIN
 */
router.get('/me', 
  verificarToken,
  obtenerMiPerfil
);

/**
 * PUT /api/candidatos/:id
 * Actualizar perfil de candidato
 * Rol: CANDIDATO (solo su propio perfil), ADMIN
 */
router.put('/:id', [
  verificarToken,
  param('id').isInt().withMessage('ID debe ser un número entero'),
  body('nombre').optional().isLength({ min: 2, max: 50 }).trim(),
  body('apellido').optional().isLength({ min: 2, max: 50 }).trim(),
  body('telefono').optional().matches(/^[\d\s\-+()]+$/),
  body('direccion').optional().isLength({ max: 200 }).trim(),
  body('fecha_nacimiento').optional().isISO8601(),
  body('resumen_profesional').optional().isLength({ max: 1000 }).trim(),
  body('perfil_publico').optional().isBoolean(),
], actualizarPerfil);

// ============================================
// RUTAS EXISTENTES (mantener compatibilidad)
// ============================================

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
 * GET /api/candidatos/:id/perfil-completo
 * Obtener perfil completo con todas las relaciones
 */
router.get('/:id/perfil-completo', [
  verificarToken,
  param('id').isInt().withMessage('ID debe ser un número entero')
], obtenerPerfilCompleto);

/**
 * POST /api/candidatos/perfil
 * Crear o actualizar perfil de candidato (LEGACY - mantener compatibilidad)
 */
router.post('/perfil', [
  verificarToken,
  body('nombres').optional().isLength({ max: 100 }),
  body('apellido_paterno').optional().isLength({ max: 100 }),
  body('ci').optional().isLength({ max: 20 }),
  body('telefono').optional().isLength({ max: 20 }),
  body('profesion').optional().isLength({ max: 150 }),
  body('nivel_educativo').optional().isIn(['Secundaria', 'Técnico', 'Universitario', 'Postgrado', 'Maestría', 'Doctorado']),
  body('estado_laboral').optional().isIn(['Empleado', 'Desempleado', 'Buscando', 'Freelance', 'Estudiante']),
  body('disponibilidad').optional().isIn(['Inmediata', '15 días', '1 mes', '2 meses', 'No disponible']),
  body('modalidad_preferida').optional().isIn(['Presencial', 'Remoto', 'Híbrido', 'Indiferente'])
], guardarPerfilCandidato);

module.exports = router;