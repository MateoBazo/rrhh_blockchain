// file: backend/src/controllers/referenciasController.js

const { Referencia, Candidato, TokenVerificacion, AccesoReferencia, Empresa, Usuario } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

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
// MÉTODOS S008.2 - VERIFICACIÓN
// ============================================

/**
 * @desc    Enviar email de verificación
 * @route   POST /api/referencias/:id/enviar-verificacion
 * @access  Private (CANDIDATO - solo su propia referencia)
 */
exports.enviarVerificacion = async (req, res) => {
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

    if (tokenVerificacion.usado) {
      return errorResponse(res, 400, 'Este link de verificación ya fue utilizado');
    }

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

// ============================================
// 🆕 NUEVOS MÉTODOS S008.3 - CONSULTA EMPRESA
// ============================================

/**
 * @desc    Obtener referencias verificadas de un candidato
 * @route   GET /api/referencias/candidatos/:id/verificadas
 * @access  Private (EMPRESA)
 */
// file: backend/src/controllers/referenciasController.js

// ... (mantener todo el código anterior hasta obtenerReferenciasVerificadas) ...

/**
 * @desc    Obtener referencias verificadas de un candidato
 * @route   GET /api/referencias/candidatos/:id/verificadas
 * @access  Private (EMPRESA)
 */
exports.obtenerReferenciasVerificadas = async (req, res) => {
  try {
    const { id: candidatoId } = req.params;
    
    // Obtener empresa_id del usuario autenticado
    const empresa = await Empresa.findOne({
      where: { usuario_id: req.usuario.id }
    });

    if (!empresa) {
      return errorResponse(res, 403, 'Solo empresas pueden acceder a este recurso');
    }

    const empresaId = empresa.id;

    // Validar candidato existe
    const candidato = await Candidato.findByPk(candidatoId, {
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['email']
      }],
      // ✅ CAMBIAR: Solo campos que existen
      attributes: ['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'profesion']
    });

    if (!candidato) {
      return errorResponse(res, 404, 'Candidato no encontrado');
    }

    // Obtener referencias verificadas
    const referencias = await Referencia.findAll({
      where: {
        candidato_id: candidatoId,
        verificado: true
      },
      attributes: [
        'id',
        'nombre_completo',
        'cargo',
        'empresa',
        'relacion',
        'email',
        'telefono',
        'notas',
        'fecha_verificacion',
        'verificado'
      ],
      order: [['fecha_verificacion', 'DESC']]
    });

    if (referencias.length === 0) {
      return successResponse(res, 200, 'Este candidato no tiene referencias verificadas aún', {
        candidato: {
          id: candidato.id,
          nombre_completo: `${candidato.nombres} ${candidato.apellido_paterno} ${candidato.apellido_materno || ''}`.trim(),
          profesion: candidato.profesion, // ✅ CAMBIAR
          email: candidato.usuario.email
        },
        referencias: [],
        total: 0
      });
    }

    // Obtener conteo de accesos previos de ESTA empresa para cada referencia
    const referenciasConAccesos = await Promise.all(
      referencias.map(async (ref) => {
        const conteoAccesos = await AccesoReferencia.count({
          where: {
            referencia_id: ref.id,
            empresa_id: empresaId
          }
        });

        return {
          ...ref.toJSON(),
          accesos_previos: conteoAccesos
        };
      })
    );

    return successResponse(res, 200, `${referenciasConAccesos.length} referencia(s) verificada(s) encontrada(s)`, {
      candidato: {
        id: candidato.id,
        nombre_completo: `${candidato.nombres} ${candidato.apellido_paterno} ${candidato.apellido_materno || ''}`.trim(),
        profesion: candidato.profesion, // ✅ CAMBIAR
        email: candidato.usuario.email
      },
      referencias: referenciasConAccesos,
      total: referenciasConAccesos.length
    });

  } catch (error) {
    console.error('❌ Error en obtenerReferenciasVerificadas:', error);
    return errorResponse(res, 500, 'Error al obtener referencias verificadas', error.message);
  }
};

/**
 * @desc    Registrar acceso de empresa a referencia
 * @route   POST /api/referencias/:id/registrar-acceso
 * @access  Private (EMPRESA)
 */
exports.registrarAcceso = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Errores de validación', errors.array());
    }

    const { id: referenciaId } = req.params;
    const { motivo, duracion_vista_segundos } = req.body;

    // Obtener empresa del usuario autenticado
    const empresa = await Empresa.findOne({
      where: { usuario_id: req.usuario.id },
      attributes: ['id', 'nombre_comercial', 'razon_social']
    });

    if (!empresa) {
      return errorResponse(res, 403, 'Solo empresas pueden acceder a este recurso');
    }

    const empresaId = empresa.id;

    // Validar motivo
    if (!motivo || motivo.trim().length < 100) {
      return errorResponse(res, 400, 'El motivo debe tener mínimo 100 caracteres');
    }

    if (motivo.length > 1000) {
      return errorResponse(res, 400, 'El motivo no puede exceder 1000 caracteres');
    }

    // Validar duración si se proporciona
    if (duracion_vista_segundos !== undefined) {
      if (duracion_vista_segundos < 1 || duracion_vista_segundos > 3600) {
        return errorResponse(res, 400, 'Duración debe estar entre 1 y 3600 segundos');
      }
    }

    // Obtener referencia con candidato
    const referencia = await Referencia.findByPk(referenciaId, {
      include: [{
        model: Candidato,
        as: 'candidato',
        // ✅ CAMBIAR: Solo campos que existen
        attributes: ['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'profesion'],
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['email']
        }]
      }],
      attributes: [
        'id',
        'nombre_completo',
        'cargo',
        'empresa',
        'email',
        'telefono',
        'verificado',
        'candidato_id'
      ]
    });

    if (!referencia) {
      return errorResponse(res, 404, 'Referencia no encontrada');
    }

    // CRÍTICO: Solo referencias verificadas
    if (!referencia.verificado) {
      return errorResponse(res, 400, 'Esta referencia no ha sido verificada aún');
    }

    // Rate limiting: 1 consulta/hora por empresa-referencia
    const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);
    const accesoReciente = await AccesoReferencia.findOne({
      where: {
        empresa_id: empresaId,
        referencia_id: referenciaId,
        fecha_acceso: {
          [Op.gte]: unaHoraAtras
        }
      },
      order: [['fecha_acceso', 'DESC']]
    });

    if (accesoReciente) {
      const minutosTranscurridos = Math.floor((Date.now() - accesoReciente.fecha_acceso) / 1000 / 60);
      const minutosRestantes = 60 - minutosTranscurridos;
      
      return errorResponse(
        res,
        429,
        `Ya consultaste esta referencia hace ${minutosTranscurridos} minuto(s). Por favor espera ${minutosRestantes} minuto(s) antes de consultar nuevamente.`
      );
    }

    // Obtener IP y user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Crear registro de acceso
    const acceso = await AccesoReferencia.create({
      referencia_id: referenciaId,
      empresa_id: empresaId,
      candidato_id: referencia.candidato_id,
      fecha_acceso: new Date(),
      motivo: motivo.trim(),
      ip_address: ipAddress,
      user_agent: userAgent,
      duracion_vista_segundos: duracion_vista_segundos || null
    });

    // Enviar notificación a la referencia
    try {
      await emailService.enviarEmailNotificacionAcceso({
        nombreReferencia: referencia.nombre_completo,
        emailReferencia: referencia.email,
        nombreEmpresa: empresa.nombre_comercial || empresa.razon_social,
        nombreCandidato: `${referencia.candidato.nombres} ${referencia.candidato.apellido_paterno} ${referencia.candidato.apellido_materno || ''}`.trim(),
        cargoCandidato: referencia.candidato.profesion || 'No especificado', // ✅ CAMBIAR
        fechaConsulta: new Date().toLocaleString('es-BO', { 
          dateStyle: 'long', 
          timeStyle: 'short',
          timeZone: 'America/La_Paz'
        }),
        motivo: motivo.trim()
      });

      console.log(`✅ Notificación enviada a referencia: ${referencia.email}`);
    } catch (emailError) {
      console.error('❌ Error enviando notificación a referencia:', emailError);
    }

    // Notificar al candidato
    try {
      await emailService.enviarEmailNotificacionAccesoCandidato({
        nombreCandidato: referencia.candidato.nombres,
        emailCandidato: referencia.candidato.usuario.email,
        nombreEmpresa: empresa.nombre_comercial || empresa.razon_social,
        nombreReferencia: referencia.nombre_completo,
        cargoReferencia: referencia.cargo,
        empresaReferencia: referencia.empresa,
        fechaConsulta: new Date().toLocaleString('es-BO', { 
          dateStyle: 'long', 
          timeStyle: 'short',
          timeZone: 'America/La_Paz'
        }),
        motivo: motivo.trim()
      });

      console.log(`✅ Notificación enviada a candidato: ${referencia.candidato.usuario.email}`);
    } catch (emailError) {
      console.error('❌ Error enviando notificación a candidato:', emailError);
    }

    return successResponse(res, 201, 'Consulta registrada exitosamente', {
      mensaje: 'Consulta registrada exitosamente',
      acceso: {
        id: acceso.id,
        fecha_acceso: acceso.fecha_acceso,
        referencia: {
          nombre: referencia.nombre_completo,
          email: referencia.email
        },
        notificacion_enviada: true
      }
    });

  } catch (error) {
    console.error('❌ Error en registrarAcceso:', error);
    return errorResponse(res, 500, 'Error al registrar acceso a referencia', error.message);
  }
};