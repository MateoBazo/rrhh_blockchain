// file: backend/src/controllers/notificacionesController.js
const { NotificacionUsuario, Usuario } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { validationResult } = require('express-validator');

/**
 * @desc    Crear nueva notificación (sistema interno o ADMIN)
 * @route   POST /api/notificaciones
 * @access  Private (ADMIN)
 */
exports.crearNotificacion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    if (req.user.rol !== 'ADMIN') {
      return errorResponse(res, 'Solo administradores pueden crear notificaciones', 403);
    }

    const { usuario_id, tipo_notificacion, titulo, mensaje, link_relacionado } = req.body;

    // Validar que usuario existe
    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    // Tipos válidos
    const TIPOS_VALIDOS = ['INFO', 'ALERTA', 'ERROR', 'EXITO', 'RECORDATORIO'];
    if (!TIPOS_VALIDOS.includes(tipo_notificacion.toUpperCase())) {
      return errorResponse(
        res,
        `Tipo de notificación inválido. Debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`,
        400
      );
    }

    const notificacion = await NotificacionUsuario.create({
      usuario_id,
      tipo_notificacion: tipo_notificacion.toUpperCase(),
      titulo,
      mensaje,
      link_relacionado: link_relacionado || null,
      leida: false
    });

    return successResponse(res, notificacion, 'Notificación creada exitosamente', 201);
  } catch (error) {
    console.error('Error en crearNotificacion:', error);
    return errorResponse(res, 'Error al crear notificación', 500);
  }
};

/**
 * @desc    Obtener notificaciones del usuario actual
 * @route   GET /api/notificaciones
 * @access  Private
 */
exports.obtenerNotificaciones = async (req, res) => {
  try {
    const { leida, limit = 20, offset = 0 } = req.query;
    const usuarioId = req.user.id;

    const whereClause = { usuario_id: usuarioId };
    if (leida !== undefined) {
      whereClause.leida = leida === 'true';
    }

    const { count, rows: notificaciones } = await NotificacionUsuario.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const noLeidas = await NotificacionUsuario.count({
      where: { usuario_id: usuarioId, leida: false }
    });

    return successResponse(
      res,
      {
        total: count,
        no_leidas: noLeidas,
        limit: parseInt(limit),
        offset: parseInt(offset),
        notificaciones
      },
      `${count} notificación(es) encontrada(s)`
    );
  } catch (error) {
    console.error('Error en obtenerNotificaciones:', error);
    return errorResponse(res, 'Error al obtener notificaciones', 500);
  }
};

/**
 * @desc    Marcar notificación como leída
 * @route   PUT /api/notificaciones/:id/leer
 * @access  Private
 */
exports.marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const notificacion = await NotificacionUsuario.findOne({
      where: { id, usuario_id: usuarioId }
    });

    if (!notificacion) {
      return errorResponse(res, 'Notificación no encontrada', 404);
    }

    await notificacion.update({ leida: true });

    return successResponse(res, notificacion, 'Notificación marcada como leída');
  } catch (error) {
    console.error('Error en marcarComoLeida:', error);
    return errorResponse(res, 'Error al marcar notificación', 500);
  }
};

/**
 * @desc    Marcar TODAS las notificaciones como leídas
 * @route   PUT /api/notificaciones/leer-todas
 * @access  Private
 */
exports.marcarTodasComoLeidas = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const [numActualizadas] = await NotificacionUsuario.update(
      { leida: true },
      { where: { usuario_id: usuarioId, leida: false } }
    );

    return successResponse(
      res,
      { notificaciones_actualizadas: numActualizadas },
      `${numActualizadas} notificación(es) marcada(s) como leída(s)`
    );
  } catch (error) {
    console.error('Error en marcarTodasComoLeidas:', error);
    return errorResponse(res, 'Error al marcar notificaciones', 500);
  }
};

/**
 * @desc    Eliminar notificación
 * @route   DELETE /api/notificaciones/:id
 * @access  Private
 */
exports.eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const notificacion = await NotificacionUsuario.findOne({
      where: { id, usuario_id: usuarioId }
    });

    if (!notificacion) {
      return errorResponse(res, 'Notificación no encontrada', 404);
    }

    await notificacion.destroy();

    return successResponse(res, null, 'Notificación eliminada exitosamente');
  } catch (error) {
    console.error('Error en eliminarNotificacion:', error);
    return errorResponse(res, 'Error al eliminar notificación', 500);
  }
};

/**
 * @desc    Eliminar todas las notificaciones leídas del usuario
 * @route   DELETE /api/notificaciones/limpiar-leidas
 * @access  Private
 */
exports.limpiarNotificacionesLeidas = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const numEliminadas = await NotificacionUsuario.destroy({
      where: { usuario_id: usuarioId, leida: true }
    });

    return successResponse(
      res,
      { notificaciones_eliminadas: numEliminadas },
      `${numEliminadas} notificación(es) eliminada(s)`
    );
  } catch (error) {
    console.error('Error en limpiarNotificacionesLeidas:', error);
    return errorResponse(res, 'Error al limpiar notificaciones', 500);
  }
};