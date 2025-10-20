// file: backend/src/routes/contratosRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');
const {
  crearContrato,
  obtenerContratos,
  obtenerContratoPorId,
  actualizarContrato,
  eliminarContrato
} = require('../controllers/contratosController');

router.use(verificarToken);

const validacionContrato = [
  body('candidato_id').isInt().withMessage('ID de candidato inválido'),
  body('empresa_id').isInt().withMessage('ID de empresa inválido'),
  body('cargo').trim().notEmpty().withMessage('Cargo es requerido'),
  body('tipo_contrato').trim().notEmpty().withMessage('Tipo de contrato es requerido'),
  body('fecha_inicio').isISO8601().withMessage('Fecha de inicio inválida'),
  body('fecha_fin').optional().isISO8601().withMessage('Fecha de fin inválida'),
  body('salario_mensual').isFloat({ min: 0 }).withMessage('Salario mensual inválido'),
  body('moneda').optional().trim(),
  body('jornada_laboral').optional().trim(),
  body('lugar_trabajo').optional().trim(),
  body('departamento').optional().trim(),
  body('beneficios').optional().trim(),
  body('clausulas_especiales').optional().trim(),
  body('estado').optional().trim()
];

router.post('/', validacionContrato, crearContrato);
router.get('/', obtenerContratos);
router.get('/:id', obtenerContratoPorId);
router.put('/:id', validacionContrato, actualizarContrato);
router.delete('/:id', eliminarContrato);

module.exports = router;