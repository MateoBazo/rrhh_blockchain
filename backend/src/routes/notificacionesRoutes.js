// file: backend/src/routes/notificacionesRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');
const {
  crearNotificacion,
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  limpiarNotificacionesLeidas
} = require('../controllers/notificacionesController');

router.use(verificarToken);

const validacionNotificacion = [
  body('usuario_id').isInt().withMessage('ID de usuario inválido'),
  body('tipo_notificacion').trim().notEmpty().withMessage('Tipo de notificación es requerido'),
  body('titulo').trim().notEmpty().withMessage('Título es requerido'),
  body('mensaje').trim().notEmpty().withMessage('Mensaje es requerido'),
  body('link_relacionado').optional().trim()
];

// POST /api/notificaciones - Crear notificación (solo ADMIN)
router.post('/', validacionNotificacion, crearNotificacion);

// GET /api/notificaciones - Obtener notificaciones del usuario
router.get('/', obtenerNotificaciones);

// PUT /api/notificaciones/:id/leer - Marcar como leída
router.put('/:id/leer', marcarComoLeida);

// PUT /api/notificaciones/leer-todas - Marcar todas como leídas
router.put('/leer-todas', marcarTodasComoLeidas);

// DELETE /api/notificaciones/:id - Eliminar notificación
router.delete('/:id', eliminarNotificacion);

// DELETE /api/notificaciones/limpiar-leidas - Limpiar todas las leídas
router.delete('/limpiar-leidas', limpiarNotificacionesLeidas);

module.exports = router;