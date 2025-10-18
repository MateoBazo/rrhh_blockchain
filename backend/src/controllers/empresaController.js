// file: backend/src/controllers/empresaController.js
const { Empresa, Usuario } = require('../models');
const { exitoRespuesta, errorRespuesta } = require('../utils/responses');
const { validationResult } = require('express-validator');

const obtenerEmpresas = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, verificada } = req.query;
    const offset = (pagina - 1) * limite;

    const where = {};
    if (verificada !== undefined) {
      where.verificada = verificada === 'true';
    }

    const { count, rows } = await Empresa.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario_admin',
          attributes: ['id', 'email', 'rol']
        }
      ]
    });

    return exitoRespuesta(res, 200, 'Empresas obtenidas', {
      total: count,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      empresas: rows
    });

  } catch (error) {
    console.error('❌ Error al obtener empresas:', error);
    return errorRespuesta(res, 500, 'Error al obtener empresas', error.message);
  }
};

const obtenerEmpresaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const empresa = await Empresa.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario_admin',
          attributes: ['id', 'email', 'rol']
        }
      ]
    });

    if (!empresa) {
      return errorRespuesta(res, 404, 'Empresa no encontrada.');
    }

    return exitoRespuesta(res, 200, 'Empresa obtenida', empresa);

  } catch (error) {
    console.error('❌ Error al obtener empresa:', error);
    return errorRespuesta(res, 500, 'Error al obtener empresa', error.message);
  }
};

const crearEmpresa = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const {
      nit,
      razon_social,
      nombre_comercial,
      sector,
      tamanio,
      telefono,
      sitio_web,
      pais,
      departamento,
      ciudad,
      direccion,
      descripcion,
      logo_url
    } = req.body;

    // Verificar NIT único (si se proporciona)
    if (nit) {
      const empresaExistente = await Empresa.findOne({ where: { nit } });
      if (empresaExistente) {
        return errorRespuesta(res, 409, 'El NIT ya está registrado.');
      }
    }

    const nuevaEmpresa = await Empresa.create({
      usuario_id: req.usuario.id,
      nit,
      razon_social,
      nombre_comercial,
      sector,
      tamanio,
      telefono,
      sitio_web,
      pais,
      departamento,
      ciudad,
      direccion,
      descripcion,
      logo_url,
      verificada: false
    });

    return exitoRespuesta(res, 201, 'Empresa creada exitosamente', nuevaEmpresa);

  } catch (error) {
    console.error('❌ Error al crear empresa:', error);
    return errorRespuesta(res, 500, 'Error al crear empresa', error.message);
  }
};

const actualizarEmpresa = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);

    if (!empresa) {
      return errorRespuesta(res, 404, 'Empresa no encontrada.');
    }

    // Verificar permisos: ser creador o ADMIN
    if (empresa.usuario_id !== req.usuario.id && req.usuario.rol !== 'ADMIN') { // 👈 ACTUALIZADO
      return errorRespuesta(res, 403, 'No tienes permisos para actualizar esta empresa.');
    }

    // Si se actualiza NIT, verificar único
    if (req.body.nit && req.body.nit !== empresa.nit) {
      const nitExistente = await Empresa.findOne({ where: { nit: req.body.nit } });
      if (nitExistente) {
        return errorRespuesta(res, 409, 'El NIT ya está registrado por otra empresa.');
      }
    }

    await empresa.update(req.body);

    return exitoRespuesta(res, 200, 'Empresa actualizada exitosamente', empresa);

  } catch (error) {
    console.error('❌ Error al actualizar empresa:', error);
    return errorRespuesta(res, 500, 'Error al actualizar empresa', error.message);
  }
};

const eliminarEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);

    if (!empresa) {
      return errorRespuesta(res, 404, 'Empresa no encontrada.');
    }

    // Solo ADMIN puede eliminar
    if (req.usuario.rol !== 'ADMIN') { // 👈 ACTUALIZADO
      return errorRespuesta(res, 403, 'Solo ADMIN puede eliminar empresas.');
    }

    // Soft delete
    await empresa.update({ verificada: false });

    return exitoRespuesta(res, 200, 'Empresa desactivada exitosamente');

  } catch (error) {
    console.error('❌ Error al eliminar empresa:', error);
    return errorRespuesta(res, 500, 'Error al eliminar empresa', error.message);
  }
};

module.exports = {
  obtenerEmpresas,
  obtenerEmpresaPorId,
  crearEmpresa,
  actualizarEmpresa,
  eliminarEmpresa
};