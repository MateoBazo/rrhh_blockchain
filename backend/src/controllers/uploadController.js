// file: backend/src/controllers/uploadController.js
const path = require('path');
const fs = require('fs').promises;
const { Candidato } = require('../models');
const { exitoRespuesta, errorRespuesta } = require('../utils/responses');

/**
 * @desc    Subir o actualizar foto de perfil del candidato
 * @route   POST /api/upload/foto
 * @access  Private (Candidato autenticado)
 */
const uploadFoto = async (req, res) => {
  try {
    // 1. Validar que se recibió un archivo
    if (!req.file) {
      return errorRespuesta(res, 400, 'No se recibió ninguna imagen');
    }

    // 2. Validar tipo MIME (double-check servidor)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      // Eliminar archivo subido si no es válido
      await fs.unlink(req.file.path);
      return errorRespuesta(res, 400, 'Solo se permiten imágenes JPG o PNG');
    }

    // 3. Obtener candidato del usuario logueado
    const candidato = await Candidato.findOne({
      where: { usuario_id: req.usuario.id }
    });

    if (!candidato) {
      // Limpiar archivo subido
      await fs.unlink(req.file.path);
      return errorRespuesta(res, 404, 'Candidato no encontrado');
    }

    // 4. Eliminar foto anterior si existe (cleanup)
    if (candidato.foto_perfil_url) {
      const fotoAnteriorPath = path.join(__dirname, '../../', candidato.foto_perfil_url);
      try {
        await fs.unlink(fotoAnteriorPath);
        console.log(`✅ Foto anterior eliminada: ${candidato.foto_perfil_url}`);
      } catch (err) {
        console.log('⚠️ Foto anterior no encontrada, continuando...');
      }
    }

    // 5. Construir URL relativa para guardar en BD
    const fotoUrl = `/uploads/fotos/${req.file.filename}`;

    // 6. Actualizar registro en BD
    await candidato.update({ 
      foto_perfil_url: fotoUrl,
      updated_at: new Date()
    });

    console.log(`✅ Foto actualizada para candidato ID ${candidato.id}: ${fotoUrl}`);

    // 7. Responder con éxito
    return exitoRespuesta(res, 200, 'Foto de perfil actualizada exitosamente', {
      foto_url: fotoUrl,
      filename: req.file.filename,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Error en uploadFoto:', error);
    
    // Intentar limpiar archivo en caso de error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo tras fallo:', unlinkError);
      }
    }
    
    return errorRespuesta(res, 500, 'Error al subir la foto', error.message);
  }
};

/**
 * @desc    Eliminar foto de perfil del candidato
 * @route   DELETE /api/upload/foto
 * @access  Private (Candidato autenticado)
 */
const eliminarFoto = async (req, res) => {
  try {
    const candidato = await Candidato.findOne({
      where: { usuario_id: req.usuario.id }
    });

    if (!candidato) {
      return errorRespuesta(res, 404, 'Candidato no encontrado');
    }

    if (!candidato.foto_perfil_url) {
      return errorRespuesta(res, 400, 'No hay foto de perfil para eliminar');
    }

    // Eliminar archivo del filesystem
    const fotoPath = path.join(__dirname, '../../', candidato.foto_perfil_url);
    try {
      await fs.unlink(fotoPath);
      console.log(`✅ Foto eliminada del filesystem: ${candidato.foto_perfil_url}`);
    } catch (err) {
      console.log('⚠️ Archivo no encontrado en filesystem, continuando...');
    }

    // Actualizar BD (poner NULL)
    await candidato.update({ 
      foto_perfil_url: null,
      updated_at: new Date()
    });

    return exitoRespuesta(res, 200, 'Foto de perfil eliminada exitosamente');

  } catch (error) {
    console.error('❌ Error en eliminarFoto:', error);
    return errorRespuesta(res, 500, 'Error al eliminar la foto', error.message);
  }
};

/**
 * @desc    Subir CV del candidato
 * @route   POST /api/upload/cv
 * @access  Private (CANDIDATO)
 */
const subirCV = async (req, res) => {
  try {
    const candidato = await Candidato.findOne({
      where: { usuario_id: req.usuario.id }
    });

    if (!candidato) {
      if (req.file) await fs.unlink(req.file.path);
      return errorRespuesta(res, 404, 'Candidato no encontrado');
    }

    if (!req.file) {
      return errorRespuesta(res, 400, 'No se proporcionó archivo');
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

    return exitoRespuesta(res, 200, 'CV subido exitosamente', {
      cv_url: cvUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

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
    return errorRespuesta(res, 500, 'Error al subir CV');
  }
};

/**
 * @desc    Descargar CV del candidato
 * @route   GET /api/upload/cv/:candidatoId
 * @access  Private (EMPRESA, ADMIN, propio CANDIDATO)
 */
const descargarCV = async (req, res) => {
  try {
    const { candidatoId } = req.params;

    const candidato = await Candidato.findByPk(candidatoId);
    if (!candidato || !candidato.cv_url) {
      return errorRespuesta(res, 404, 'CV no encontrado');
    }

    // Verificar permisos
    const esPropio = candidato.usuario_id === req.usuario.id;
    const esAdmin = req.usuario.rol === 'ADMIN';
    const esEmpresa = req.usuario.rol === 'EMPRESA';

    if (!esPropio && !esAdmin && !esEmpresa) {
      return errorRespuesta(res, 403, 'No autorizado para descargar este CV');
    }

    const filePath = path.join(__dirname, '../../', candidato.cv_url);
    
    // Verificar que el archivo existe
    try {
      await fs.access(filePath);
    } catch (error) {
      return errorRespuesta(res, 404, 'Archivo no encontrado en el servidor');
    }

    // Enviar archivo
    return res.download(filePath);

  } catch (error) {
    console.error('Error en descargarCV:', error);
    return errorRespuesta(res, 500, 'Error al descargar CV');
  }
};

module.exports = {
  uploadFoto,
  eliminarFoto,
  subirCV,
  descargarCV
};