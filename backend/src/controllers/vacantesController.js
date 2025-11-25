// file: backend/src/controllers/vacantesController.js

/**
 * CONTROLADOR: Vacantes
 * S009.4: CRUD completo + búsqueda avanzada + gestión estados
 */

const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { 
  Vacante, 
  Empresa, 
  HabilidadCatalogo,
  VacanteHabilidad,
  Postulacion,
  Candidato 
} = require('../models');
const { registrarAuditoria } = require('../utils/auditHelper');

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
 * 1. CREAR VACANTE (estado: borrador)
 * POST /api/vacantes
 * Rol: EMPRESA, ADMIN
 */
const crearVacante = async (req, res) => {
  try {
    // 1. Validar errores express-validator
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const usuarioId = req.usuario.id;

    // 2. Buscar empresa del usuario logueado
    const empresa = await Empresa.findOne({
      where: { usuario_id: usuarioId }
    });

    if (!empresa) {
      return errorRespuesta(res, 404, 'No se encontró perfil de empresa asociado');
    }

    // 3. Extraer datos del body
    const {
      titulo,
      descripcion,
      requisitos,
      beneficios,
      responsabilidades,
      modalidad,
      tipo_contrato,
      jornada_laboral,
      experiencia_requerida_anios,
      nivel_educativo_minimo,
      salario_min,
      salario_max,
      mostrar_salario,
      pais,
      departamento,
      ciudad,
      direccion,
      vacantes_disponibles,
      fecha_cierre,
      contacto_email,
      contacto_telefono
    } = req.body;

    // 4. Validaciones de negocio
    if (salario_min && salario_max && salario_min > salario_max) {
      return errorRespuesta(res, 400, 'El salario mínimo no puede ser mayor al máximo');
    }

    if (fecha_cierre && new Date(fecha_cierre) <= new Date()) {
      return errorRespuesta(res, 400, 'La fecha de cierre debe ser futura');
    }

    // 5. Crear vacante en estado BORRADOR
    const vacante = await Vacante.create({
      empresa_id: empresa.id,
      titulo,
      descripcion,
      requisitos,
      responsabilidades,
      beneficios,
      modalidad: modalidad || 'presencial',
      tipo_contrato: tipo_contrato || 'indefinido',
      jornada: jornada_laboral || 'tiempo_completo',
      experiencia_requerida_anios: experiencia_requerida_anios || 0,
      nivel_educativo_minimo: nivel_educativo_minimo || 'secundaria',
      salario_min,
      salario_max,
      mostrar_salario: mostrar_salario !== undefined ? mostrar_salario : false,
      pais: pais || 'Bolivia',
      departamento,
      ciudad,
      direccion,
      vacantes_disponibles: vacantes_disponibles || 1,
      fecha_cierre,
      contacto_email: contacto_email || empresa.email_contacto,
      contacto_telefono: contacto_telefono || empresa.telefono,
      estado: 'borrador'
    });

    // 6. Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'CREAR_VACANTE',
      entidad: 'vacantes',
      entidad_id: vacante.id,
      datos_adicionales: JSON.stringify({
        titulo: vacante.titulo,
        estado: 'borrador',
        empresa_id: empresa.id
      })
    });

    console.log(`✅ Vacante creada ID=${vacante.id} por empresa ${empresa.razon_social}`);

    return exitoRespuesta(res, 201, 'Vacante creada como borrador exitosamente', {
      id: vacante.id,
      titulo: vacante.titulo,
      estado: vacante.estado,
      empresa: {
        id: empresa.id,
        razon_social: empresa.razon_social
      }
    });

  } catch (error) {
    console.error('❌ Error al crear vacante:', error);
    return errorRespuesta(res, 500, 'Error al crear vacante', error.message);
  }
};

/**
 * 2. PUBLICAR VACANTE (borrador → abierta)
 * POST /api/vacantes/:id/publicar
 * Rol: EMPRESA, ADMIN
 */
const publicarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // 1. Buscar vacante con empresa
    const vacante = await Vacante.findByPk(id, {
      include: [{
        model: Empresa,
        as: 'empresa'
      }]
    });

    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    // 2. Verificar permisos (empresa propietaria)
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para publicar esta vacante');
    }

    // 3. Validar estado actual
    if (vacante.estado !== 'borrador') {
      return errorRespuesta(res, 400, `No se puede publicar una vacante en estado ${vacante.estado}`);
    }

    // 4. Validar datos obligatorios para publicar
    if (!vacante.titulo || !vacante.descripcion) {
      return errorRespuesta(res, 400, 'Faltan datos obligatorios: título y descripción');
    }

    // 5. Cambiar estado a ABIERTA
    vacante.estado = 'abierta';
    vacante.fecha_publicacion = new Date();
    await vacante.save();

    // 6. Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'PUBLICAR_VACANTE',
      entidad: 'vacantes',
      entidad_id: vacante.id,
      datos_adicionales: JSON.stringify({
        titulo: vacante.titulo,
        estado_anterior: 'borrador',
        estado_nuevo: 'abierta'
      })
    });

    console.log(`📢 Vacante publicada ID=${vacante.id}`);

    return exitoRespuesta(res, 200, 'Vacante publicada exitosamente', {
      id: vacante.id,
      titulo: vacante.titulo,
      estado: vacante.estado,
      fecha_publicacion: vacante.fecha_publicacion
    });

  } catch (error) {
    console.error('❌ Error al publicar vacante:', error);
    return errorRespuesta(res, 500, 'Error al publicar vacante', error.message);
  }
};

/**
 * 3. BUSCAR VACANTES (público con filtros avanzados)
 * GET /api/vacantes/buscar
 * Rol: TODOS (público)
 */
const buscarVacantes = async (req, res) => {
  try {
    const {
      q,                    // búsqueda texto título/descripción
      modalidad,            // presencial/remoto/hibrido
      tipo_contrato,        // indefinido/temporal/practicas
      departamento,
      ciudad,
      salario_min,
      salario_max,
      experiencia_max,      // experiencia requerida máxima
      nivel_educativo,
      pagina = 1,
      limite = 20
    } = req.query;

    // 1. Construir filtros WHERE dinámicos
    const whereConditions = {
      estado: 'abierta'  // Solo vacantes activas
    };

    // Filtro búsqueda texto
    if (q) {
      whereConditions[Op.or] = [
        { titulo: { [Op.like]: `%${q}%` } },
        { descripcion: { [Op.like]: `%${q}%` } }
      ];
    }

    // Filtro modalidad
    if (modalidad) {
      whereConditions.modalidad = modalidad;
    }

    // Filtro tipo contrato
    if (tipo_contrato) {
      whereConditions.tipo_contrato = tipo_contrato;
    }

    // Filtro ubicación
    if (departamento) {
      whereConditions.departamento = { [Op.like]: `%${departamento}%` };
    }
    if (ciudad) {
      whereConditions.ciudad = { [Op.like]: `%${ciudad}%` };
    }

    // Filtro salario
    if (salario_min) {
      whereConditions.salario_max = { [Op.gte]: parseInt(salario_min) };
    }
    if (salario_max) {
      whereConditions.salario_min = { [Op.lte]: parseInt(salario_max) };
    }

    // Filtro experiencia
    if (experiencia_max) {
      whereConditions.experiencia_requerida_anios = { [Op.lte]: parseInt(experiencia_max) };
    }

    // Filtro nivel educativo
    if (nivel_educativo) {
      whereConditions.nivel_educativo_minimo = nivel_educativo;
    }

    // 2. Paginación
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // 3. Query con includes
    const { count, rows: vacantes } = await Vacante.findAndCountAll({
      where: whereConditions,
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['id', 'razon_social', 'sector', 'logo_url', 'descripcion']
      }],
      order: [
        ['fecha_publicacion', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limite),
      offset: offset,
      distinct: true
    });

    // 4. Calcular total páginas
    const totalPaginas = Math.ceil(count / parseInt(limite));

    console.log(`🔍 Búsqueda vacantes: ${count} resultados (filtros: ${JSON.stringify(req.query)})`);

    return exitoRespuesta(res, 200, 'Vacantes obtenidas', {
      total: count,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      total_paginas: totalPaginas,
      vacantes: vacantes.map(v => ({
        id: v.id,
        titulo: v.titulo,
        descripcion: v.descripcion.substring(0, 200) + '...', // Resumen
        modalidad: v.modalidad,
        tipo_contrato: v.tipo_contrato,
        experiencia_requerida_anios: v.experiencia_requerida_anios,
        salario_min: v.mostrar_salario ? v.salario_min : null,
        salario_max: v.mostrar_salario ? v.salario_max : null,
        departamento: v.departamento,
        ciudad: v.ciudad,
        fecha_publicacion: v.fecha_publicacion,
        empresa: v.empresa
      }))
    });

  } catch (error) {
    console.error('❌ Error al buscar vacantes:', error);
    return errorRespuesta(res, 500, 'Error al buscar vacantes', error.message);
  }
};

/**
 * 4. OBTENER DETALLE VACANTE (con habilidades requeridas)
 * GET /api/vacantes/:id
 * Rol: TODOS (público)
 */
const obtenerDetalleVacante = async (req, res) => {
  try {
    const { id } = req.params;

    const vacante = await Vacante.findByPk(id, {
      include: [
        {
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'razon_social', 'sector', 'logo_url', 'descripcion', 'sitio_web']
        },
        {
          model: HabilidadCatalogo,
          as: 'habilidades',
          through: {
            attributes: ['nivel_minimo_requerido', 'obligatoria', 'peso_ponderacion']
          },
          attributes: ['id', 'nombre', 'categoria', 'descripcion']
        }
      ]
    });

    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    // ✅ VERIFICAR SI ES LA EMPRESA PROPIETARIA PRIMERO
    const usuarioId = req.usuario?.id;
    let esEmpresaPropietaria = false;

    if (usuarioId) {
      const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
      esEmpresaPropietaria = empresa && vacante.empresa_id === empresa.id;
    }

    // ✅ Si NO es pública Y NO es el propietario → 403
    if (vacante.estado !== 'abierta' && !esEmpresaPropietaria) {
      return errorRespuesta(res, 403, 'Esta vacante no está disponible públicamente');
    }

    return exitoRespuesta(res, 200, 'Detalle de vacante obtenido', vacante);

  } catch (error) {
    console.error('❌ Error al obtener detalle vacante:', error);
    return errorRespuesta(res, 500, 'Error al obtener detalle', error.message);
  }
};

/**
 * 5. MIS VACANTES EMPRESA (con contadores)
 * GET /api/vacantes/empresa/mis-vacantes
 * Rol: EMPRESA, ADMIN
 */
const obtenerMisVacantes = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { estado, pagina = 1, limite = 10 } = req.query;

    // 1. Buscar empresa
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa) {
      return errorRespuesta(res, 404, 'No se encontró perfil de empresa');
    }

    // 2. Construir filtros
    const whereConditions = { empresa_id: empresa.id };
    if (estado) {
      whereConditions.estado = estado;
    }

    // 3. Paginación
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    // 4. Query con contadores
    const { count, rows: vacantes } = await Vacante.findAndCountAll({
      where: whereConditions,
      include: [{
        model: Postulacion,
        as: 'postulaciones',
        attributes: []
      }],
      attributes: {
        include: [
          [
            Vacante.sequelize.fn('COUNT', Vacante.sequelize.col('postulaciones.id')),
            'total_postulaciones'
          ]
        ]
      },
      group: ['Vacante.id'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limite),
      offset: offset,
      subQuery: false
    });

    // 5. Estadísticas por estado
    const estadisticas = await Vacante.findAll({
      where: { empresa_id: empresa.id },
      attributes: [
        'estado',
        [Vacante.sequelize.fn('COUNT', Vacante.sequelize.col('id')), 'cantidad']
      ],
      group: ['estado'],
      raw: true
    });

    const statsPorEstado = estadisticas.reduce((acc, stat) => {
      acc[stat.estado] = parseInt(stat.cantidad);
      return acc;
    }, {});

    return exitoRespuesta(res, 200, 'Vacantes de la empresa obtenidas', {
      total: count.length,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      vacantes,
      estadisticas: {
        total: count.length,
        por_estado: statsPorEstado
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener vacantes de empresa:', error);
    return errorRespuesta(res, 500, 'Error al obtener vacantes', error.message);
  }
};

/**
 * 6. ACTUALIZAR VACANTE
 * PATCH /api/vacantes/:id
 * Rol: EMPRESA, ADMIN
 */
const actualizarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // 1. Buscar vacante
    const vacante = await Vacante.findByPk(id);
    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    // 2. Verificar permisos
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para editar esta vacante');
    }

    // 3. Verificar si puede editar
    if (vacante.estado === 'cerrada') {
      return errorRespuesta(res, 400, 'No se puede editar una vacante cerrada');
    }

    // 4. Campos permitidos (whitelist)
    const camposPermitidos = [
      'titulo',
      'descripcion',
      'requisitos',
      'beneficios',
      'responsabilidades',
      'modalidad',
      'tipo_contrato',
      'jornada',
      'experiencia_requerida_anios',
      'nivel_educativo_minimo',
      'salario_min',
      'salario_max',
      'mostrar_salario',
      'departamento',
      'ciudad',
      'direccion',
      'vacantes_disponibles',
      'fecha_cierre',
      'contacto_email',
      'contacto_telefono'
    ];

    const actualizaciones = {};
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        actualizaciones[campo] = req.body[campo];
      }
    });

    // 5. Validar salarios
    const salarioMin = actualizaciones.salario_min || vacante.salario_min;
    const salarioMax = actualizaciones.salario_max || vacante.salario_max;
    if (salarioMin && salarioMax && salarioMin > salarioMax) {
      return errorRespuesta(res, 400, 'El salario mínimo no puede ser mayor al máximo');
    }

    // 6. Actualizar
    await vacante.update(actualizaciones);

    // 7. Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'ACTUALIZAR_VACANTE',
      entidad: 'vacantes',
      entidad_id: vacante.id,
      datos_adicionales: JSON.stringify(actualizaciones)
    });

    console.log(`✏️ Vacante actualizada ID=${vacante.id}`);

    return exitoRespuesta(res, 200, 'Vacante actualizada exitosamente', vacante);

  } catch (error) {
    console.error('❌ Error al actualizar vacante:', error);
    return errorRespuesta(res, 500, 'Error al actualizar vacante', error.message);
  }
};

/**
 * 7. PAUSAR VACANTE (abierta → pausada)
 * PATCH /api/vacantes/:id/pausar
 * Rol: EMPRESA, ADMIN
 */
const pausarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const vacante = await Vacante.findByPk(id);
    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    // Verificar permisos
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para pausar esta vacante');
    }

    // Validar estado
    if (vacante.estado !== 'abierta') {
      return errorRespuesta(res, 400, `No se puede pausar una vacante en estado ${vacante.estado}`);
    }

    // Cambiar estado
    vacante.estado = 'pausada';
    await vacante.save();

    // Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'PAUSAR_VACANTE',
      entidad: 'vacantes',
      entidad_id: vacante.id
    });

    console.log(`⏸️ Vacante pausada ID=${vacante.id}`);

    return exitoRespuesta(res, 200, 'Vacante pausada exitosamente', {
      id: vacante.id,
      estado: vacante.estado
    });

  } catch (error) {
    console.error('❌ Error al pausar vacante:', error);
    return errorRespuesta(res, 500, 'Error al pausar vacante', error.message);
  }
};

/**
 * 8. REABRIR VACANTE (pausada → abierta)
 * PATCH /api/vacantes/:id/reabrir
 * Rol: EMPRESA, ADMIN
 */
const reabrirVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const vacante = await Vacante.findByPk(id);
    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    // Verificar permisos
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para reabrir esta vacante');
    }

    // Validar estado
    if (vacante.estado !== 'pausada') {
      return errorRespuesta(res, 400, `No se puede reabrir una vacante en estado ${vacante.estado}`);
    }

    // Cambiar estado
    vacante.estado = 'abierta';
    await vacante.save();

    // Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'REABRIR_VACANTE',
      entidad: 'vacantes',
      entidad_id: vacante.id
    });

    console.log(`▶️ Vacante reabierta ID=${vacante.id}`);

    return exitoRespuesta(res, 200, 'Vacante reabierta exitosamente', {
      id: vacante.id,
      estado: vacante.estado
    });

  } catch (error) {
    console.error('❌ Error al reabrir vacante:', error);
    return errorRespuesta(res, 500, 'Error al reabrir vacante', error.message);
  }
};

/**
 * 9. CERRAR VACANTE (cualquier estado → cerrada)
 * PATCH /api/vacantes/:id/cerrar
 * Rol: EMPRESA, ADMIN
 */
const cerrarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const vacante = await Vacante.findByPk(id);
    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    // Verificar permisos
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para cerrar esta vacante');
    }

    // Validar que no esté ya cerrada
    if (vacante.estado === 'cerrada') {
      return errorRespuesta(res, 400, 'La vacante ya está cerrada');
    }

    // Cambiar estado
    const estadoAnterior = vacante.estado;
    vacante.estado = 'cerrada';
    await vacante.save();

    // Auditoría
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'CERRAR_VACANTE',
      entidad: 'vacantes',
      entidad_id: vacante.id,
      datos_adicionales: JSON.stringify({ estado_anterior: estadoAnterior })
    });

    console.log(`🔒 Vacante cerrada ID=${vacante.id}`);

    return exitoRespuesta(res, 200, 'Vacante cerrada exitosamente', {
      id: vacante.id,
      estado: vacante.estado
    });

  } catch (error) {
    console.error('❌ Error al cerrar vacante:', error);
    return errorRespuesta(res, 500, 'Error al cerrar vacante', error.message);
  }
};

/**
 * 10. ELIMINAR VACANTE
 * DELETE /api/vacantes/:id
 * Rol: EMPRESA, ADMIN
 */
const eliminarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const vacante = await Vacante.findByPk(id, {
      include: [{
        model: Postulacion,
        as: 'postulaciones',
        attributes: ['id']
      }]
    });

    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    // Verificar permisos
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para eliminar esta vacante');
    }

    // Solo permitir eliminar borradores
    if (vacante.estado !== 'borrador') {
      return errorRespuesta(res, 400, 'Solo se pueden eliminar vacantes en estado borrador');
    }

    // Verificar que no tenga postulaciones
    if (vacante.postulaciones && vacante.postulaciones.length > 0) {
      return errorRespuesta(res, 400, 'No se puede eliminar una vacante con postulaciones');
    }

    // Auditoría ANTES de eliminar
    await registrarAuditoria({
      usuario_id: usuarioId,
      accion: 'ELIMINAR_VACANTE',
      entidad: 'vacantes',
      entidad_id: vacante.id,
      datos_adicionales: JSON.stringify({
        titulo: vacante.titulo,
        estado: vacante.estado
      })
    });

    // Eliminar (hard delete)
    await vacante.destroy();

    console.log(`🗑️ Vacante eliminada ID=${id}`);

    return exitoRespuesta(res, 200, 'Vacante eliminada exitosamente');

  } catch (error) {
    console.error('❌ Error al eliminar vacante:', error);
    return errorRespuesta(res, 500, 'Error al eliminar vacante', error.message);
  }
};

module.exports = {
  crearVacante,
  publicarVacante,
  buscarVacantes,
  obtenerDetalleVacante,
  obtenerMisVacantes,
  actualizarVacante,
  pausarVacante,
  reabrirVacante,
  cerrarVacante,
  eliminarVacante
};