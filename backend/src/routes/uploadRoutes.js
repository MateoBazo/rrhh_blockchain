// file: backend/src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadCV, uploadFoto } = require('../middlewares/upload');
const uploadController = require('../controllers/uploadController');
const { verificarToken, verificarRoles } = require('../middlewares/auth');

// POST /api/upload/cv - Subir CV
// CAMBIO: uploadCV ya es una función middleware completa, NO llamar .single() de nuevo
router.post('/cv',
  verificarToken,
  verificarRoles(['CANDIDATO']),
  uploadCV, // <-- SIN .single('cv')
  uploadController.subirCV
);

// POST /api/upload/foto - Subir foto de perfil
// CAMBIO: uploadFoto ya es una función middleware completa, NO llamar .single() de nuevo
router.post('/foto',
  verificarToken,
  verificarRoles(['CANDIDATO']),
  uploadFoto, // <-- SIN .single('foto')
  uploadController.subirFoto
);

// GET /api/upload/cv/:id - Descargar CV
router.get('/cv/:id',
  verificarToken,
  uploadController.descargarCV
);

module.exports = router;