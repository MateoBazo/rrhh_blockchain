// file: backend/src/middlewares/upload.js
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Crear carpetas si no existen
const uploadDirs = {
  cv: path.join(__dirname, '../../uploads/cv'),
  fotos: path.join(__dirname, '../../uploads/fotos')
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración de almacenamiento para CV
const storageCV = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.cv);
  },
  filename: (req, file, cb) => {
    // Formato: uuid_timestamp.extension
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Configuración de almacenamiento para fotos
const storageFotos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.fotos);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtros de validación de tipo de archivo
const fileFilterCV = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/msword' // DOC
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, DOC o DOCX.'), false);
  }
};

const fileFilterFotos = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo JPG, JPEG o PNG.'), false);
  }
};

// Middleware de upload para CV (max 10MB)
const uploadCV = multer({
  storage: storageCV,
  fileFilter: fileFilterCV,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Middleware de upload para fotos (max 5MB)
const uploadFoto = multer({
  storage: storageFotos,
  fileFilter: fileFilterFotos,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = {
  uploadCV,
  uploadFoto
};