// file: backend/src/routes/certificacionesRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');
const {
  crearCertificacion,
  obtenerCertificaciones,
  obtenerCertificacionPorId,
  actualizarCertificacion,
  eliminarCertificacion
} = require('../controllers/certificacionesController');

router.use(verificarToken);

const validacionCertificacion = [
  body('nombre_certificacion').trim().notEmpty().withMessage('Nombre de certificación es requerido'),
  body('entidad_emisora').trim().notEmpty().withMessage('Entidad emisora es requerida'),
  body('fecha_emision').isISO8601().withMessage('Fecha de emisión inválida'),
  body('fecha_vencimiento').optional().isISO8601().withMessage('Fecha de vencimiento inválida'),
  body('codigo_credencial').optional().trim(),
  body('url_verificacion').optional().isURL().withMessage('URL de verificación inválida')
];

router.post('/', validacionCertificacion, crearCertificacion);
router.get('/', obtenerCertificaciones);
router.get('/:id', obtenerCertificacionPorId);
router.put('/:id', validacionCertificacion, actualizarCertificacion);
router.delete('/:id', eliminarCertificacion);

module.exports = router;