// file: backend/src/routes/certificacionesRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verificarToken, verificarRoles } = require('../middlewares/auth');
const {
  crearCertificacion,
  obtenerCertificaciones,
  obtenerCertificacionPorId,
  actualizarCertificacion,
  eliminarCertificacion
} = require('../controllers/certificacionesController');

router.use(verificarToken);

// ✅ CORREGIDO: Usar nombres de campos del modelo
const validacionCertificacion = [
  body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
  body('institucion_emisora').trim().notEmpty().withMessage('Institución emisora es requerida'),
  body('fecha_obtencion').isISO8601().withMessage('Fecha de obtención inválida'),
  body('fecha_vencimiento').optional().isISO8601().withMessage('Fecha de vencimiento inválida'),
  body('credencial_id').optional().trim(),
  body('credencial_url').optional().isURL().withMessage('URL inválida')
];

router.post('/', verificarRoles(['CANDIDATO', 'ADMIN']), validacionCertificacion, crearCertificacion);
router.get('/', obtenerCertificaciones);
router.get('/:id', obtenerCertificacionPorId);
router.put('/:id', verificarRoles(['CANDIDATO', 'ADMIN']), validacionCertificacion, actualizarCertificacion);
router.delete('/:id', verificarRoles(['CANDIDATO', 'ADMIN']), eliminarCertificacion);

module.exports = router;