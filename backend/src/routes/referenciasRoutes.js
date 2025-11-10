// file: backend/src/routes/referenciasRoutes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');
const {
  crearReferencia,
  obtenerReferencias,
  obtenerReferenciaPorId,
  actualizarReferencia,
  eliminarReferencia,
  enviarVerificacion,      // 🆕 NUEVO
  verificarReferencia      // 🆕 NUEVO
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

// ============================================
// 🆕 RUTAS PÚBLICAS (sin autenticación)
// IMPORTANTE: Estas deben ir ANTES del middleware verificarToken
// ============================================

// GET /api/referencias/verificar/:token - Verificar referencia (PÚBLICO)
router.get('/verificar/:token', verificarReferencia);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

// Aplicar middleware de autenticación a todas las rutas siguientes
router.use(verificarToken);

// POST /api/referencias - Crear referencia
router.post('/', validacionReferencia, crearReferencia);

// GET /api/referencias - Obtener todas las referencias
router.get('/', obtenerReferencias);

// GET /api/referencias/:id - Obtener referencia por ID
router.get('/:id', obtenerReferenciaPorId);

// PUT /api/referencias/:id - Actualizar referencia
router.put('/:id', validacionReferencia, actualizarReferencia);

// DELETE /api/referencias/:id - Eliminar referencia
router.delete('/:id', eliminarReferencia);

// 🆕 POST /api/referencias/:id/enviar-verificacion - Enviar email verificación
router.post('/:id/enviar-verificacion', enviarVerificacion);

module.exports = router;