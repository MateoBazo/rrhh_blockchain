// file: backend/src/routes/referenciasRoutes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verificarToken, verificarRoles } = require('../middlewares/auth'); // ✅ verificarRoles (con S)
const {
  crearReferencia,
  obtenerReferencias,
  obtenerReferenciaPorId,
  actualizarReferencia,
  eliminarReferencia,
  enviarVerificacion,
  verificarReferencia,
  obtenerReferenciasVerificadas, // 🆕 S008.3
  registrarAcceso                // 🆕 S008.3
} = require('../controllers/referenciasController');

// Validaciones
const validacionReferencia = [
  body('nombre_completo').trim().notEmpty().withMessage('Nombre completo es requerido'),
  body('empresa').trim().notEmpty().withMessage('Empresa es requerida'),
  body('cargo').trim().notEmpty().withMessage('Cargo es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('telefono').optional().trim(),
  body('relacion').trim().notEmpty().withMessage('Relación es requerida'),
  body('notas').optional().trim()
];

// 🆕 Validaciones para registrar acceso S008.3
const validacionRegistrarAcceso = [
  body('motivo')
    .notEmpty().withMessage('El motivo es requerido')
    .isLength({ min: 100, max: 1000 }).withMessage('El motivo debe tener entre 100 y 1000 caracteres'),
  body('duracion_vista_segundos')
    .optional()
    .isInt({ min: 1, max: 3600 }).withMessage('Duración debe estar entre 1 y 3600 segundos')
];

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// IMPORTANTE: Estas deben ir ANTES del middleware verificarToken
// ============================================

// GET /api/referencias/verificar/:token - Verificar referencia (PÚBLICO)
router.get('/verificar/:token', verificarReferencia);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

// Aplicar middleware de autenticación a todas las rutas siguientes
router.use(verificarToken);

// POST /api/referencias - Crear referencia (CANDIDATO)
router.post('/', verificarRoles(['CANDIDATO', 'ADMIN']), validacionReferencia, crearReferencia);

// GET /api/referencias - Obtener todas las referencias
router.get('/', obtenerReferencias);

// GET /api/referencias/:id - Obtener referencia por ID
router.get('/:id', obtenerReferenciaPorId);

// PUT /api/referencias/:id - Actualizar referencia (CANDIDATO)
router.put('/:id', verificarRoles(['CANDIDATO', 'ADMIN']), validacionReferencia, actualizarReferencia);

// DELETE /api/referencias/:id - Eliminar referencia (CANDIDATO)
router.delete('/:id', verificarRoles(['CANDIDATO', 'ADMIN']), eliminarReferencia);

// POST /api/referencias/:id/enviar-verificacion - Enviar email verificación (CANDIDATO)
router.post('/:id/enviar-verificacion', verificarRoles(['CANDIDATO', 'ADMIN']), enviarVerificacion);

// ============================================
// 🆕 RUTAS S008.3 - CONSULTA EMPRESA
// ============================================

// GET /api/referencias/candidatos/:id/verificadas - Obtener referencias verificadas (EMPRESA)
router.get('/candidatos/:id/verificadas', verificarRoles(['EMPRESA', 'ADMIN']), obtenerReferenciasVerificadas);

// POST /api/referencias/:id/registrar-acceso - Registrar acceso empresa (EMPRESA)
router.post('/:id/registrar-acceso', verificarRoles(['EMPRESA', 'ADMIN']), validacionRegistrarAcceso, registrarAcceso);

module.exports = router;