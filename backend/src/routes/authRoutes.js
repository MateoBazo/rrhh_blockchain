// file: backend/src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registrar, login, obtenerPerfil } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');
const { SECTORES_ENUM, DEPARTAMENTOS_BOLIVIA } = require('../utils/constants');

/**
 * POST /api/auth/registrar
 * Registro de nuevo usuario con validaciones específicas por rol
 */
router.post('/registrar', [
  // ===== VALIDACIONES COMUNES =====
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres'),
  
  body('rol')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['CANDIDATO', 'EMPRESA']).withMessage('Rol inválido'),
  
  // ===== VALIDACIONES CONDICIONALES EMPRESA =====
  body('nit')
    .if(body('rol').equals('EMPRESA'))
    .notEmpty().withMessage('El NIT es requerido para empresas')
    .isLength({ min: 5, max: 20 }).withMessage('NIT debe tener entre 5 y 20 caracteres'),
  
  body('razon_social')
    .if(body('rol').equals('EMPRESA'))
    .notEmpty().withMessage('La razón social es requerida para empresas')
    .isLength({ min: 3, max: 255 }).withMessage('Razón social debe tener entre 3 y 255 caracteres'),
  
  body('nombre_comercial')
    .if(body('rol').equals('EMPRESA'))
    .optional()
    .isLength({ max: 255 }).withMessage('Nombre comercial muy largo'),
  
  body('sector')
    .if(body('rol').equals('EMPRESA'))
    .notEmpty().withMessage('El sector es requerido')
    .isIn(SECTORES_ENUM).withMessage('Sector inválido'),
  
  body('telefono')
    .if(body('rol').equals('EMPRESA'))
    .optional()
    .isLength({ min: 7, max: 20 }).withMessage('Teléfono inválido'),
  
  body('departamento')
    .if(body('rol').equals('EMPRESA'))
    .notEmpty().withMessage('El departamento es requerido')
    .isIn(DEPARTAMENTOS_BOLIVIA).withMessage('Departamento inválido'),
  
  body('ciudad')
    .if(body('rol').equals('EMPRESA'))
    .notEmpty().withMessage('La ciudad es requerida')
    .isLength({ min: 2, max: 100 }).withMessage('Ciudad inválida'),
  
  // ===== VALIDACIONES CONDICIONALES CANDIDATO =====
  body('ci')
    .if(body('rol').equals('CANDIDATO'))
    .notEmpty().withMessage('El CI es requerido para candidatos')
    .isLength({ min: 5, max: 20 }).withMessage('CI debe tener entre 5 y 20 caracteres'),
  
  body('nombres')
    .if(body('rol').equals('CANDIDATO'))
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  
  body('apellido_paterno')
    .if(body('rol').equals('CANDIDATO'))
    .notEmpty().withMessage('El apellido paterno es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('Apellido debe tener entre 2 y 100 caracteres'),
  
  body('apellido_materno')
    .if(body('rol').equals('CANDIDATO'))
    .optional()
    .isLength({ max: 100 }).withMessage('Apellido materno muy largo'),
  
  body('fecha_nacimiento')
    .if(body('rol').equals('CANDIDATO'))
    .notEmpty().withMessage('La fecha de nacimiento es requerida')
    .isISO8601().withMessage('Formato de fecha inválido (usar YYYY-MM-DD)')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      if (fecha >= hoy) {
        throw new Error('La fecha de nacimiento debe ser anterior a hoy');
      }
      return true;
    }),
  
  body('sector')
    .if(body('rol').equals('CANDIDATO'))
    .notEmpty().withMessage('El sector de interés es requerido')
    .isIn(SECTORES_ENUM).withMessage('Sector inválido'),
  
  body('telefono')
    .if(body('rol').equals('CANDIDATO'))
    .optional()
    .isLength({ min: 7, max: 20 }).withMessage('Teléfono inválido'),
  
  body('departamento')
    .if(body('rol').equals('CANDIDATO'))
    .notEmpty().withMessage('El departamento es requerido')
    .isIn(DEPARTAMENTOS_BOLIVIA).withMessage('Departamento inválido'),
  
  body('ciudad')
    .if(body('rol').equals('CANDIDATO'))
    .notEmpty().withMessage('La ciudad es requerida')
    .isLength({ min: 2, max: 100 }).withMessage('Ciudad inválida'),
    
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

module.exports = router;