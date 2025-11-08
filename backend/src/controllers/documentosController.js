// file: backend/src/controllers/documentosController.js
const { Documento, Usuario } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Calcular SHA256 hash de un archivo
 */
const calcularHashArchivo = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
};

/**
 * @desc    Subir documento con hash SHA256
 * @route   POST /api/documentos
 * @access  Private
 */
exports.subirDocumento = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Errores de validación', errors.array());
    }

    if (!req.file) {
      return errorResponse(res, 400, 'No se proporcionó ningún archivo');
    }

    // ✅ Obtener usuario_id del token JWT
    const usuario_id = req.usuario.id;
    const { tipo_documento, nombre_documento, descripcion } = req.body;

    // Tipos de documento permitidos (según la tabla)
    const TIPOS_VALIDOS = ['cv', 'certificado_laboral', 'titulo_academico', 'certificacion', 'contrato', 'carta_recomendacion', 'otro', 'CERTIFICADO'];
    
    const tipoNormalizado = tipo_documento ? tipo_documento.toLowerCase() : 'otro';
    
    if (!TIPOS_VALIDOS.includes(tipoNormalizado)) {
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 400, `Tipo de documento inválido. Debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`);
    }

    // Calcular hash SHA256 del archivo
    const hashArchivo = await calcularHashArchivo(req.file.path);

    // Verificar si ya existe un documento con el mismo hash (duplicado)
    const documentoDuplicado = await Documento.findOne({
      where: { usuario_id, hash_sha256: hashArchivo }
    });

    if (documentoDuplicado) {
      fs.unlinkSync(req.file.path);
      return errorResponse(res, 400, 'Ya tienes un documento idéntico subido (mismo contenido)');
    }

    // 🆕 CORRECCIÓN: Construir path relativo en lugar de usar req.file.path absoluto
    const pathRelativo = `uploads/documentos/${req.file.filename}`;

    console.log('📁 Guardando documento:');
    console.log('   - Filename:', req.file.filename);
    console.log('   - Path absoluto (filesystem):', req.file.path);
    console.log('   - Path relativo (BD):', pathRelativo);

    // Crear documento
    const documento = await Documento.create({
      usuario_id,
      tipo: tipoNormalizado,
      nombre_original: nombre_documento || req.file.originalname,
      nombre_archivo_cifrado: req.file.filename,
      path_cifrado: pathRelativo, // 🆕 USAR PATH RELATIVO
      hash_sha256: hashArchivo,
      tamano_bytes: req.file.size,
      mime_type: req.file.mimetype,
      descripcion: descripcion || null,
      publico: false,
      descargas: 0
    });

    return successResponse(res, 201, 'Documento subido exitosamente', {
      id: documento.id,
      tipo: documento.tipo,
      nombre_original: documento.nombre_original,
      tamano_bytes: documento.tamano_bytes,
      hash_sha256: documento.hash_sha256,
      descripcion: documento.descripcion,
      fecha_subida: documento.fecha_subida,
      path_cifrado: documento.path_cifrado // 🆕 Incluir en respuesta para debug
    });
  } catch (error) {
    console.error('❌ Error en subirDocumento:', error);
    // Eliminar archivo si hubo error en BD
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo:', unlinkError);
      }
    }
    return errorResponse(res, 500, 'Error al subir el documento', error.message);
  }
};

/**
 * @desc    Obtener todos los documentos del usuario
 * @route   GET /api/documentos
 * @access  Private
 */
exports.obtenerDocumentos = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { tipo } = req.query;

    const whereClause = { usuario_id };
    if (tipo) {
      whereClause.tipo = tipo.toLowerCase();
    }

    const documentos = await Documento.findAll({
      where: whereClause,
      attributes: ['id', 'tipo', 'nombre_original', 'nombre_archivo_cifrado', 'path_cifrado', 'tamano_bytes', 'mime_type', 'hash_sha256', 'descripcion', 'publico', 'descargas', 'fecha_subida'], // 🆕 Incluir path_cifrado
      order: [['fecha_subida', 'DESC']]
    });

    return successResponse(res, 200, `${documentos.length} documento(s) encontrado(s)`, documentos);
  } catch (error) {
    console.error('❌ Error en obtenerDocumentos:', error);
    return errorResponse(res, 500, 'Error al obtener documentos', error.message);
  }
};

/**
 * @desc    Obtener documento por ID
 * @route   GET /api/documentos/:id
 * @access  Private
 */
exports.obtenerDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const documento = await Documento.findOne({
      where: { id, usuario_id },
      attributes: ['id', 'tipo', 'nombre_original', 'path_cifrado', 'tamano_bytes', 'mime_type', 'hash_sha256', 'descripcion', 'publico', 'descargas', 'fecha_subida'] // 🆕 Incluir path_cifrado
    });

    if (!documento) {
      return errorResponse(res, 404, 'Documento no encontrado');
    }

    return successResponse(res, 200, 'Documento obtenido exitosamente', documento);
  } catch (error) {
    console.error('❌ Error en obtenerDocumentoPorId:', error);
    return errorResponse(res, 500, 'Error al obtener documento', error.message);
  }
};

/**
 * @desc    Verificar integridad de documento (comparar hash)
 * @route   GET /api/documentos/:id/verificar
 * @access  Private
 */
exports.verificarIntegridad = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const documento = await Documento.findOne({
      where: { id, usuario_id }
    });

    if (!documento) {
      return errorResponse(res, 404, 'Documento no encontrado');
    }

    // 🆕 Construir path absoluto desde path relativo para verificación
    const pathAbsoluto = path.join(__dirname, '../../', documento.path_cifrado);

    console.log('🔐 Verificando integridad:');
    console.log('   - Path relativo (BD):', documento.path_cifrado);
    console.log('   - Path absoluto (filesystem):', pathAbsoluto);

    // Verificar que el archivo existe
    if (!fs.existsSync(pathAbsoluto)) {
      return errorResponse(res, 404, 'Archivo no encontrado en el servidor');
    }

    // Calcular hash actual del archivo
    const hashActual = await calcularHashArchivo(pathAbsoluto);

    // Comparar con hash almacenado
    const integro = hashActual === documento.hash_sha256;

    return successResponse(res, 200, integro ? 'Verificación exitosa' : 'Integridad comprometida', {
      integro,
      hash_almacenado: documento.hash_sha256,
      hash_actual: hashActual,
      mensaje: integro
        ? 'El documento NO ha sido modificado (integridad verificada)'
        : 'ALERTA: El documento ha sido MODIFICADO o CORROMPIDO'
    });
  } catch (error) {
    console.error('❌ Error en verificarIntegridad:', error);
    return errorResponse(res, 500, 'Error al verificar integridad', error.message);
  }
};

/**
 * @desc    Eliminar documento
 * @route   DELETE /api/documentos/:id
 * @access  Private
 */
exports.eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const documento = await Documento.findOne({
      where: { id, usuario_id }
    });

    if (!documento) {
      return errorResponse(res, 404, 'Documento no encontrado');
    }

    // 🆕 Construir path absoluto desde path relativo para eliminar
    const pathAbsoluto = path.join(__dirname, '../../', documento.path_cifrado);

    console.log('🗑️ Eliminando documento:');
    console.log('   - Path relativo (BD):', documento.path_cifrado);
    console.log('   - Path absoluto (filesystem):', pathAbsoluto);

    // Eliminar archivo físico
    if (fs.existsSync(pathAbsoluto)) {
      fs.unlinkSync(pathAbsoluto);
      console.log('✅ Archivo físico eliminado');
    } else {
      console.warn('⚠️ Archivo físico no existe, solo eliminando registro BD');
    }

    // Eliminar registro de BD
    await documento.destroy();

    return successResponse(res, 200, 'Documento eliminado exitosamente', null);
  } catch (error) {
    console.error('❌ Error en eliminarDocumento:', error);
    return errorResponse(res, 500, 'Error al eliminar documento', error.message);
  }
};