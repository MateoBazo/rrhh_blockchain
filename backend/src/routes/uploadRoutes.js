// file: backend/src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadFoto, eliminarFoto, subirCV, descargarCV } = require('../controllers/uploadController');
const { verificarToken } = require('../middlewares/auth');  // ✅ CAMBIO: authMiddleware → auth

// ==========================================
// CONFIGURACIÓN MULTER PARA FOTOS DE PERFIL
// ==========================================

// Storage: dónde y cómo guardar archivos
const storageFotos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/fotos/'); // Carpeta destino
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp_userId_random.ext
    const timestamp = Date.now();
    const userId = req.usuario ? req.usuario.id : 'unknown';
    const random = Math.random().toString(36).substring(2, 8); // 6 chars aleatorios
    const ext = path.extname(file.originalname).toLowerCase();
    
    const filename = `${timestamp}_${userId}_${random}${ext}`;
    cb(null, filename);
  }
});

// Validación de archivos para FOTOS (fileFilter)
const fileFilterFotos = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Aceptar archivo
  } else {
    cb(new Error('Solo se permiten imágenes JPG o PNG'), false); // Rechazar
  }
};

// Configuración final de multer para FOTOS
const uploadFotoMiddleware = multer({
  storage: storageFotos,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilterFotos
});

// ==========================================
// CONFIGURACIÓN MULTER PARA CV (PDF)
// ==========================================

const storageCV = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cv/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const userId = req.usuario ? req.usuario.id : 'unknown';
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname).toLowerCase();
    
    const filename = `cv_${timestamp}_${userId}_${random}${ext}`;
    cb(null, filename);
  }
});

const fileFilterCV = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF o Word'), false);
  }
};

const uploadCVMiddleware = multer({
  storage: storageCV,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB máximo para CV
  },
  fileFilter: fileFilterCV
});

// ==========================================
// RUTAS
// ==========================================

/**
 * @route   POST /api/upload/foto
 * @desc    Subir/actualizar foto de perfil
 * @access  Private (Token requerido)
 */
router.post(
  '/foto', 
  verificarToken, 
  uploadFotoMiddleware.single('foto'), // 'foto' es el nombre del campo en FormData
  uploadFoto
);

/**
 * @route   DELETE /api/upload/foto
 * @desc    Eliminar foto de perfil
 * @access  Private (Token requerido)
 */
router.delete(
  '/foto',
  verificarToken,
  eliminarFoto
);

/**
 * @route   POST /api/upload/cv
 * @desc    Subir/actualizar CV
 * @access  Private (Token requerido)
 */
router.post(
  '/cv',
  verificarToken,
  uploadCVMiddleware.single('cv'), // 'cv' es el nombre del campo en FormData
  subirCV
);

/**
 * @route   GET /api/upload/cv/:candidatoId
 * @desc    Descargar CV de candidato
 * @access  Private (Token requerido)
 */
router.get(
  '/cv/:candidatoId',
  verificarToken,
  descargarCV
);

// ==========================================
// MANEJO DE ERRORES DE MULTER
// ==========================================
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    // Errores específicos de multer
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo excede el tamaño máximo permitido'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error al subir archivo: ${error.message}`
    });
  } else if (error) {
    // Otros errores (ej. fileFilter)
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
});

module.exports = router;