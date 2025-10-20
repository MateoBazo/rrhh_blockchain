// file: backend/src/controllers/contratosController.js
const { ContratoLaboral, Candidato, Empresa, Usuario } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * @desc    Crear nuevo contrato laboral
 * @route   POST /api/contratos
 * @access  Private (EMPRESA, ADMIN)
 */
exports.crearContrato = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    // Solo EMPRESA o ADMIN pueden crear contratos
    if (!['EMPRESA', 'ADMIN'].includes(req.user.rol)) {
      return errorResponse(res, 'No tienes permisos para crear contratos', 403);
    }

    const {
      candidato_id,
      empresa_id,
      cargo,
      tipo_contrato,
      fecha_inicio,
      fecha_fin,
      salario_mensual,
      moneda,
      jornada_laboral,
      lugar_trabajo,
      departamento,
      beneficios,
      clausulas_especiales,
      estado
    } = req.body;

    // Validación 1: Candidato existe
    const candidato = await Candidato.findByPk(candidato_id);
    if (!candidato) {
      return errorResponse(res, 'Candidato no encontrado', 404);
    }

    // Validación 2: Empresa existe
    const empresa = await Empresa.findByPk(empresa_id);
    if (!empresa) {
      return errorResponse(res, 'Empresa no encontrada', 404);
    }

    // Validación 3: Si es rol EMPRESA, debe ser su propia empresa
    if (req.user.rol === 'EMPRESA' && req.user.id !== empresa.usuario_id) {
      return errorResponse(res, 'Solo puedes crear contratos para tu empresa', 403);
    }

    // Validación 4: Tipo de contrato válido
    const TIPOS_VALIDOS = ['INDEFINIDO', 'TEMPORAL', 'PRACTICAS', 'FREELANCE', 'CONSULTORIA'];
    if (!TIPOS_VALIDOS.includes(tipo_contrato.toUpperCase())) {
      return errorResponse(
        res,
        `Tipo de contrato inválido. Debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`,
        400
      );
    }

    // Validación 5: Estados válidos
    const ESTADOS_VALIDOS = ['ACTIVO', 'FINALIZADO', 'SUSPENDIDO', 'BORRADOR'];
    const estadoFinal = estado ? estado.toUpperCase() : 'BORRADOR';
    if (!ESTADOS_VALIDOS.includes(estadoFinal)) {
      return errorResponse(
        res,
        `Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`,
        400
      );
    }

    // Validación 6: fecha_inicio <= fecha_fin (si hay fecha_fin)
    if (fecha_fin) {
      const inicio = new Date(fecha_inicio);
      const fin = new Date(fecha_fin);
      if (inicio > fin) {
        return errorResponse(res, 'La fecha de inicio no puede ser posterior a la fecha de fin', 400);
      }
    }

    // Validación 7: NO puede haber contratos ACTIVO superpuestos para el mismo candidato
    if (estadoFinal === 'ACTIVO') {
      const contratosActivos = await ContratoLaboral.findAll({
        where: {
          candidato_id,
          estado: 'ACTIVO',
          [Op.or]: [
            {
              // Contratos sin fecha_fin (indefinidos)
              fecha_fin: null,
              fecha_inicio: { [Op.lte]: fecha_fin || '9999-12-31' }
            },
            {
              // Contratos con fecha_fin que se superponen
              fecha_inicio: { [Op.lte]: fecha_fin || '9999-12-31' },
              fecha_fin: { [Op.gte]: fecha_inicio }
            }
          ]
        }
      });

      if (contratosActivos.length > 0) {
        return errorResponse(
          res,
          'El candidato ya tiene un contrato ACTIVO en este rango de fechas. No se permiten contratos superpuestos.',
          400
        );
      }
    }

    const contrato = await ContratoLaboral.create({
      candidato_id,
      empresa_id,
      cargo,
      tipo_contrato: tipo_contrato.toUpperCase(),
      fecha_inicio,
      fecha_fin: fecha_fin || null,
      salario_mensual,
      moneda: moneda || 'USD',
      jornada_laboral: jornada_laboral || 'COMPLETA',
      lugar_trabajo,
      departamento: departamento || null,
      beneficios: beneficios || null,
      clausulas_especiales: clausulas_especiales || null,
      estado: estadoFinal
    });

    // Incluir datos de candidato y empresa en la respuesta
    const contratoCompleto = await ContratoLaboral.findByPk(contrato.id, {
      include: [
        {
          model: Candidato,
          as: 'candidato',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'nombre_comercial', 'razon_social']
        }
      ]
    });

    return successResponse(res, contratoCompleto, 'Contrato creado exitosamente', 201);
  } catch (error) {
    console.error('Error en crearContrato:', error);
    return errorResponse(res, 'Error al crear el contrato', 500);
  }
};

/**
 * @desc    Obtener todos los contratos (con filtros)
 * @route   GET /api/contratos
 * @access  Private (EMPRESA ve solo suyos, ADMIN ve todos, CANDIDATO ve solo propios)
 */
exports.obtenerContratos = async (req, res) => {
  try {
    const { estado, tipo_contrato, candidato_id, empresa_id, limit = 20, offset = 0 } = req.query;

    const whereClause = {};

    // Filtros de seguridad según rol
    if (req.user.rol === 'CANDIDATO') {
      // Candidato solo ve sus propios contratos
      const candidato = await Candidato.findOne({ where: { usuario_id: req.user.id } });
      if (!candidato) {
        return errorResponse(res, 'Perfil de candidato no encontrado', 404);
      }
      whereClause.candidato_id = candidato.id;
    } else if (req.user.rol === 'EMPRESA') {
      // Empresa solo ve contratos de su empresa
      const empresa = await Empresa.findOne({ where: { usuario_id: req.user.id } });
      if (!empresa) {
        return errorResponse(res, 'Perfil de empresa no encontrado', 404);
      }
      whereClause.empresa_id = empresa.id;
    }
    // ADMIN no tiene restricciones

    // Filtros adicionales
    if (estado) whereClause.estado = estado.toUpperCase();
    if (tipo_contrato) whereClause.tipo_contrato = tipo_contrato.toUpperCase();
    if (candidato_id && req.user.rol === 'ADMIN') whereClause.candidato_id = candidato_id;
    if (empresa_id && req.user.rol === 'ADMIN') whereClause.empresa_id = empresa_id;

    const { count, rows: contratos } = await ContratoLaboral.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Candidato,
          as: 'candidato',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'nombre_comercial', 'razon_social']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_inicio', 'DESC']]
    });

    return successResponse(
      res,
      {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        contratos
      },
      `${count} contrato(s) encontrado(s)`
    );
  } catch (error) {
    console.error('Error en obtenerContratos:', error);
    return errorResponse(res, 'Error al obtener contratos', 500);
  }
};

/**
 * @desc    Obtener contrato por ID
 * @route   GET /api/contratos/:id
 * @access  Private (EMPRESA ve solo suyos, ADMIN ve todos, CANDIDATO ve solo propios)
 */
exports.obtenerContratoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const contrato = await ContratoLaboral.findByPk(id, {
      include: [
        {
          model: Candidato,
          as: 'candidato',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono', 'ciudad']
        },
        {
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'nombre_comercial', 'razon_social', 'email_contacto', 'telefono']
        }
      ]
    });

    if (!contrato) {
      return errorResponse(res, 'Contrato no encontrado', 404);
    }

    // Verificar permisos
    if (req.user.rol === 'CANDIDATO') {
      const candidato = await Candidato.findOne({ where: { usuario_id: req.user.id } });
      if (contrato.candidato_id !== candidato.id) {
        return errorResponse(res, 'No tienes permisos para ver este contrato', 403);
      }
    } else if (req.user.rol === 'EMPRESA') {
      const empresa = await Empresa.findOne({ where: { usuario_id: req.user.id } });
      if (contrato.empresa_id !== empresa.id) {
        return errorResponse(res, 'No tienes permisos para ver este contrato', 403);
      }
    }

    return successResponse(res, contrato, 'Contrato obtenido exitosamente');
  } catch (error) {
    console.error('Error en obtenerContratoPorId:', error);
    return errorResponse(res, 'Error al obtener contrato', 500);
  }
};

/**
 * @desc    Actualizar contrato
 * @route   PUT /api/contratos/:id
 * @access  Private (EMPRESA, ADMIN)
 */
exports.actualizarContrato = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    if (!['EMPRESA', 'ADMIN'].includes(req.user.rol)) {
      return errorResponse(res, 'No tienes permisos para actualizar contratos', 403);
    }

    const { id } = req.params;
    const {
      cargo,
      tipo_contrato,
      fecha_inicio,
      fecha_fin,
      salario_mensual,
      moneda,
      jornada_laboral,
      lugar_trabajo,
      departamento,
      beneficios,
      clausulas_especiales,
      estado
    } = req.body;

    const contrato = await ContratoLaboral.findByPk(id);

    if (!contrato) {
      return errorResponse(res, 'Contrato no encontrado', 404);
    }

    // Verificar permisos de empresa
    if (req.user.rol === 'EMPRESA') {
      const empresa = await Empresa.findOne({ where: { usuario_id: req.user.id } });
      if (contrato.empresa_id !== empresa.id) {
        return errorResponse(res, 'No tienes permisos para actualizar este contrato', 403);
      }
    }

    // Validar fechas si se actualizan
    if (fecha_inicio && fecha_fin) {
      const inicio = new Date(fecha_inicio);
      const fin = new Date(fecha_fin);
      if (inicio > fin) {
        return errorResponse(res, 'La fecha de inicio no puede ser posterior a la fecha de fin', 400);
      }
    }

    // Validar contratos superpuestos si se cambia a ACTIVO
    if (estado && estado.toUpperCase() === 'ACTIVO' && contrato.estado !== 'ACTIVO') {
      const fechaInicioFinal = fecha_inicio || contrato.fecha_inicio;
      const fechaFinFinal = fecha_fin !== undefined ? fecha_fin : contrato.fecha_fin;

      const contratosActivos = await ContratoLaboral.findAll({
        where: {
          candidato_id: contrato.candidato_id,
          estado: 'ACTIVO',
          id: { [Op.ne]: id },
          [Op.or]: [
            {
              fecha_fin: null,
              fecha_inicio: { [Op.lte]: fechaFinFinal || '9999-12-31' }
            },
            {
              fecha_inicio: { [Op.lte]: fechaFinFinal || '9999-12-31' },
              fecha_fin: { [Op.gte]: fechaInicioFinal }
            }
          ]
        }
      });

      if (contratosActivos.length > 0) {
        return errorResponse(
          res,
          'El candidato ya tiene un contrato ACTIVO en este rango de fechas',
          400
        );
      }
    }

    await contrato.update({
      cargo: cargo || contrato.cargo,
      tipo_contrato: tipo_contrato ? tipo_contrato.toUpperCase() : contrato.tipo_contrato,
      fecha_inicio: fecha_inicio || contrato.fecha_inicio,
      fecha_fin: fecha_fin !== undefined ? fecha_fin : contrato.fecha_fin,
      salario_mensual: salario_mensual || contrato.salario_mensual,
      moneda: moneda || contrato.moneda,
      jornada_laboral: jornada_laboral || contrato.jornada_laboral,
      lugar_trabajo: lugar_trabajo || contrato.lugar_trabajo,
      departamento: departamento !== undefined ? departamento : contrato.departamento,
      beneficios: beneficios !== undefined ? beneficios : contrato.beneficios,
      clausulas_especiales: clausulas_especiales !== undefined ? clausulas_especiales : contrato.clausulas_especiales,
      estado: estado ? estado.toUpperCase() : contrato.estado
    });

    const contratoActualizado = await ContratoLaboral.findByPk(id, {
      include: [
        { model: Candidato, as: 'candidato', attributes: ['id', 'nombre', 'apellido', 'email'] },
        { model: Empresa, as: 'empresa', attributes: ['id', 'nombre_comercial'] }
      ]
    });

    return successResponse(res, contratoActualizado, 'Contrato actualizado exitosamente');
  } catch (error) {
    console.error('Error en actualizarContrato:', error);
    return errorResponse(res, 'Error al actualizar contrato', 500);
  }
};

/**
 * @desc    Eliminar contrato
 * @route   DELETE /api/contratos/:id
 * @access  Private (ADMIN only)
 */
exports.eliminarContrato = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return errorResponse(res, 'Solo administradores pueden eliminar contratos', 403);
    }

    const { id } = req.params;

    const contrato = await ContratoLaboral.findByPk(id);

    if (!contrato) {
      return errorResponse(res, 'Contrato no encontrado', 404);
    }

    await contrato.destroy();

    return successResponse(res, null, 'Contrato eliminado exitosamente');
  } catch (error) {
    console.error('Error en eliminarContrato:', error);
    return errorResponse(res, 'Error al eliminar contrato', 500);
  }
};