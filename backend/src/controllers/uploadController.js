// file: backend/src/controllers/uploadController.js
const { Candidato, AuditoriaAccion } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const path = require('path');
const fs = require('fs').promises;

/**
 * @desc    Subir CV del candidato
 * @route   POST /api/candidatos/upload-cv
 * @access  Private (CANDIDATO)
 */
exports.subirCV = async (req, res) => {
  try {
    const candidatoId = req.user.candidato_id;

    if (!candidatoId) {
      return errorResponse(res, 'Usuario no tiene perfil de candidato asociado', 403);
    }

    if (!req.file) {
      return errorResponse(res, 'No se proporcionó archivo', 400);
    }

    // Obtener candidato
    const candidato = await Candidato.findByPk(candidatoId);
    if (!candidato) {
      // Eliminar archivo subido si no existe el candidato
      await fs.unlink(req.file.path);
      return errorResponse(res, 'Candidato no encontrado', 404);
    }

    // Eliminar CV anterior si existe
    if (candidato.cv_url) {
      const oldFilePath = path.join(__dirname, '../../', candidato.cv_url);
      try {
        await fs.access(oldFilePath);
        await fs.unlink(oldFilePath);
      } catch (error) {
        // Archivo no existe, continuar
      }
    }

    // Actualizar candidato con nueva URL
    const cvUrl = `/uploads/cv/${req.file.filename}`;
    await candidato.update({ cv_url: cvUrl });

    // Registrar auditoría
    await AuditoriaAccion.create({
      usuario_id: req.user.id,
      accion: 'UPLOAD_ARCHIVO',
      entidad_tipo: 'candidatos',
      entidad_id: candidatoId,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      descripcion: `Subida de CV: ${req.file.originalname}`,
      resultado: 'EXITO'
    });

    return successResponse(res, {
      cv_url: cvUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    }, 'CV subido exitosamente', 200);

  } catch (error) {
    // Eliminar archivo si hubo error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo:', unlinkError);
      }
    }
    console.error('Error en subirCV:', error);
    return errorResponse(res, 'Error al subir CV', 500);
  }
};

/**
 * @desc    Subir foto de perfil del candidato
 * @route   POST /api/candidatos/upload-foto
 * @access  Private (CANDIDATO)
 */
exports.subirFoto = async (req, res) => {
  try {
    const candidatoId = req.user.candidato_id;

    if (!candidatoId) {
      return errorResponse(res, 'Usuario no tiene perfil de candidato asociado', 403);
    }

    if (!req.file) {
      return errorResponse(res, 'No se proporcionó archivo', 400);
    }

    // Obtener candidato
    const candidato = await Candidato.findByPk(candidatoId);
    if (!candidato) {
      await fs.unlink(req.file.path);
      return errorResponse(res, 'Candidato no encontrado', 404);
    }

    // Eliminar foto anterior si existe
    if (candidato.foto_perfil_url) {
      const oldFilePath = path.join(__dirname, '../../', candidato.foto_perfil_url);
      try {
        await fs.access(oldFilePath);
        await fs.unlink(oldFilePath);
      } catch (error) {
        // Archivo no existe, continuar
      }
    }

    // Actualizar candidato con nueva URL
    const fotoUrl = `/uploads/fotos/${req.file.filename}`;
    await candidato.update({ foto_perfil_url: fotoUrl });

    // Registrar auditoría
    await AuditoriaAccion.create({
      usuario_id: req.user.id,
      accion: 'UPLOAD_ARCHIVO',
      entidad_tipo: 'candidatos',
      entidad_id: candidatoId,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      descripcion: `Subida de foto de perfil: ${req.file.originalname}`,
      resultado: 'EXITO'
    });

    return successResponse(res, {
      foto_url: fotoUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    }, 'Foto de perfil subida exitosamente', 200);

  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo:', unlinkError);
      }
    }
    console.error('Error en subirFoto:', error);
    return errorResponse(res, 'Error al subir foto de perfil', 500);
  }
};

/**
 * @desc    Descargar CV del candidato
 * @route   GET /api/candidatos/:id/cv
 * @access  Private (EMPRESA, ADMIN, propio CANDIDATO)
 */
exports.descargarCV = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permisos: solo el propio candidato, empresas o admins
    if (req.user.rol !== 'ADMIN' && 
        req.user.rol !== 'EMPRESA' && 
        req.user.candidato_id !== parseInt(id)) {
      return errorResponse(res, 'No autorizado para descargar este CV', 403);
    }

    const candidato = await Candidato.findByPk(id);
    if (!candidato || !candidato.cv_url) {
      return errorResponse(res, 'CV no encontrado', 404);
    }

    const filePath = path.join(__dirname, '../../', candidato.cv_url);
    
    // Verificar que el archivo existe
    try {
      await fs.access(filePath);
    } catch (error) {
      return errorResponse(res, 'Archivo no encontrado en el servidor', 404);
    }

    // Registrar auditoría
    await AuditoriaAccion.create({
      usuario_id: req.user.id,
      accion: 'DESCARGA_ARCHIVO',
      entidad_tipo: 'candidatos',
      entidad_id: parseInt(id),
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      descripcion: `Descarga de CV del candidato ${id}`,
      resultado: 'EXITO'
    });

    // Enviar archivo
    return res.download(filePath);

  } catch (error) {
    console.error('Error en descargarCV:', error);
    return errorResponse(res, 'Error al descargar CV', 500);
  }
};