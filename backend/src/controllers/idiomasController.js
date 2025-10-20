// file: backend/src/controllers/idiomasController.js
const { Idioma } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { validationResult } = require('express-validator');

// Niveles CEFR válidos
const NIVELES_VALIDOS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'NATIVO'];

// Mapeo de niveles a números para comparación
const NIVEL_VALOR = {
  'A1': 1,
  'A2': 2,
  'B1': 3,
  'B2': 4,
  'C1': 5,
  'C2': 6,
  'NATIVO': 7
};

/**
 * @desc    Crear nuevo idioma
 * @route   POST /api/idiomas
 * @access  Private (CANDIDATO)
 */
exports.crearIdioma = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    const candidatoId = req.user.id;
    const { idioma, nivel_conversacion, nivel_escritura, nivel_lectura } = req.body;

    // Validación 1: Niveles válidos
    if (!NIVELES_VALIDOS.includes(nivel_conversacion.toUpperCase())) {
      return errorResponse(res, `Nivel de conversación inválido. Debe ser uno de: ${NIVELES_VALIDOS.join(', ')}`, 400);
    }
    if (!NIVELES_VALIDOS.includes(nivel_escritura.toUpperCase())) {
      return errorResponse(res, `Nivel de escritura inválido. Debe ser uno de: ${NIVELES_VALIDOS.join(', ')}`, 400);
    }
    if (!NIVELES_VALIDOS.includes(nivel_lectura.toUpperCase())) {
      return errorResponse(res, `Nivel de lectura inválido. Debe ser uno de: ${NIVELES_VALIDOS.join(', ')}`, 400);
    }

    // Validación 2: nivel_conversacion >= nivel_escritura (habilidad oral suele ser indicador general)
    const valorConv = NIVEL_VALOR[nivel_conversacion.toUpperCase()];
    const valorEscr = NIVEL_VALOR[nivel_escritura.toUpperCase()];
    
    if (valorConv < valorEscr) {
      return errorResponse(
        res,
        'El nivel de conversación debe ser igual o superior al nivel de escritura',
        400
      );
    }

    // Validación 3: Idioma único por candidato
    const idiomaExistente = await Idioma.findOne({
      where: {
        candidato_id: candidatoId,
        idioma: idioma.trim()
      }
    });

    if (idiomaExistente) {
      return errorResponse(res, 'Ya tienes este idioma registrado', 400);
    }

    const nuevoIdioma = await Idioma.create({
      candidato_id: candidatoId,
      idioma: idioma.trim(),
      nivel_conversacion: nivel_conversacion.toUpperCase(),
      nivel_escritura: nivel_escritura.toUpperCase(),
      nivel_lectura: nivel_lectura.toUpperCase()
    });

    return successResponse(res, nuevoIdioma, 'Idioma creado exitosamente', 201);
  } catch (error) {
    console.error('Error en crearIdioma:', error);
    return errorResponse(res, 'Error al crear el idioma', 500);
  }
};

/**
 * @desc    Obtener todos los idiomas del candidato
 * @route   GET /api/idiomas
 * @access  Private (CANDIDATO)
 */
exports.obtenerIdiomas = async (req, res) => {
  try {
    const candidatoId = req.user.id;

    const idiomas = await Idioma.findAll({
      where: { candidato_id: candidatoId },
      order: [['idioma', 'ASC']]
    });

    return successResponse(res, idiomas, `${idiomas.length} idioma(s) encontrado(s)`);
  } catch (error) {
    console.error('Error en obtenerIdiomas:', error);
    return errorResponse(res, 'Error al obtener idiomas', 500);
  }
};

/**
 * @desc    Obtener idioma por ID
 * @route   GET /api/idiomas/:id
 * @access  Private (CANDIDATO - solo propios)
 */
exports.obtenerIdiomaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const candidatoId = req.user.id;

    const idioma = await Idioma.findOne({
      where: { id, candidato_id: candidatoId }
    });

    if (!idioma) {
      return errorResponse(res, 'Idioma no encontrado', 404);
    }

    return successResponse(res, idioma, 'Idioma obtenido exitosamente');
  } catch (error) {
    console.error('Error en obtenerIdiomaPorId:', error);
    return errorResponse(res, 'Error al obtener idioma', 500);
  }
};

/**
 * @desc    Actualizar idioma
 * @route   PUT /api/idiomas/:id
 * @access  Private (CANDIDATO - solo propios)
 */
exports.actualizarIdioma = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    const { id } = req.params;
    const candidatoId = req.user.id;
    const { idioma, nivel_conversacion, nivel_escritura, nivel_lectura } = req.body;

    const idiomaExistente = await Idioma.findOne({
      where: { id, candidato_id: candidatoId }
    });

    if (!idiomaExistente) {
      return errorResponse(res, 'Idioma no encontrado', 404);
    }

    // Validar niveles si se proporcionan
    if (nivel_conversacion && !NIVELES_VALIDOS.includes(nivel_conversacion.toUpperCase())) {
      return errorResponse(res, `Nivel de conversación inválido. Debe ser uno de: ${NIVELES_VALIDOS.join(', ')}`, 400);
    }
    if (nivel_escritura && !NIVELES_VALIDOS.includes(nivel_escritura.toUpperCase())) {
      return errorResponse(res, `Nivel de escritura inválido. Debe ser uno de: ${NIVELES_VALIDOS.join(', ')}`, 400);
    }
    if (nivel_lectura && !NIVELES_VALIDOS.includes(nivel_lectura.toUpperCase())) {
      return errorResponse(res, `Nivel de lectura inválido. Debe ser uno de: ${NIVELES_VALIDOS.join(', ')}`, 400);
    }

    // Validar relación conversación >= escritura
    const nivelConv = nivel_conversacion ? nivel_conversacion.toUpperCase() : idiomaExistente.nivel_conversacion;
    const nivelEscr = nivel_escritura ? nivel_escritura.toUpperCase() : idiomaExistente.nivel_escritura;
    
    if (NIVEL_VALOR[nivelConv] < NIVEL_VALOR[nivelEscr]) {
      return errorResponse(
        res,
        'El nivel de conversación debe ser igual o superior al nivel de escritura',
        400
      );
    }

    await idiomaExistente.update({
      idioma: idioma ? idioma.trim() : idiomaExistente.idioma,
      nivel_conversacion: nivelConv,
      nivel_escritura: nivelEscr,
      nivel_lectura: nivel_lectura ? nivel_lectura.toUpperCase() : idiomaExistente.nivel_lectura
    });

    return successResponse(res, idiomaExistente, 'Idioma actualizado exitosamente');
  } catch (error) {
    console.error('Error en actualizarIdioma:', error);
    return errorResponse(res, 'Error al actualizar idioma', 500);
  }
};

/**
 * @desc    Eliminar idioma
 * @route   DELETE /api/idiomas/:id
 * @access  Private (CANDIDATO - solo propios)
 */
exports.eliminarIdioma = async (req, res) => {
  try {
    const { id } = req.params;
    const candidatoId = req.user.id;

    const idioma = await Idioma.findOne({
      where: { id, candidato_id: candidatoId }
    });

    if (!idioma) {
      return errorResponse(res, 'Idioma no encontrado', 404);
    }

    await idioma.destroy();

    return successResponse(res, null, 'Idioma eliminado exitosamente');
  } catch (error) {
    console.error('Error en eliminarIdioma:', error);
    return errorResponse(res, 'Error al eliminar idioma', 500);
  }
};