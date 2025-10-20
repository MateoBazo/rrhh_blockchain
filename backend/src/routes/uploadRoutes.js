// file: backend/src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadCV, uploadFoto } = require('../middlewares/upload');
const { subirCV, subirFoto, descargarCV } = require('../controllers/uploadController');
const { verificarToken, verificarRoles } = require('../middlewares/auth');

/**
 * POST /api/upload/cv - Subir CV
 * uploadCV debe ser usado con .single('cv')
 */
router.post('/cv',
  verificarToken,
  verificarRoles(['CANDIDATO', 'ADMIN']),
  uploadCV.single('cv'),  // ✅ AGREGADO .single('cv')
  subirCV
);

/**
 * POST /api/upload/foto - Subir foto de perfil
 * uploadFoto debe ser usado con .single('foto')
 */
router.post('/foto',
  verificarToken,
  verificarRoles(['CANDIDATO', 'ADMIN']),
  uploadFoto.single('foto'),  // ✅ AGREGADO .single('foto')
  subirFoto
);

/**
 * GET /api/upload/cv/:candidatoId - Descargar CV
 */
router.get('/cv/:candidatoId',
  verificarToken,
  descargarCV
);

module.exports = router;