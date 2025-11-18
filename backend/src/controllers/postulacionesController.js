// file: backend/src/controllers/postulacionesController.js

/**
 * CONTROLADOR: Postulaciones
 * S009.6: CRUD + gestión estados + scoring
 * S009.7: Notificaciones email
 */

const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { 
  Postulacion,
  Vacante,
  Candidato,
  Empresa,
  HabilidadCatalogo,
  Usuario
} = require('../models');
const { registrarAuditoria } = require('../utils/auditHelper');
const matchingService = require('../services/matchingService');
const emailService = require('../services/emailService'); // ✅ S009.7

/**
 * Helpers de respuesta
 */
const exitoRespuesta = (res, statusCode, mensaje, data = null) => {
  return res.status(statusCode).json({
    success: true,
    status: statusCode,
    message: mensaje,
    data
  });
};

const errorRespuesta = (res, statusCode, mensaje, error = null) => {
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: mensaje,
    error: process.env.NODE_ENV === 'development' ? error : null
  });
};

/**
 * 1. POSTULAR A VACANTE
 * POST /api/postulaciones
 * Rol: CANDIDATO
 */
const postular = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { vacante_id, carta_presentacion } = req.body;
    const usuarioId = req.usuario.id;

    // 1. Buscar candidato
    const candidato = await Candidato.findOne({ where: { usuario_id: usuarioId } });
    if (!candidato) {
      return errorRespuesta(res, 404, 'Perfil de candidato no encontrado');
    }

    // 2. Verificar vacante existe y está abierta
    const vacante = await Vacante.findByPk(vacante_id);
    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    if (vacante.estado !== 'abierta') {
      return errorRespuesta(res, 400, `Esta vacante está ${vacante.estado}, no acepta postulaciones`);
    }

    // 3. Verificar no duplicado
    const postulacionExistente = await Postulacion.findOne({
      where: {
        candidato_id: candidato.id,
        vacante_id: vacante_id
      }
    });

    if (postulacionExistente) {
      return errorRespuesta(res, 400, 'Ya has postulado a esta vacante');
    }

    // 4. Calcular score de compatibilidad
    console.log(`🔄 Calculando score para candidato ${candidato.id} en vacante ${vacante_id}...`);
    const scoring = await matchingService.calcularScore(candidato.id, vacante_id);

    // 5. Crear postulación
    const postulacion = await Postulacion.create({
      candidato_id: candidato.id,
      vacante_id: vacante_id,
      estado: 'postulado',
      score_compatibilidad: scoring.score_total,
      desglose_scoring: JSON.stringify(scoring.desglose),
      carta_presentacion: carta_presentacion || null,
      fecha_postulacion: new Date(),
      leido_empresa: false
    });

    // 6. Incrementar contador en vacante
    await vacante.increment('postulaciones_recibidas');

    // 7. Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'POSTULAR_VACANTE',
      entidad: 'postulaciones',
      entidad_id: postulacion.id,
      datos_adicionales: JSON.stringify({
        vacante_id: vacante_id,
        score: scoring.score_total,
        candidato_id: candidato.id
      })
    });

    console.log(`✅ Postulación creada ID=${postulacion.id}, score=${scoring.score_total}/100`);

    // ========================================
    // S009.7: ENVIAR EMAILS (async sin bloquear)
    // ========================================
    setImmediate(async () => {
      try {
        // Email a empresa
        const empresa = await Empresa.findByPk(vacante.empresa_id, {
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['email']
          }]
        });

        if (empresa && empresa.usuario?.email) {
          await emailService.enviarEmailNuevaPostulacion({
            empresaEmail: empresa.usuario.email,
            empresaNombre: empresa.razon_social,
            candidatoNombre: `${candidato.nombres} ${candidato.apellido_paterno}`,
            vacanteId: vacante.id,
            vacanteTitulo: vacante.titulo,
            score: scoring.score_total,
            candidatoUbicacion: `${candidato.ciudad || 'N/A'}, ${candidato.departamento || 'N/A'}`,
            candidatoExperiencia: candidato.anios_experiencia || 0,
            fechaPostulacion: new Date().toLocaleDateString('es-BO'),
            urlDetalle: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/empresa/postulaciones/${postulacion.id}`
          });
        }

        // Email a candidato
        const usuario = await Usuario.findByPk(usuarioId);
        if (usuario?.email) {
          await emailService.enviarEmailConfirmacionPostulacion({
            candidatoEmail: usuario.email,
            candidatoNombre: `${candidato.nombres} ${candidato.apellido_paterno}`,
            vacanteTitulo: vacante.titulo,
            empresaNombre: empresa?.razon_social || 'La empresa',
            score: scoring.score_total,
            scoreHabilidades: scoring.desglose.habilidades.puntos,
            scoreExperiencia: scoring.desglose.experiencia.puntos,
            scoreEducacion: scoring.desglose.educacion.puntos,
            scoreUbicacion: scoring.desglose.ubicacion.puntos,
            vacanteModalidad: vacante.modalidad || 'No especificado',
            vacanteUbicacion: `${vacante.ciudad || 'N/A'}, ${vacante.departamento || 'N/A'}`,
            fechaPostulacion: new Date().toLocaleDateString('es-BO'),
            urlDetalle: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mis-postulaciones/${postulacion.id}`
          });
        }

        console.log('📧 Emails de postulación enviados exitosamente');
      } catch (emailError) {
        console.error('⚠️  Error enviando emails (no crítico):', emailError.message);
      }
    });
    // ========================================

    return exitoRespuesta(res, 201, 'Postulación enviada exitosamente', {
      id: postulacion.id,
      vacante_id: vacante_id,
      estado: postulacion.estado,
      score_compatibilidad: postulacion.score_compatibilidad,
      fecha_postulacion: postulacion.fecha_postulacion
    });

  } catch (error) {
    console.error('❌ Error al postular:', error);
    return errorRespuesta(res, 500, 'Error al enviar postulación', error.message);
  }
};

/**
 * 2. MIS POSTULACIONES (Candidato)
 * GET /api/postulaciones/mis-postulaciones
 * Rol: CANDIDATO
 */
const misPostulaciones = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { estado, pagina = 1, limite = 10 } = req.query;

    // 1. Buscar candidato
    const candidato = await Candidato.findOne({ where: { usuario_id: usuarioId } });
    if (!candidato) {
      return errorRespuesta(res, 404, 'Perfil de candidato no encontrado');
    }

    // 2. Construir filtros
    const whereConditions = { candidato_id: candidato.id };
    if (estado) {
      whereConditions.estado = estado;
    }

    // 3. Paginación
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // 4. Query
    const { count, rows: postulaciones } = await Postulacion.findAndCountAll({
      where: whereConditions,
      include: [{
        model: Vacante,
        as: 'vacante',
        attributes: ['id', 'titulo', 'modalidad', 'salario_min', 'salario_max', 'departamento', 'ciudad', 'estado'],
        include: [{
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'razon_social', 'sector', 'logo_url']
        }]
      }],
      order: [
        ['fecha_postulacion', 'DESC'],
        ['score_compatibilidad', 'DESC']
      ],
      limit: parseInt(limite),
      offset: offset
    });

    console.log(`📋 ${count} postulaciones de candidato ${candidato.id}`);

    return exitoRespuesta(res, 200, 'Postulaciones obtenidas', {
      total: count,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      postulaciones: postulaciones.map(p => ({
        id: p.id,
        vacante: {
          id: p.vacante.id,
          titulo: p.vacante.titulo,
          modalidad: p.vacante.modalidad,
          ubicacion: `${p.vacante.ciudad}, ${p.vacante.departamento}`,
          salario: p.vacante.salario_min && p.vacante.salario_max 
            ? `${p.vacante.salario_min} - ${p.vacante.salario_max}`
            : 'No especificado',
          empresa: p.vacante.empresa
        },
        estado: p.estado,
        score_compatibilidad: p.score_compatibilidad,
        fecha_postulacion: p.fecha_postulacion,
        fecha_actualizacion: p.updatedAt
      }))
    });

  } catch (error) {
    console.error('❌ Error al obtener postulaciones:', error);
    return errorRespuesta(res, 500, 'Error al obtener postulaciones', error.message);
  }
};

/**
 * 3. POSTULACIONES DE UNA VACANTE (Empresa)
 * GET /api/postulaciones/vacante/:vacante_id
 * Rol: EMPRESA, ADMIN
 */
const postulacionesVacante = async (req, res) => {
  try {
    const { vacante_id } = req.params;
    const { estado, score_min, pagina = 1, limite = 20 } = req.query;
    const usuarioId = req.usuario.id;

    // 1. Verificar vacante y permisos
    const vacante = await Vacante.findByPk(vacante_id);
    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para ver estas postulaciones');
    }

    // 2. Construir filtros
    const whereConditions = { vacante_id: vacante_id };
    if (estado) {
      whereConditions.estado = estado;
    }
    if (score_min) {
      whereConditions.score_compatibilidad = { [Op.gte]: parseInt(score_min) };
    }

    // 3. Paginación
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // 4. Query
    const { count, rows: postulaciones } = await Postulacion.findAndCountAll({
      where: whereConditions,
      include: [{
        model: Candidato,
        as: 'candidato',
        attributes: ['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'telefono', 'ciudad', 'departamento', 'foto_perfil_url'],
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['email']
        }]
      }],
      order: [
        ['score_compatibilidad', 'DESC'],
        ['fecha_postulacion', 'ASC']
      ],
      limit: parseInt(limite),
      offset: offset
    });

    console.log(`📊 ${count} postulaciones para vacante ${vacante_id}`);

    return exitoRespuesta(res, 200, 'Postulaciones obtenidas', {
      total: count,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      vacante: {
        id: vacante.id,
        titulo: vacante.titulo
      },
      postulaciones: postulaciones.map(p => ({
        id: p.id,
        candidato: {
          id: p.candidato.id,
          nombre_completo: `${p.candidato.nombres} ${p.candidato.apellido_paterno} ${p.candidato.apellido_materno || ''}`.trim(),
          email: p.candidato.usuario?.email || 'N/A',
          telefono: p.candidato.telefono,
          ubicacion: `${p.candidato.ciudad}, ${p.candidato.departamento}`,
          foto_perfil: p.candidato.foto_perfil_url
        },
        estado: p.estado,
        score_compatibilidad: p.score_compatibilidad,
        fecha_postulacion: p.fecha_postulacion,
        leido: p.leido_empresa,
        carta_presentacion: p.carta_presentacion
      }))
    });

  } catch (error) {
    console.error('❌ Error al obtener postulaciones de vacante:', error);
    return errorRespuesta(res, 500, 'Error al obtener postulaciones', error.message);
  }
};

/**
 * 4. CAMBIAR ESTADO POSTULACIÓN (Empresa)
 * PATCH /api/postulaciones/:id/estado
 * Rol: EMPRESA, ADMIN
 */
const cambiarEstado = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { id } = req.params;
    const { estado, notas } = req.body;
    const usuarioId = req.usuario.id;

    // 1. Buscar postulación con vacante
    const postulacion = await Postulacion.findByPk(id, {
      include: [{
        model: Vacante,
        as: 'vacante'
      }]
    });

    if (!postulacion) {
      return errorRespuesta(res, 404, 'Postulación no encontrada');
    }

    // 2. Verificar permisos (empresa propietaria)
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || postulacion.vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para modificar esta postulación');
    }

    // 3. Validar transición de estado (FSM)
    const transicionesValidas = {
      'postulado': ['revisado', 'rechazado'],
      'revisado': ['preseleccionado', 'rechazado'],
      'preseleccionado': ['entrevista', 'rechazado'],
      'entrevista': ['contratado', 'rechazado'],
      'rechazado': [],
      'contratado': [],
      'retirado': []
    };

    const estadoActual = postulacion.estado;
    const transicionesPermitidas = transicionesValidas[estadoActual] || [];

    if (!transicionesPermitidas.includes(estado)) {
      return errorRespuesta(
        res, 
        400, 
        `No se puede cambiar de '${estadoActual}' a '${estado}'. Transiciones válidas: ${transicionesPermitidas.join(', ')}`
      );
    }

    // 4. Actualizar estado
    const estadoAnterior = postulacion.estado;
    postulacion.estado = estado;
    
    if (notas) {
      postulacion.notas_empresa = notas;
    }

    // Timestamps específicos según estado
    if (estado === 'revisado') {
      postulacion.fecha_revision = new Date();
    } else if (estado === 'preseleccionado') {
      postulacion.fecha_preseleccion = new Date();
    } else if (estado === 'entrevista') {
      postulacion.fecha_entrevista_agendada = new Date();
    } else if (estado === 'contratado') {
      postulacion.fecha_contratacion = new Date();
    } else if (estado === 'rechazado') {
      postulacion.fecha_rechazo = new Date();
    }

    await postulacion.save();

    // 5. Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'CAMBIAR_ESTADO_POSTULACION',
      entidad: 'postulaciones',
      entidad_id: postulacion.id,
      datos_adicionales: JSON.stringify({
        estado_anterior: estadoAnterior,
        estado_nuevo: estado,
        vacante_id: postulacion.vacante_id,
        candidato_id: postulacion.candidato_id
      })
    });

    console.log(`🔄 Postulación ${id}: ${estadoAnterior} → ${estado}`);

    // ========================================
    // S009.7: ENVIAR EMAIL CANDIDATO (async)
    // ========================================
    setImmediate(async () => {
      try {
        const candidato = await Candidato.findByPk(postulacion.candidato_id, {
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['email']
          }]
        });

        if (!candidato?.usuario?.email) return;

        const empresaNombre = empresa.razon_social;
        const vacanteTitulo = postulacion.vacante.titulo;

        const mensajesEstado = {
          'revisado': '<p>Tu postulación ha sido <strong>revisada</strong> por el equipo de reclutamiento.</p><p>Están evaluando tu perfil en detalle. Te mantendremos informado/a.</p>',
          'preseleccionado': '<p>🎉 <strong>¡Excelentes noticias!</strong> Has sido preseleccionado/a.</p><p>Estás entre los finalistas. La empresa podría contactarte pronto para los siguientes pasos.</p>',
          'entrevista': '<p>📞 La empresa desea <strong>agendar una entrevista</strong> contigo.</p><p>Prepárate revisando la descripción del puesto y practicando tus respuestas. ¡Mucho éxito!</p>',
          'contratado': '<p>🎊 <strong>¡FELICITACIONES!</strong> Has sido contratado/a.</p><p>La empresa se pondrá en contacto contigo con los detalles del contrato.</p>',
          'rechazado': '<p>Agradecemos tu interés. Después de evaluación decidimos continuar con otros candidatos.</p><p>No te desanimes, sigue postulando. Cada proceso es una oportunidad de aprendizaje.</p>'
        };

        // Emails específicos para estados clave
        if (estado === 'preseleccionado') {
          await emailService.enviarEmailPreseleccionado({
            candidatoEmail: candidato.usuario.email,
            candidatoNombre: `${candidato.nombres} ${candidato.apellido_paterno}`,
            vacanteTitulo: vacanteTitulo,
            empresaNombre: empresaNombre,
            score: postulacion.score_compatibilidad,
            urlPostulacion: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mis-postulaciones/${postulacion.id}`
          });
        } else if (estado === 'rechazado') {
          await emailService.enviarEmailRechazado({
            candidatoEmail: candidato.usuario.email,
            candidatoNombre: `${candidato.nombres} ${candidato.apellido_paterno}`,
            vacanteTitulo: vacanteTitulo,
            empresaNombre: empresaNombre,
            motivoOpcional: notas || null
          });
        } else if (estado === 'contratado') {
          await emailService.enviarEmailContratado({
            candidatoEmail: candidato.usuario.email,
            candidatoNombre: `${candidato.nombres} ${candidato.apellido_paterno}`,
            vacanteTitulo: vacanteTitulo,
            empresaNombre: empresaNombre,
            urlPostulacion: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mis-postulaciones/${postulacion.id}`
          });
        } else {
          // Email genérico para revisado, entrevista
          await emailService.enviarEmailCambioEstado({
            candidatoEmail: candidato.usuario.email,
            candidatoNombre: `${candidato.nombres} ${candidato.apellido_paterno}`,
            vacanteTitulo: vacanteTitulo,
            empresaNombre: empresaNombre,
            estadoAnterior: estadoAnterior,
            estadoNuevo: estado,
            mensajeEstado: mensajesEstado[estado] || '<p>Tu postulación ha sido actualizada.</p>',
            urlPostulacion: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mis-postulaciones/${postulacion.id}`
          });
        }

        console.log(`📧 Email cambio estado enviado a ${candidato.usuario.email}`);
      } catch (emailError) {
        console.error('⚠️  Error enviando email cambio estado:', emailError.message);
      }
    });
    // ========================================

    return exitoRespuesta(res, 200, 'Estado actualizado exitosamente', {
      id: postulacion.id,
      estado: postulacion.estado,
      estado_anterior: estadoAnterior
    });

  } catch (error) {
    console.error('❌ Error al cambiar estado:', error);
    return errorRespuesta(res, 500, 'Error al cambiar estado', error.message);
  }
};

/**
 * 5. RETIRAR POSTULACIÓN (Candidato)
 * POST /api/postulaciones/:id/retirar
 * Rol: CANDIDATO
 */
const retirarPostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const usuarioId = req.usuario.id;

    // 1. Buscar postulación
    const postulacion = await Postulacion.findByPk(id);
    if (!postulacion) {
      return errorRespuesta(res, 404, 'Postulación no encontrada');
    }

    // 2. Verificar que es el candidato propietario
    const candidato = await Candidato.findOne({ where: { usuario_id: usuarioId } });
    if (!candidato || postulacion.candidato_id !== candidato.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para retirar esta postulación');
    }

    // 3. Validar estado
    if (['contratado', 'rechazado'].includes(postulacion.estado)) {
      return errorRespuesta(
        res, 
        400, 
        `No se puede retirar una postulación en estado '${postulacion.estado}'`
      );
    }

    // 4. Cambiar a estado retirado
    const estadoAnterior = postulacion.estado;
    postulacion.estado = 'retirado';
    postulacion.motivo_retiro = motivo || 'Sin especificar';
    postulacion.fecha_retiro = new Date();
    await postulacion.save();

    // 5. Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'RETIRAR_POSTULACION',
      entidad: 'postulaciones',
      entidad_id: postulacion.id,
      datos_adicionales: JSON.stringify({
        estado_anterior: estadoAnterior,
        motivo: motivo
      })
    });

    console.log(`🚪 Candidato retiró postulación ${id}`);

    return exitoRespuesta(res, 200, 'Postulación retirada exitosamente', {
      id: postulacion.id,
      estado: postulacion.estado
    });

  } catch (error) {
    console.error('❌ Error al retirar postulación:', error);
    return errorRespuesta(res, 500, 'Error al retirar postulación', error.message);
  }
};

/**
 * 6. DETALLE POSTULACIÓN CON DESGLOSE SCORING
 * GET /api/postulaciones/:id
 * Rol: CANDIDATO (propietario), EMPRESA (de la vacante)
 */
const obtenerDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // 1. Buscar postulación completa
    const postulacion = await Postulacion.findByPk(id, {
      include: [
        {
          model: Vacante,
          as: 'vacante',
          attributes: ['id', 'titulo', 'modalidad', 'empresa_id'],
          include: [{
            model: Empresa,
            as: 'empresa',
            attributes: ['id', 'razon_social', 'logo_url']
          }]
        },
        {
          model: Candidato,
          as: 'candidato',
          attributes: ['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'usuario_id'],
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['email']
          }]
        }
      ]
    });

    if (!postulacion) {
      return errorRespuesta(res, 404, 'Postulación no encontrada');
    }

    // 2. Verificar permisos
    const candidato = await Candidato.findOne({ where: { usuario_id: usuarioId } });
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });

    const esCandidatoPropietario = candidato && postulacion.candidato_id === candidato.id;
    const esEmpresaPropietaria = empresa && postulacion.vacante.empresa_id === empresa.id;

    if (!esCandidatoPropietario && !esEmpresaPropietaria) {
      return errorRespuesta(res, 403, 'No tienes permiso para ver esta postulación');
    }

    // 3. Parsear desglose scoring
    let desgloseScoring = null;
    try {
      desgloseScoring = JSON.parse(postulacion.desglose_scoring);
    } catch (e) {
      console.warn('⚠️ Error parsing desglose_scoring:', e);
    }

    console.log(`👁️ Detalle postulación ${id} visto por usuario ${usuarioId}`);

    return exitoRespuesta(res, 200, 'Detalle obtenido', {
      id: postulacion.id,
      vacante: {
        id: postulacion.vacante.id,
        titulo: postulacion.vacante.titulo,
        modalidad: postulacion.vacante.modalidad,
        empresa: postulacion.vacante.empresa
      },
      candidato: {
        id: postulacion.candidato.id,
        nombre_completo: `${postulacion.candidato.nombres} ${postulacion.candidato.apellido_paterno} ${postulacion.candidato.apellido_materno || ''}`.trim(),
        email: postulacion.candidato.usuario?.email || 'N/A'
      },
      estado: postulacion.estado,
      score_compatibilidad: postulacion.score_compatibilidad,
      desglose_scoring: desgloseScoring,
      carta_presentacion: postulacion.carta_presentacion,
      notas_empresa: esEmpresaPropietaria ? postulacion.notas_empresa : null,
      fecha_postulacion: postulacion.fecha_postulacion,
      fecha_revision: postulacion.fecha_revision,
      fecha_preseleccion: postulacion.fecha_preseleccion,
      fecha_entrevista_agendada: postulacion.fecha_entrevista_agendada,
      fecha_contratacion: postulacion.fecha_contratacion,
      fecha_rechazo: postulacion.fecha_rechazo,
      fecha_retiro: postulacion.fecha_retiro
    });

  } catch (error) {
    console.error('❌ Error al obtener detalle:', error);
    return errorRespuesta(res, 500, 'Error al obtener detalle', error.message);
  }
};

/**
 * 7. MARCAR COMO LEÍDA (Empresa)
 * PATCH /api/postulaciones/:id/marcar-leida
 * Rol: EMPRESA, ADMIN
 */
const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // 1. Buscar postulación
    const postulacion = await Postulacion.findByPk(id, {
      include: [{
        model: Vacante,
        as: 'vacante'
      }]
    });

    if (!postulacion) {
      return errorRespuesta(res, 404, 'Postulación no encontrada');
    }

    // 2. Verificar permisos
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || postulacion.vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para modificar esta postulación');
    }

    // 3. Marcar como leída
    postulacion.leido_empresa = true;
    postulacion.fecha_lectura = new Date();
    await postulacion.save();

    console.log(`✅ Postulación ${id} marcada como leída`);

    return exitoRespuesta(res, 200, 'Postulación marcada como leída', {
      id: postulacion.id,
      leido: postulacion.leido_empresa
    });

  } catch (error) {
    console.error('❌ Error al marcar como leída:', error);
    return errorRespuesta(res, 500, 'Error al marcar como leída', error.message);
  }
};

/**
 * 8. ELIMINAR POSTULACIÓN
 * DELETE /api/postulaciones/:id
 * Rol: CANDIDATO (solo estado 'postulado')
 */
const eliminarPostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // 1. Buscar postulación
    const postulacion = await Postulacion.findByPk(id);
    if (!postulacion) {
      return errorRespuesta(res, 404, 'Postulación no encontrada');
    }

    // 2. Verificar que es el candidato propietario
    const candidato = await Candidato.findOne({ where: { usuario_id: usuarioId } });
    if (!candidato || postulacion.candidato_id !== candidato.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para eliminar esta postulación');
    }

    // 3. Solo permitir eliminar si está en estado 'postulado'
    if (postulacion.estado !== 'postulado') {
      return errorRespuesta(
        res, 
        400, 
        'Solo se pueden eliminar postulaciones en estado "postulado"'
      );
    }

    // 4. Auditoría ANTES de eliminar
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'ELIMINAR_POSTULACION',
      entidad: 'postulaciones',
      entidad_id: postulacion.id,
      datos_adicionales: JSON.stringify({
        vacante_id: postulacion.vacante_id,
        score: postulacion.score_compatibilidad
      })
    });

    // 5. Decrementar contador vacante
    await Vacante.decrement('postulaciones_recibidas', {
      where: { id: postulacion.vacante_id }
    });

    // 6. Eliminar
    await postulacion.destroy();

    console.log(`🗑️ Postulación ${id} eliminada`);

    return exitoRespuesta(res, 200, 'Postulación eliminada exitosamente');

  } catch (error) {
    console.error('❌ Error al eliminar postulación:', error);
    return errorRespuesta(res, 500, 'Error al eliminar postulación', error.message);
  }
};

module.exports = {
  postular,
  misPostulaciones,
  postulacionesVacante,
  cambiarEstado,
  retirarPostulacion,
  obtenerDetalle,
  marcarLeida,
  eliminarPostulacion
};