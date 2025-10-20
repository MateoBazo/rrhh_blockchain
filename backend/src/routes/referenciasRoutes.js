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
  eliminarReferencia
} = require('../controllers/referenciasController');

// Todas las rutas requieren autenticación
router.use(verificarToken);

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

module.exports = router;