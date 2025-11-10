// file: backend/src/controllers/referenciasController.js

const { Referencia, Candidato, TokenVerificacion } = require('../models'); // 🆕 Agregar TokenVerificacion
const { successResponse, errorResponse } = require('../utils/responses');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const emailService = require('../services/emailService'); // 🆕 Agregar emailService

/**
 * @desc    Crear nueva referencia
 * @route   POST /api/referencias
 * @access  Private (CANDIDATO)
 */
exports.crearReferencia = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Errores de validación', errors.array());
    }

    // ✅ CORRECCIÓN: req.usuario (no req.user)
    if (!req.usuario || !req.usuario.id) {
      return errorResponse(res, 401, 'Usuario no autenticado');
    }

    const { candidato_id, nombre_completo, empresa, cargo, email, telefono, relacion, notas } = req.body;

    // Verificar que el candidato existe
    const candidato = await Candidato.findByPk(candidato_id);
    if (!candidato) {
      return errorResponse(res, 404, 'Candidato no encontrado');
    }

    // RBAC: Solo el candidato dueño o ADMIN pueden crear referencias
    if (req.usuario.rol !== 'ADMIN' && candidato.usuario_id !== req.usuario.id) {
      return errorResponse(res, 403, 'No tienes permiso para crear referencias de otro candidato');
    }

    // Validación 1: Máximo 3 referencias por candidato
    const totalReferencias = await Referencia.count({ 
      where: { candidato_id } 
    });
    
    if (totalReferencias >= 3) {
      return errorResponse(res, 400, 'Ya tienes el máximo de 3 referencias permitidas');
    }

    // Validación 2: Email único entre las referencias del candidato
    const referenciaExistente = await Referencia.findOne({
      where: { 
        candidato_id, 
        email: email.toLowerCase() 
      }
    });
    
    if (referenciaExistente) {
      return errorResponse(res, 400, 'Ya tienes una referencia con este email');
    }

    // Crear referencia
    const referencia = await Referencia.create({
      candidato_id,
      nombre_completo,
      empresa,
      cargo,
      email: email.toLowerCase(),
      telefono,
      relacion,
      notas
    });

    return successResponse(res, 201, 'Referencia creada exitosamente', referencia);
  } catch (error) {
    console.error('❌ Error en crearReferencia:', error);
    return errorResponse(res, 500, 'Error al crear la referencia', error.message);
  }
};

/**
 * @desc    Obtener referencias (filtrado opcional por candidato_id)
 * @route   GET /api/referencias?candidato_id=X
 * @access  Private
 */
exports.obtenerReferencias = async (req, res) => {
  try {
    const { candidato_id } = req.query;

    // Si se proporciona candidato_id, filtrar por ese candidato
    // ADMIN puede ver cualquiera, CANDIDATO solo las suyas
    let where = {};
    
    if (candidato_id) {
      const candidato = await Candidato.findByPk(candidato_id);
      if (!candidato) {
        return errorResponse(res, 404, 'Candidato no encontrado');
      }

      // RBAC: Solo ADMIN o el candidato dueño pueden ver referencias
      if (req.usuario.rol !== 'ADMIN' && candidato.usuario_id !== req.usuario.id) {
        return errorResponse(res, 403, 'No tienes permiso para ver referencias de otro candidato');
      }

      where.candidato_id = candidato_id;
    } else {
      // Si no se proporciona candidato_id, solo ADMIN puede ver todas
      if (req.usuario.rol !== 'ADMIN') {
        return errorResponse(res, 403, 'Debes especificar candidato_id');
      }
    }

    const referencias = await Referencia.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    return successResponse(res, 200, `${referencias.length} referencia(s) encontrada(s)`, referencias);
  } catch (error) {
    console.error('❌ Error en obtenerReferencias:', error);
    return errorResponse(res, 500, 'Error al obtener referencias', error.message);
  }
};

/**
 * @desc    Obtener referencia por ID
 * @route   GET /api/referencias/:id
 * @access  Private
 */
exports.obtenerReferenciaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const referencia = await Referencia.findByPk(id, {
      include: [{
        model: Candidato,
        as: 'candidato'
      }]
    });

    if (!referencia) {
      return errorResponse(res, 404, 'Referencia no encontrada');
    }

    // RBAC: Solo ADMIN o el candidato dueño pueden ver la referencia
    if (req.usuario.rol !== 'ADMIN' && referencia.candidato.usuario_id !== req.usuario.id) {
      return errorResponse(res, 403, 'No tienes permiso para ver esta referencia');
    }

    return successResponse(res, 200, 'Referencia obtenida exitosamente', referencia);
  } catch (error) {
    console.error('❌ Error en obtenerReferenciaPorId:', error);
    return errorResponse(res, 500, 'Error al obtener referencia', error.message);
  }
};

/**
 * @desc    Actualizar referencia
 * @route   PUT /api/referencias/:id
 * @access  Private
 */
exports.actualizarReferencia = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Errores de validación', errors.array());
    }

    const { id } = req.params;
    const { nombre_completo, empresa, cargo, email, telefono, relacion, notas } = req.body;

    const referencia = await Referencia.findByPk(id, {
      include: [{
        model: Candidato,
        as: 'candidato'
      }]
    });

    if (!referencia) {
      return errorResponse(res, 404, 'Referencia no encontrada');
    }

    // RBAC: Solo ADMIN o el candidato dueño pueden actualizar
    if (req.usuario.rol !== 'ADMIN' && referencia.candidato.usuario_id !== req.usuario.id) {
      return errorResponse(res, 403, 'No tienes permiso para actualizar esta referencia');
    }

    // Validar email si cambió
    if (email && email.toLowerCase() !== referencia.email) {
      const emailDuplicado = await Referencia.findOne({
        where: {
          candidato_id: referencia.candidato_id,
          email: email.toLowerCase(),
          id: { [Op.ne]: id }
        }
      });
      
      if (emailDuplicado) {
        return errorResponse(res, 400, 'Ya existe una referencia con este email');
      }
    }

    await referencia.update({
      nombre_completo: nombre_completo || referencia.nombre_completo,
      empresa: empresa || referencia.empresa,
      cargo: cargo || referencia.cargo,
      email: email ? email.toLowerCase() : referencia.email,
      telefono: telefono || referencia.telefono,
      relacion: relacion || referencia.relacion,
      notas: notas !== undefined ? notas : referencia.notas
    });

    return successResponse(res, 200, 'Referencia actualizada exitosamente', referencia);
  } catch (error) {
    console.error('❌ Error en actualizarReferencia:', error);
    return errorResponse(res, 500, 'Error al actualizar referencia', error.message);
  }
};

/**
 * @desc    Eliminar referencia
 * @route   DELETE /api/referencias/:id
 * @access  Private
 */
exports.eliminarReferencia = async (req, res) => {
  try {
    const { id } = req.params;

    const referencia = await Referencia.findByPk(id, {
      include: [{
        model: Candidato,
        as: 'candidato'
      }]
    });

    if (!referencia) {
      return errorResponse(res, 404, 'Referencia no encontrada');
    }

    // RBAC: Solo ADMIN o el candidato dueño pueden eliminar
    if (req.usuario.rol !== 'ADMIN' && referencia.candidato.usuario_id !== req.usuario.id) {
      return errorResponse(res, 403, 'No tienes permiso para eliminar esta referencia');
    }

    await referencia.destroy();

    return successResponse(res, 200, 'Referencia eliminada exitosamente', null);
  } catch (error) {
    console.error('❌ Error en eliminarReferencia:', error);
    return errorResponse(res, 500, 'Error al eliminar referencia', error.message);
  }
};

// ============================================
// 🆕 NUEVOS MÉTODOS S008.2 - VERIFICACIÓN
// ============================================

/**
 * @desc    Enviar email de verificación
 * @route   POST /api/referencias/:id/enviar-verificacion
 * @access  Private (CANDIDATO - solo su propia referencia)
 */
exports.enviarVerificacion = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar referencia con datos del candidato
    const referencia = await Referencia.findByPk(id, {
      include: [{
        model: Candidato,
        as: 'candidato'
      }]
    });

    if (!referencia) {
      return errorResponse(res, 404, 'Referencia no encontrada');
    }

    // RBAC: Solo el candidato dueño puede enviar verificación
    if (req.usuario.rol !== 'ADMIN' && referencia.candidato.usuario_id !== req.usuario.id) {
      return errorResponse(res, 403, 'No tienes permiso para esta acción');
    }

    // Validar que no esté ya verificada
    if (referencia.verificado) {
      return errorResponse(res, 400, 'Esta referencia ya está verificada');
    }

    // Verificar si ya existe un token válido reciente
    const tokenExistente = await TokenVerificacion.findOne({
      where: {
        referencia_id: id,
        usado: false
      },
      order: [['fecha_generacion', 'DESC']]
    });

    // Si existe token válido creado hace menos de 1 hora, no crear nuevo
    if (tokenExistente && !tokenExistente.estaExpirado()) {
      const minutosDesdeCreacion = Math.floor((new Date() - new Date(tokenExistente.fecha_generacion)) / 60000);
      
      if (minutosDesdeCreacion < 60) {
        return errorResponse(res, 429, `Ya se envió un email de verificación hace ${minutosDesdeCreacion} minutos. Por favor espera antes de reenviar.`);
      }
    }

    // Generar nuevo token
    const token = TokenVerificacion.generarToken();
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7); // Expira en 7 días

    // Guardar token en BD
    const tokenVerificacion = await TokenVerificacion.create({
      referencia_id: id,
      token,
      fecha_expiracion: fechaExpiracion
    });

    // Enviar email
    try {
      await emailService.enviarEmailVerificacion(referencia, token);
      
      console.log(`📧 Email de verificación enviado para referencia ${id}`);
      
      return successResponse(res, 200, 'Email de verificación enviado exitosamente', {
        email_enviado_a: referencia.email,
        expira_en: '7 días'
      });

    } catch (emailError) {
      // Si falla el envío de email, eliminar token
      await tokenVerificacion.destroy();
      console.error('❌ Error al enviar email:', emailError);
      
      return errorResponse(res, 500, 'Error al enviar email de verificación. Verifica la configuración SMTP.');
    }

  } catch (error) {
    console.error('❌ Error en enviarVerificacion:', error);
    return errorResponse(res, 500, 'Error al procesar solicitud de verificación', error.message);
  }
};

/**
 * @desc    Verificar referencia con token
 * @route   GET /api/referencias/verificar/:token
 * @access  Public
 */
exports.verificarReferencia = async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar token
    const tokenVerificacion = await TokenVerificacion.findOne({
      where: { token },
      include: [{
        model: Referencia,
        as: 'referencia',
        include: [{
          model: Candidato,
          as: 'candidato'
        }]
      }]
    });

    if (!tokenVerificacion) {
      return errorResponse(res, 404, 'Token de verificación no encontrado o inválido');
    }

    // Validar que el token no esté usado
    if (tokenVerificacion.usado) {
      return errorResponse(res, 400, 'Este link de verificación ya fue utilizado');
    }

    // Validar que el token no esté expirado
    if (tokenVerificacion.estaExpirado()) {
      return errorResponse(res, 400, 'Este link de verificación ha expirado. Solicita uno nuevo al candidato.');
    }

    // Marcar referencia como verificada
    await tokenVerificacion.referencia.update({
      verificado: true,
      fecha_verificacion: new Date()
    });

    // Marcar token como usado
    await tokenVerificacion.update({
      usado: true,
      fecha_uso: new Date(),
      ip_verificacion: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent')
    });

    console.log(`✅ Referencia ${tokenVerificacion.referencia_id} verificada exitosamente`);

    return successResponse(res, 200, 'Referencia verificada exitosamente', {
      referencia: {
        nombre_completo: tokenVerificacion.referencia.nombre_completo,
        candidato: tokenVerificacion.referencia.candidato.nombres + ' ' + tokenVerificacion.referencia.candidato.apellido_paterno,
        fecha_verificacion: tokenVerificacion.referencia.fecha_verificacion
      }
    });

  } catch (error) {
    console.error('❌ Error en verificarReferencia:', error);
    return errorResponse(res, 500, 'Error al verificar referencia', error.message);
  }
};