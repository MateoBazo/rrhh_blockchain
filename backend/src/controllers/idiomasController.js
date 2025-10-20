// file: backend/src/controllers/idiomasController.js
const { Idioma, Candidato } = require('../models');
const { exitoRespuesta, errorRespuesta } = require('../utils/responses');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * GET /api/idiomas
 * Obtener idiomas de un candidato
 */
const obtenerIdiomas = async (req, res) => {
  try {
    const { candidato_id } = req.query;

    // Si no se proporciona candidato_id, obtener del usuario autenticado
    let candidatoIdFiltro = candidato_id;

    if (!candidatoIdFiltro) {
      // Buscar candidato del usuario autenticado
      const candidato = await Candidato.findOne({
        where: { usuario_id: req.usuario.id }
      });

      if (!candidato) {
        return errorRespuesta(res, 404, 'No se encontró perfil de candidato para este usuario.');
      }

      candidatoIdFiltro = candidato.id;
    }

    // RBAC: Solo el propio candidato, ADMIN o EMPRESA pueden ver idiomas
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'EMPRESA') {
      const candidato = await Candidato.findOne({
        where: { usuario_id: req.usuario.id }
      });

      if (!candidato || candidato.id !== parseInt(candidatoIdFiltro)) {
        return errorRespuesta(res, 403, 'No tienes permiso para ver estos idiomas.');
      }
    }

    const idiomas = await Idioma.findAll({
      where: { candidato_id: candidatoIdFiltro },
      order: [['nivel_conversacion', 'DESC'], ['created_at', 'DESC']],
      limit: 50 // LIMIT para prevenir queries sin límite
    });

    return exitoRespuesta(res, 200, 'Idiomas obtenidos exitosamente', {
      total: idiomas.length,
      idiomas
    });

  } catch (error) {
    console.error('❌ Error al obtener idiomas:', error);
    return errorRespuesta(res, 500, 'Error al obtener idiomas', error.message);
  }
};

/**
 * GET /api/idiomas/:id
 * Obtener un idioma específico por ID
 */
const obtenerIdiomaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const idioma = await Idioma.findByPk(id, {
      include: [{ 
        model: Candidato, 
        as: 'candidato',
        attributes: ['id', 'nombres', 'apellido_paterno', 'usuario_id']
      }]
    });

    if (!idioma) {
      return errorRespuesta(res, 404, 'Idioma no encontrado.');
    }

    // RBAC: Solo el propio candidato, ADMIN o EMPRESA pueden ver
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'EMPRESA') {
      if (idioma.candidato.usuario_id !== req.usuario.id) {
        return errorRespuesta(res, 403, 'No tienes permiso para ver este idioma.');
      }
    }

    return exitoRespuesta(res, 200, 'Idioma obtenido exitosamente', idioma);

  } catch (error) {
    console.error('❌ Error al obtener idioma:', error);
    return errorRespuesta(res, 500, 'Error al obtener idioma', error.message);
  }
};

/**
 * POST /api/idiomas
 * Crear un nuevo idioma
 */
const crearIdioma = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    // Buscar candidato del usuario autenticado
    const candidato = await Candidato.findOne({
      where: { usuario_id: req.usuario.id }
    });

    if (!candidato) {
      return errorRespuesta(res, 404, 'Debe crear un perfil de candidato primero.');
    }

    const {
      idioma,
      nivel_lectura,
      nivel_escritura,
      nivel_conversacion,
      certificacion,
      puntuacion,
      fecha_certificacion
    } = req.body;

    // Validación de negocio: nivel conversación >= nivel escritura
    const nivelesOrden = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6, 'NATIVO': 7 };

    if (nivel_conversacion && nivel_escritura) {
      if (nivelesOrden[nivel_conversacion] < nivelesOrden[nivel_escritura]) {
        return errorRespuesta(res, 400, 'El nivel de conversación debe ser mayor o igual al nivel de escritura.');
      }
    }

    // Verificar que no exista el mismo idioma ya registrado
    const idiomaExistente = await Idioma.findOne({
      where: {
        candidato_id: candidato.id,
        idioma: { [Op.like]: idioma }
      }
    });

    if (idiomaExistente) {
      return errorRespuesta(res, 409, `El idioma ${idioma} ya está registrado para este candidato.`);
    }

    const nuevoIdioma = await Idioma.create({
      candidato_id: candidato.id,
      idioma,
      nivel_lectura,
      nivel_escritura,
      nivel_conversacion,
      certificacion,
      puntuacion,
      fecha_certificacion
    });

    return exitoRespuesta(res, 201, 'Idioma creado exitosamente', nuevoIdioma);

  } catch (error) {
    console.error('❌ Error al crear idioma:', error);
    return errorRespuesta(res, 500, 'Error al crear idioma', error.message);
  }
};

/**
 * PUT /api/idiomas/:id
 * Actualizar un idioma
 */
const actualizarIdioma = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { id } = req.params;

    const idioma = await Idioma.findByPk(id, {
      include: [{ model: Candidato, as: 'candidato' }]
    });

    if (!idioma) {
      return errorRespuesta(res, 404, 'Idioma no encontrado.');
    }

    // Verificar ownership: solo el candidato propietario puede actualizar
    if (idioma.candidato.usuario_id !== req.usuario.id && req.usuario.rol !== 'ADMIN') {
      return errorRespuesta(res, 403, 'No tienes permiso para actualizar este idioma.');
    }

    // Validación de negocio si se actualiza nivel
    const { nivel_lectura, nivel_escritura, nivel_conversacion } = req.body;

    if (nivel_conversacion && nivel_escritura) {
      const nivelesOrden = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6, 'NATIVO': 7 };

      if (nivelesOrden[nivel_conversacion] < nivelesOrden[nivel_escritura]) {
        return errorRespuesta(res, 400, 'El nivel de conversación debe ser mayor o igual al nivel de escritura.');
      }
    }

    await idioma.update(req.body);

    return exitoRespuesta(res, 200, 'Idioma actualizado exitosamente', idioma);

  } catch (error) {
    console.error('❌ Error al actualizar idioma:', error);
    return errorRespuesta(res, 500, 'Error al actualizar idioma', error.message);
  }
};

/**
 * DELETE /api/idiomas/:id
 * Eliminar un idioma
 */
const eliminarIdioma = async (req, res) => {
  try {
    const { id } = req.params;

    const idioma = await Idioma.findByPk(id, {
      include: [{ model: Candidato, as: 'candidato' }]
    });

    if (!idioma) {
      return errorRespuesta(res, 404, 'Idioma no encontrado.');
    }

    // Verificar ownership
    if (idioma.candidato.usuario_id !== req.usuario.id && req.usuario.rol !== 'ADMIN') {
      return errorRespuesta(res, 403, 'No tienes permiso para eliminar este idioma.');
    }

    await idioma.destroy();

    return exitoRespuesta(res, 200, 'Idioma eliminado exitosamente');

  } catch (error) {
    console.error('❌ Error al eliminar idioma:', error);
    return errorRespuesta(res, 500, 'Error al eliminar idioma', error.message);
  }
};

module.exports = {
  obtenerIdiomas,
  obtenerIdiomaPorId,  // ✅ AGREGADO
  crearIdioma,
  actualizarIdioma,
  eliminarIdioma
};