// file: backend/src/middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Crear directorios si no existen
const crearDirectorio = (ruta) => {
  if (!fs.existsSync(ruta)) {
    fs.mkdirSync(ruta, { recursive: true });
  }
};

// Directorios de upload
const UPLOAD_DIRS = {
  cv: path.join(__dirname, '../../uploads/cv'),
  fotos: path.join(__dirname, '../../uploads/fotos'),
  documentos: path.join(__dirname, '../../uploads/documentos')
};

// Crear todos los directorios
Object.values(UPLOAD_DIRS).forEach(crearDirectorio);

// ============================================
// STORAGE PARA CVs
// ============================================
const storageCV = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRS.cv);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilterCV = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, DOC, DOCX.'), false);
  }
};

const uploadCV = multer({
  storage: storageCV,
  fileFilter: fileFilterCV,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ============================================
// STORAGE PARA FOTOS
// ============================================
const storageFotos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRS.fotos);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilterFotos = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo JPG, JPEG, PNG.'), false);
  }
};

const uploadFoto = multer({
  storage: storageFotos,
  fileFilter: fileFilterFotos,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ============================================
// STORAGE PARA DOCUMENTOS (NUEVO)
// ============================================
const storageDocumentos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRS.documentos);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilterDocumentos = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, DOC, DOCX, JPG, PNG.'), false);
  }
};

const uploadDocumento = multer({
  storage: storageDocumentos,
  fileFilter: fileFilterDocumentos,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

// ============================================
// EXPORTS
// ============================================
module.exports = {
  uploadCV,
  uploadFoto,
  uploadDocumento
};