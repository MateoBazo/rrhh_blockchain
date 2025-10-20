// file: backend/src/controllers/blockchainController.js
const { RegistroBlockchain, Candidato, Empresa, Usuario } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');

/**
 * @desc    Obtener todos los registros blockchain (con filtros)
 * @route   GET /api/blockchain
 * @access  Private (ADMIN ve todos, otros ven solo los suyos)
 */
exports.obtenerRegistros = async (req, res) => {
  try {
    const { tipo_evento, entidad_id, limit = 20, offset = 0 } = req.query;

    const whereClause = {};

    // Filtros de seguridad según rol
    if (req.user.rol === 'CANDIDATO') {
      const candidato = await Candidato.findOne({ where: { usuario_id: req.user.id } });
      if (candidato) {
        whereClause.entidad_id = candidato.id;
        whereClause.tipo_entidad = 'CANDIDATO';
      } else {
        return successResponse(res, { total: 0, registros: [] }, 'No se encontraron registros');
      }
    } else if (req.user.rol === 'EMPRESA') {
      const empresa = await Empresa.findOne({ where: { usuario_id: req.user.id } });
      if (empresa) {
        whereClause.entidad_id = empresa.id;
        whereClause.tipo_entidad = 'EMPRESA';
      } else {
        return successResponse(res, { total: 0, registros: [] }, 'No se encontraron registros');
      }
    }
    // ADMIN no tiene restricciones

    // Filtros adicionales
    if (tipo_evento) whereClause.tipo_evento = tipo_evento.toUpperCase();
    if (entidad_id && req.user.rol === 'ADMIN') whereClause.entidad_id = entidad_id;

    const { count, rows: registros } = await RegistroBlockchain.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp_blockchain', 'DESC']]
    });

    return successResponse(
      res,
      {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        registros
      },
      `${count} registro(s) encontrado(s)`
    );
  } catch (error) {
    console.error('Error en obtenerRegistros:', error);
    return errorResponse(res, 'Error al obtener registros blockchain', 500);
  }
};

/**
 * @desc    Obtener registro blockchain por ID
 * @route   GET /api/blockchain/:id
 * @access  Private (ADMIN ve todos, otros ven solo los suyos)
 */
exports.obtenerRegistroPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await RegistroBlockchain.findByPk(id);

    if (!registro) {
      return errorResponse(res, 'Registro blockchain no encontrado', 404);
    }

    // Verificar permisos
    if (req.user.rol === 'CANDIDATO') {
      const candidato = await Candidato.findOne({ where: { usuario_id: req.user.id } });
      if (!candidato || registro.entidad_id !== candidato.id || registro.tipo_entidad !== 'CANDIDATO') {
        return errorResponse(res, 'No tienes permisos para ver este registro', 403);
      }
    } else if (req.user.rol === 'EMPRESA') {
      const empresa = await Empresa.findOne({ where: { usuario_id: req.user.id } });
      if (!empresa || registro.entidad_id !== empresa.id || registro.tipo_entidad !== 'EMPRESA') {
        return errorResponse(res, 'No tienes permisos para ver este registro', 403);
      }
    }

    return successResponse(res, registro, 'Registro blockchain obtenido exitosamente');
  } catch (error) {
    console.error('Error en obtenerRegistroPorId:', error);
    return errorResponse(res, 'Error al obtener registro blockchain', 500);
  }
};

/**
 * @desc    Verificar integridad de hash en blockchain
 * @route   POST /api/blockchain/verificar
 * @access  Private
 */
exports.verificarHash = async (req, res) => {
  try {
    const { hash_documento } = req.body;

    if (!hash_documento) {
      return errorResponse(res, 'Debe proporcionar un hash_documento', 400);
    }

    const registro = await RegistroBlockchain.findOne({
      where: { hash_documento }
    });

    if (!registro) {
      return successResponse(
        res,
        {
          encontrado: false,
          mensaje: 'Hash NO encontrado en blockchain (documento no registrado o hash incorrecto)'
        },
        'Verificación completada'
      );
    }

    // Verificar permisos (opcional: solo si el usuario tiene derecho a ver este registro)
    let puedeVer = false;
    if (req.user.rol === 'ADMIN') {
      puedeVer = true;
    } else if (req.user.rol === 'CANDIDATO') {
      const candidato = await Candidato.findOne({ where: { usuario_id: req.user.id } });
      if (candidato && registro.entidad_id === candidato.id && registro.tipo_entidad === 'CANDIDATO') {
        puedeVer = true;
      }
    } else if (req.user.rol === 'EMPRESA') {
      const empresa = await Empresa.findOne({ where: { usuario_id: req.user.id } });
      if (empresa && registro.entidad_id === empresa.id && registro.tipo_entidad === 'EMPRESA') {
        puedeVer = true;
      }
    }

    if (!puedeVer) {
      return successResponse(
        res,
        {
          encontrado: true,
          mensaje: 'Hash encontrado en blockchain, pero no tienes permisos para ver detalles'
        },
        'Verificación completada'
      );
    }

    return successResponse(
      res,
      {
        encontrado: true,
        registro: {
          id: registro.id,
          tipo_evento: registro.tipo_evento,
          hash_documento: registro.hash_documento,
          hash_transaccion: registro.hash_transaccion,
          timestamp_blockchain: registro.timestamp_blockchain,
          direccion_wallet: registro.direccion_wallet,
          red_blockchain: registro.red_blockchain
        },
        mensaje: 'Hash VERIFICADO en blockchain ✓'
      },
      'Verificación exitosa'
    );
  } catch (error) {
    console.error('Error en verificarHash:', error);
    return errorResponse(res, 'Error al verificar hash', 500);
  }
};

/**
 * @desc    Obtener estadísticas de blockchain
 * @route   GET /api/blockchain/stats
 * @access  Private (ADMIN)
 */
exports.obtenerEstadisticas = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return errorResponse(res, 'Solo administradores pueden ver estadísticas blockchain', 403);
    }

    const totalRegistros = await RegistroBlockchain.count();

    const porTipoEvento = await RegistroBlockchain.findAll({
      attributes: [
        'tipo_evento',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total']
      ],
      group: ['tipo_evento']
    });

    const porRed = await RegistroBlockchain.findAll({
      attributes: [
        'red_blockchain',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total']
      ],
      group: ['red_blockchain']
    });

    const ultimosRegistros = await RegistroBlockchain.findAll({
      limit: 10,
      order: [['timestamp_blockchain', 'DESC']],
      attributes: ['id', 'tipo_evento', 'hash_documento', 'timestamp_blockchain', 'red_blockchain']
    });

    return successResponse(
      res,
      {
        total_registros: totalRegistros,
        por_tipo_evento: porTipoEvento,
        por_red: porRed,
        ultimos_registros: ultimosRegistros
      },
      'Estadísticas blockchain obtenidas exitosamente'
    );
  } catch (error) {
    console.error('Error en obtenerEstadisticas:', error);
    return errorResponse(res, 'Error al obtener estadísticas blockchain', 500);
  }
};