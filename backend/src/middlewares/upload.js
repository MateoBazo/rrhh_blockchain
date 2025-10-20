// file: backend/src/middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpetas si no existen
const createUploadDirs = () => {
  const dirs = ['uploads/cv', 'uploads/fotos', 'uploads/documentos'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configuración de almacenamiento para CV
const storageCV = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cv/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `cv-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configuración de almacenamiento para fotos
const storageFoto = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/fotos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `foto-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configuración de almacenamiento para documentos generales
const storageDocumento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documentos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `doc-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filtros de archivos
const fileFilterCV = (req, file, cb) => {
  const allowedTypes = /pdf|docx|doc/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten archivos PDF o DOCX para CV'));
};

const fileFilterFoto = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten imágenes JPG o PNG'));
};

const fileFilterDocumento = (req, file, cb) => {
  const allowedTypes = /pdf|docx|doc|jpg|jpeg|png/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten archivos PDF, DOCX o imágenes'));
};

// Middlewares de Multer
const uploadCV = multer({
  storage: storageCV,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilterCV
}).single('cv');

const uploadFoto = multer({
  storage: storageFoto,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilterFoto
}).single('foto');

const uploadDocumento = multer({
  storage: storageDocumento,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: fileFilterDocumento
}).single('documento');

module.exports = {
  uploadCV,
  uploadFoto,
  uploadDocumento
};