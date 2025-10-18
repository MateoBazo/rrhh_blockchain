// file: backend/src/routes/empresaRoutes.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  obtenerEmpresas,
  obtenerEmpresaPorId,
  crearEmpresa,
  actualizarEmpresa,
  eliminarEmpresa
} = require('../controllers/empresaController');
const { verificarToken, verificarRoles } = require('../middlewares/auth');

/**
 * GET /api/empresas
 */
router.get('/', verificarToken, obtenerEmpresas);

/**
 * GET /api/empresas/:id
 */
router.get('/:id', [
  verificarToken,
  param('id').isInt().withMessage('ID debe ser un número entero')
], obtenerEmpresaPorId);

/**
 * POST /api/empresas
 * Requiere: ADMIN o EMPRESA
 */
router.post('/', [
  verificarToken,
  verificarRoles(['ADMIN', 'EMPRESA']), // 👈 ACTUALIZADO
  body('razon_social')
    .notEmpty().withMessage('La razón social es requerida')
    .isLength({ max: 255 }),
  body('nit')
    .optional()
    .isLength({ min: 5, max: 20 }),
  body('nombre_comercial')
    .optional()
    .isLength({ max: 255 }),
  body('sector')
    .optional()
    .isLength({ max: 100 }),
  body('tamanio')
    .optional()
    .isIn(['Micro', 'Pequeña', 'Mediana', 'Grande']),
  body('telefono')
    .optional()
    .isLength({ max: 20 }),
  body('sitio_web')
    .optional()
    .isURL(),
  body('direccion')
    .optional()
    .isLength({ max: 300 })
], crearEmpresa);

/**
 * PUT /api/empresas/:id
 * Requiere: ADMIN o EMPRESA (ser creador)
 */
router.put('/:id', [
  verificarToken,
  param('id').isInt().withMessage('ID debe ser un número entero'),
  body('razon_social')
    .optional()
    .isLength({ max: 255 }),
  body('nit')
    .optional()
    .isLength({ min: 5, max: 20 }),
  body('sitio_web')
    .optional()
    .isURL()
], actualizarEmpresa);

/**
 * DELETE /api/empresas/:id
 * Requiere: Solo ADMIN
 */
router.delete('/:id', [
  verificarToken,
  verificarRoles(['ADMIN']), // 👈 ACTUALIZADO
  param('id').isInt().withMessage('ID debe ser un número entero')
], eliminarEmpresa);

module.exports = router;