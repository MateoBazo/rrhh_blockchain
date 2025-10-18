// file: backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registrar, login, obtenerPerfil } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');

/**
 * POST /api/auth/registrar
 * Registro de nuevo usuario - VALIDACIONES SIMPLIFICADAS
 */
router.post('/registrar', [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres')
], registrar);

/**
 * POST /api/auth/login
 * Login de usuario
 */
router.post('/login', [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
], login);

/**
 * GET /api/auth/perfil
 * Obtener perfil del usuario autenticado
 * Requiere: Token JWT válido
 */
router.get('/perfil', verificarToken, obtenerPerfil);

module.exports = router;//.