// file: backend/src/controllers/historialLaboralController.js

const { 
  HistorialLaboral, 
  Candidato, 
  Empresa, 
  Usuario,
  AccesoReferencia 
} = require('../models');
const { exitoRespuesta, errorRespuesta } = require('../utils/responses');
const { validationResult } = require('express-validator');
const { registrarAuditoria, obtenerIPReal, obtenerUserAgent } = require('../utils/auditHelper');
const { 
  notificarCertificacionPendiente, 
  notificarCertificacionAceptada, 
  notificarCertificacionRechazada 
} = require('../services/historialLaboralNotifications');
const { Op } = require('sequelize');

/**
 * ============================================
 * POST /api/historial-laboral/certificar
 * Empresa certifica experiencia laboral de ex-empleado
 * Roles: EMPRESA, ADMIN
 * ============================================
 */
const certificarExperiencia = async (req, res) => {
  try {
    // Validaciones express-validator
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const usuarioId = req.usuario.id;

    // Buscar empresa del usuario logueado
    const empresa = await Empresa.findOne({
      where: { usuario_id: usuarioId }
    });

    if (!empresa) {
      return errorRespuesta(res, 404, 'No tienes una empresa asociada');
    }

    const {
      candidato_id,
      cargo,
      departamento,
      fecha_inicio,
      fecha_fin,
      actualmente_trabajando,
      descripcion_responsabilidades,
      logros_principales,
      razon_salida,
      tipo_contrato
    } = req.body;

    // ============================================
    // VALIDACIONES DE NEGOCIO
    // ============================================
    
    // 1. Candidato existe
    const candidato = await Candidato.findByPk(candidato_id, {
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['email']
      }]
    });

    if (!candidato) {
      return errorRespuesta(res, 404, 'Candidato no encontrado');
    }

    // 2. Campos obligatorios
    if (!cargo || !fecha_inicio || !descripcion_responsabilidades) {
      return errorRespuesta(res, 400, 'Faltan campos obligatorios: cargo, fecha_inicio, descripcion_responsabilidades');
    }

    // 3. Validar consistencia fechas
    if (fecha_fin && new Date(fecha_fin) < new Date(fecha_inicio)) {
      return errorRespuesta(res, 400, 'La fecha de fin no puede ser anterior a la fecha de inicio');
    }

    // 4. Si actualmente trabajando, fecha_fin debe ser NULL
    if (actualmente_trabajando && fecha_fin) {
      return errorRespuesta(res, 400, 'Si actualmente trabaja, no debe especificar fecha de fin');
    }

    // 5. Verificar que no exista certificación duplicada PENDIENTE
    const duplicado = await HistorialLaboral.findOne({
      where: {
        candidato_id,
        empresa_id: empresa.id,
        cargo,
        fecha_inicio,
        estado: 'PENDIENTE_ACEPTACION'
      }
    });

    if (duplicado) {
      return errorRespuesta(res, 409, 'Ya existe una certificación pendiente idéntica para este candidato');
    }

    // ============================================
    // CREAR CERTIFICACIÓN
    // ============================================
    
    const historial = await HistorialLaboral.create({
      candidato_id,
      empresa_id: empresa.id,
      empresa_nombre: empresa.razon_social,
      empresa_nit: empresa.nit,
      cargo,
      departamento,
      fecha_inicio,
      fecha_fin: actualmente_trabajando ? null : fecha_fin,
      actualmente_trabajando: actualmente_trabajando || false,
      descripcion_responsabilidades,
      logros_principales,
      razon_salida,
      tipo_contrato: tipo_contrato || 'indefinido',
      estado: 'PENDIENTE_ACEPTACION',
      fecha_certificacion: new Date(),
      verificado_por_usuario_id: usuarioId,
      notificacion_enviada: false
    });

    // ============================================
    // REGISTRAR AUDITORÍA
    // ============================================
    
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'CERTIFICAR_EXPERIENCIA',
      entidad: 'historial_laboral',
      entidad_id: historial.id,
      datos_adicionales: {
        candidato_id,
        empresa_id: empresa.id,
        cargo,
        fecha_inicio,
        fecha_fin
      },
      ip_address: obtenerIPReal(req),
      user_agent: obtenerUserAgent(req)
    });

    // ============================================
    // ENVIAR NOTIFICACIÓN EMAIL
    // ============================================
    
    const emailEnviado = await notificarCertificacionPendiente(historial, candidato);
    
    if (emailEnviado) {
      historial.notificacion_enviada = true;
      historial.fecha_notificacion = new Date();
      await historial.save();
    }

    // ============================================
    // RESPUESTA
    // ============================================
    
    return exitoRespuesta(res, 201, 'Experiencia laboral certificada exitosamente. Enviamos un email al candidato para que acepte/rechace.', {
      id: historial.id,
      estado: historial.estado,
      candidato: {
        id: candidato.id,
        nombre_completo: `${candidato.nombres} ${candidato.apellido_paterno} ${candidato.apellido_materno || ''}`.trim()
      },
      cargo: historial.cargo,
      fecha_certificacion: historial.fecha_certificacion,
      notificacion_enviada: historial.notificacion_enviada
    });

  } catch (error) {
    console.error('❌ Error al certificar experiencia:', error);
    return errorRespuesta(res, 500, 'Error al certificar experiencia laboral', error.message);
  }
};

/**
 * ============================================
 * PUT /api/historial-laboral/:id/responder
 * Empleado acepta o rechaza certificación
 * Roles: CANDIDATO (dueño del registro)
 * ============================================
 */
const responderCertificacion = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const { accion, motivo_rechazo } = req.body;

    // ============================================
    // VALIDACIONES
    // ============================================
    
    // 1. Acción válida
    if (!['aceptar', 'rechazar'].includes(accion)) {
      return errorRespuesta(res, 400, 'Acción inválida. Use "aceptar" o "rechazar"');
    }

    // 2. Historial existe
    const historial = await HistorialLaboral.findByPk(id, {
      include: [
        {
          model: Candidato,
          as: 'candidato',
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'email']
          }]
        },
        {
          model: Empresa,
          as: 'empresa',
          include: [{
            model: Usuario,
            as: 'usuario_admin',
            attributes: ['email']
          }]
        }
      ]
    });

    if (!historial) {
      return errorRespuesta(res, 404, 'Certificación no encontrada');
    }

    // 3. Verificar que es el candidato correcto
    if (historial.candidato.usuario_id !== usuarioId) {
      return errorRespuesta(res, 403, 'No tienes permiso para responder esta certificación');
    }

    // 4. Verificar estado PENDIENTE
    if (historial.estado !== 'PENDIENTE_ACEPTACION') {
      return errorRespuesta(res, 400, `No puedes responder una certificación en estado ${historial.estado}`);
    }

    // 5. Si rechaza, motivo es obligatorio
    if (accion === 'rechazar' && !motivo_rechazo) {
      return errorRespuesta(res, 400, 'Debes especificar el motivo del rechazo');
    }

    // ============================================
    // PROCESAR RESPUESTA
    // ============================================
    
    const ipAddress = obtenerIPReal(req);
    const userAgent = obtenerUserAgent(req);

    if (accion === 'aceptar') {
      await historial.aceptar(ipAddress, userAgent);
      
      // Notificar empresa
      await notificarCertificacionAceptada(
        historial, 
        historial.candidato, 
        historial.empresa
      );

      // Auditoría
      await registrarAuditoria({
        usuario_id: usuarioId,
        accion: 'ACEPTAR_CERTIFICACION',
        entidad: 'historial_laboral',
        entidad_id: historial.id,
        datos_adicionales: {
          empresa_id: historial.empresa_id,
          cargo: historial.cargo
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      return exitoRespuesta(res, 200, 'Has aceptado la certificación exitosamente. Ahora es parte de tu perfil público y está inmutable.', {
        id: historial.id,
        estado: historial.estado,
        fecha_respuesta: historial.fecha_respuesta_empleado
      });

    } else {
      await historial.rechazar(motivo_rechazo, ipAddress, userAgent);
      
      // Notificar empresa
      await notificarCertificacionRechazada(
        historial, 
        historial.candidato, 
        historial.empresa,
        motivo_rechazo
      );

      // Auditoría
      await registrarAuditoria({
        usuario_id: usuarioId,
        accion: 'RECHAZAR_CERTIFICACION',
        entidad: 'historial_laboral',
        entidad_id: historial.id,
        datos_adicionales: {
          empresa_id: historial.empresa_id,
          cargo: historial.cargo,
          motivo: motivo_rechazo
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      return exitoRespuesta(res, 200, 'Has rechazado la certificación. La empresa fue notificada del motivo.', {
        id: historial.id,
        estado: historial.estado,
        fecha_respuesta: historial.fecha_respuesta_empleado,
        motivo_rechazo: historial.motivo_rechazo
      });
    }

  } catch (error) {
    console.error('❌ Error al responder certificación:', error);
    return errorRespuesta(res, 500, 'Error al procesar respuesta', error.message);
  }
};

/**
 * ============================================
 * GET /api/historial-laboral/candidato/:candidato_id
 * Obtener historial verificado de un candidato
 * Roles: TODOS (solo muestra ACEPTADOS)
 * ============================================
 */
const obtenerHistorialCandidato = async (req, res) => {
  try {
    const { candidato_id } = req.params;
    const { incluir_pendientes } = req.query; // ?incluir_pendientes=true (solo dueño)

    // Verificar si candidato existe
    const candidato = await Candidato.findByPk(candidato_id);
    if (!candidato) {
      return errorRespuesta(res, 404, 'Candidato no encontrado');
    }

    // Determinar qué estados mostrar
    let estadosPermitidos = ['ACEPTADO'];

    // Si el usuario es el dueño del perfil, puede ver PENDIENTES
    const esDueno = req.usuario.id === candidato.usuario_id;
    if (esDueno && incluir_pendientes === 'true') {
      estadosPermitidos.push('PENDIENTE_ACEPTACION', 'RECHAZADO', 'EXPIRADO');
    }

    const historial = await HistorialLaboral.findAll({
      where: {
        candidato_id,
        estado: {
          [Op.in]: estadosPermitidos
        }
      },
      include: [
        {
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'razon_social', 'sector', 'logo_url']
        }
      ],
      order: [
        ['actualmente_trabajando', 'DESC'],
        ['fecha_inicio', 'DESC']
      ]
    });

    // Calcular métricas
    const totalAceptados = historial.filter(h => h.estado === 'ACEPTADO').length;
    const totalPendientes = historial.filter(h => h.estado === 'PENDIENTE_ACEPTACION').length;
    const experienciaTotal = historial
      .filter(h => h.estado === 'ACEPTADO')
      .reduce((total, h) => total + h.calcularDuracionMeses(), 0);

    return exitoRespuesta(res, 200, 'Historial laboral obtenido', {
      candidato: {
        id: candidato.id,
        nombre_completo: `${candidato.nombres} ${candidato.apellido_paterno} ${candidato.apellido_materno || ''}`.trim()
      },
      historial,
      metricas: {
        total_registros: historial.length,
        aceptados: totalAceptados,
        pendientes: totalPendientes,
        experiencia_total_meses: experienciaTotal,
        experiencia_total_anios: (experienciaTotal / 12).toFixed(1)
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener historial:', error);
    return errorRespuesta(res, 500, 'Error al obtener historial', error.message);
  }
};

/**
 * ============================================
 * GET /api/historial-laboral/empresa/mis-certificaciones
 * Obtener certificaciones emitidas por mi empresa
 * Roles: EMPRESA
 * ============================================
 */
const obtenerCertificacionesEmpresa = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { estado, pagina = 1, limite = 20 } = req.query;

    // Buscar empresa
    const empresa = await Empresa.findOne({
      where: { usuario_id: usuarioId }
    });

    if (!empresa) {
      return errorRespuesta(res, 404, 'No tienes una empresa asociada');
    }

    // Filtros
    const where = { empresa_id: empresa.id };
    if (estado) {
      where.estado = estado;
    }

    const offset = (pagina - 1) * limite;

    const { count, rows } = await HistorialLaboral.findAndCountAll({
      where,
      include: [
        {
          model: Candidato,
          as: 'candidato',
          attributes: ['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'foto_perfil_url']
        }
      ],
      order: [['fecha_certificacion', 'DESC']],
      limit: parseInt(limite),
      offset: parseInt(offset)
    });

    // Estadísticas
    const estadisticas = await HistorialLaboral.findAll({
      where: { empresa_id: empresa.id },
      attributes: [
        'estado',
        [HistorialLaboral.sequelize.fn('COUNT', HistorialLaboral.sequelize.col('id')), 'total']
      ],
      group: ['estado'],
      raw: true
    });

    const stats = {
      total: count,
      por_estado: estadisticas.reduce((acc, item) => {
        acc[item.estado] = parseInt(item.total);
        return acc;
      }, {})
    };

    return exitoRespuesta(res, 200, 'Certificaciones obtenidas', {
      total: count,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      certificaciones: rows,
      estadisticas: stats
    });

  } catch (error) {
    console.error('❌ Error al obtener certificaciones:', error);
    return errorRespuesta(res, 500, 'Error al obtener certificaciones', error.message);
  }
};

/**
 * ============================================
 * PATCH /api/historial-laboral/:id
 * Actualizar certificación PENDIENTE
 * Roles: EMPRESA (solo si es suya y está PENDIENTE)
 * ============================================
 */
const actualizarCertificacion = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Buscar empresa
    const empresa = await Empresa.findOne({
      where: { usuario_id: usuarioId }
    });

    if (!empresa) {
      return errorRespuesta(res, 404, 'No tienes una empresa asociada');
    }

    // Buscar historial
    const historial = await HistorialLaboral.findByPk(id);
    if (!historial) {
      return errorRespuesta(res, 404, 'Certificación no encontrada');
    }

    // Verificar permisos
    if (historial.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para editar esta certificación');
    }

    // Solo PENDIENTES son editables
    if (!historial.puedeEditar()) {
      return errorRespuesta(res, 400, `No puedes editar certificaciones en estado ${historial.estado}`);
    }

    // Campos permitidos
    const camposPermitidos = [
      'cargo',
      'departamento',
      'fecha_inicio',
      'fecha_fin',
      'actualmente_trabajando',
      'descripcion_responsabilidades',
      'logros_principales',
      'razon_salida',
      'tipo_contrato'
    ];

    const datosActualizar = {};
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        datosActualizar[campo] = req.body[campo];
      }
    });

    if (Object.keys(datosActualizar).length === 0) {
      return errorRespuesta(res, 400, 'No hay datos para actualizar');
    }

    // Validar fechas si se actualizan
    if (datosActualizar.fecha_fin && datosActualizar.fecha_inicio) {
      if (new Date(datosActualizar.fecha_fin) < new Date(datosActualizar.fecha_inicio)) {
        return errorRespuesta(res, 400, 'La fecha de fin no puede ser anterior a la de inicio');
      }
    }

    await historial.update(datosActualizar);

    // Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'ACTUALIZAR_CERTIFICACION',
      entidad: 'historial_laboral',
      entidad_id: historial.id,
      datos_adicionales: { cambios: datosActualizar },
      ip_address: obtenerIPReal(req),
      user_agent: obtenerUserAgent(req)
    });

    return exitoRespuesta(res, 200, 'Certificación actualizada exitosamente', historial);

  } catch (error) {
    console.error('❌ Error al actualizar certificación:', error);
    return errorRespuesta(res, 500, 'Error al actualizar certificación', error.message);
  }
};

/**
 * ============================================
 * DELETE /api/historial-laboral/:id
 * Eliminar certificación PENDIENTE
 * Roles: EMPRESA (solo si es suya y está PENDIENTE)
 * ============================================
 */
const eliminarCertificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Buscar empresa
    const empresa = await Empresa.findOne({
      where: { usuario_id: usuarioId }
    });

    if (!empresa) {
      return errorRespuesta(res, 404, 'No tienes una empresa asociada');
    }

    // Buscar historial
    const historial = await HistorialLaboral.findByPk(id);
    if (!historial) {
      return errorRespuesta(res, 404, 'Certificación no encontrada');
    }

    // Verificar permisos
    if (historial.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para eliminar esta certificación');
    }

    // Solo PENDIENTES son eliminables
    if (historial.estado !== 'PENDIENTE_ACEPTACION') {
      return errorRespuesta(res, 400, `No puedes eliminar certificaciones en estado ${historial.estado}. Las certificaciones aceptadas son inmutables.`);
    }

    // Auditoría ANTES de eliminar
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'ELIMINAR_CERTIFICACION',
      entidad: 'historial_laboral',
      entidad_id: historial.id,
      datos_adicionales: {
        candidato_id: historial.candidato_id,
        cargo: historial.cargo,
        fecha_inicio: historial.fecha_inicio
      },
      ip_address: obtenerIPReal(req),
      user_agent: obtenerUserAgent(req)
    });

    await historial.destroy();

    return exitoRespuesta(res, 200, 'Certificación eliminada exitosamente');

  } catch (error) {
    console.error('❌ Error al eliminar certificación:', error);
    return errorRespuesta(res, 500, 'Error al eliminar certificación', error.message);
  }
};

/**
 * ============================================
 * GET /api/historial-laboral/estadisticas
 * Estadísticas generales del sistema
 * Roles: ADMIN
 * ============================================
 */
const obtenerEstadisticas = async (req, res) => {
  try {
    // Total por estado
    const porEstado = await HistorialLaboral.findAll({
      attributes: [
        'estado',
        [HistorialLaboral.sequelize.fn('COUNT', HistorialLaboral.sequelize.col('id')), 'total']
      ],
      group: ['estado'],
      raw: true
    });

    // Tasa de aceptación
    const totalCertificaciones = await HistorialLaboral.count();
    const totalAceptados = await HistorialLaboral.count({ where: { estado: 'ACEPTADO' } });
    const totalRechazados = await HistorialLaboral.count({ where: { estado: 'RECHAZADO' } });
    const totalPendientes = await HistorialLaboral.count({ where: { estado: 'PENDIENTE_ACEPTACION' } });

    const tasaAceptacion = totalCertificaciones > 0 
      ? ((totalAceptados / (totalAceptados + totalRechazados)) * 100).toFixed(2)
      : 0;

    // Tiempo promedio de respuesta (solo aceptadas y rechazadas)
    const respuestas = await HistorialLaboral.findAll({
      where: {
        estado: {
          [Op.in]: ['ACEPTADO', 'RECHAZADO']
        },
        fecha_respuesta_empleado: {
          [Op.ne]: null
        }
      },
      attributes: ['fecha_certificacion', 'fecha_respuesta_empleado'],
      raw: true
    });

    let tiempoPromedioHoras = 0;
    if (respuestas.length > 0) {
      const tiempoTotal = respuestas.reduce((acc, r) => {
        const diff = new Date(r.fecha_respuesta_empleado) - new Date(r.fecha_certificacion);
        return acc + diff;
      }, 0);
      tiempoPromedioHoras = (tiempoTotal / respuestas.length / (1000 * 60 * 60)).toFixed(2);
    }

    // Top empresas certificadoras
    const topEmpresas = await HistorialLaboral.findAll({
      attributes: [
        'empresa_id',
        'empresa_nombre',
        [HistorialLaboral.sequelize.fn('COUNT', HistorialLaboral.sequelize.col('id')), 'total_certificaciones']
      ],
      group: ['empresa_id', 'empresa_nombre'],
      order: [[HistorialLaboral.sequelize.literal('total_certificaciones'), 'DESC']],
      limit: 10,
      raw: true
    });

    return exitoRespuesta(res, 200, 'Estadísticas obtenidas', {
      total_certificaciones: totalCertificaciones,
      por_estado: porEstado.reduce((acc, item) => {
        acc[item.estado] = parseInt(item.total);
        return acc;
      }, {}),
      metricas: {
        tasa_aceptacion: `${tasaAceptacion}%`,
        tiempo_promedio_respuesta_horas: parseFloat(tiempoPromedioHoras),
        tiempo_promedio_respuesta_dias: (tiempoPromedioHoras / 24).toFixed(1),
        total_respondidas: totalAceptados + totalRechazados,
        pendientes_respuesta: totalPendientes
      },
      top_empresas_certificadoras: topEmpresas
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return errorRespuesta(res, 500, 'Error al obtener estadísticas', error.message);
  }
};

module.exports = {
  certificarExperiencia,
  responderCertificacion,
  obtenerHistorialCandidato,
  obtenerCertificacionesEmpresa,
  actualizarCertificacion,
  eliminarCertificacion,
  obtenerEstadisticas
};