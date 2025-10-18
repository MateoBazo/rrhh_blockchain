// file: backend/src/controllers/candidatoController.js
const { Candidato, Usuario } = require('../models');
const { exitoRespuesta, errorRespuesta } = require('../utils/responses');
const { validationResult } = require('express-validator');

/**
 * Obtener todos los candidatos (con paginación y filtros)
 */
const obtenerCandidatos = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      limite = 10, 
      profesion, 
      estado_laboral,
      disponibilidad,
      nivel_educativo
    } = req.query;
    
    const offset = (pagina - 1) * limite;
    const where = {};

    // Filtros opcionales
    if (profesion) where.profesion = { [Op.like]: `%${profesion}%` };
    if (estado_laboral) where.estado_laboral = estado_laboral;
    if (disponibilidad) where.disponibilidad = disponibilidad;
    if (nivel_educativo) where.nivel_educativo = nivel_educativo;

    // Solo mostrar perfiles públicos (a menos que sea admin)
    if (req.usuario.rol !== 'superadmin' && req.usuario.rol !== 'admin_empresa') {
      where.perfil_publico = true;
    }

    const { count, rows } = await Candidato.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['completitud_perfil', 'DESC'], ['created_at', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'verificado', 'activo']
        }
      ]
    });

    return exitoRespuesta(res, 200, 'Candidatos obtenidos', {
      total: count,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      candidatos: rows
    });

  } catch (error) {
    console.error('❌ Error al obtener candidatos:', error);
    return errorRespuesta(res, 500, 'Error al obtener candidatos', error.message);
  }
};

/**
 * Obtener candidato por ID
 */
const obtenerCandidatoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const candidato = await Candidato.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'verificado', 'activo']
        }
      ]
    });

    if (!candidato) {
      return errorRespuesta(res, 404, 'Candidato no encontrado.');
    }

    // Verificar si el perfil es público o si es el propio usuario
    if (!candidato.perfil_publico && 
        candidato.usuario_id !== req.usuario.id &&
        req.usuario.rol !== 'superadmin' &&
        req.usuario.rol !== 'admin_empresa') {
      return errorRespuesta(res, 403, 'Este perfil es privado.');
    }

    return exitoRespuesta(res, 200, 'Candidato obtenido', candidato);

  } catch (error) {
    console.error('❌ Error al obtener candidato:', error);
    return errorRespuesta(res, 500, 'Error al obtener candidato', error.message);
  }
};

/**
 * Crear o actualizar perfil de candidato
 */
const guardarPerfilCandidato = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const datosActualizar = { ...req.body };
    delete datosActualizar.usuario_id; // No permitir cambiar usuario_id

    // Buscar si ya existe un candidato para este usuario
    let candidato = await Candidato.findOne({ 
      where: { usuario_id: req.usuario.id } 
    });

    if (candidato) {
      // Actualizar
      await candidato.update(datosActualizar);
      return exitoRespuesta(res, 200, 'Perfil actualizado exitosamente', candidato);
    } else {
      // Crear
      const nuevoCandidato = await Candidato.create({
        usuario_id: req.usuario.id,
        ...datosActualizar
      });
      return exitoRespuesta(res, 201, 'Perfil creado exitosamente', nuevoCandidato);
    }

  } catch (error) {
    console.error('❌ Error al guardar perfil:', error);
    return errorRespuesta(res, 500, 'Error al guardar perfil', error.message);
  }
};

module.exports = {
  obtenerCandidatos,
  obtenerCandidatoPorId,
  guardarPerfilCandidato
};