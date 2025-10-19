// file: backend/src/routes/upload.js
const express = require('express');
const router = express.Router();
const { uploadCV, uploadFoto } = require('../middlewares/upload');
const uploadController = require('../controllers/uploadController');
const { verificarToken, verificarRoles } = require('../middlewares/auth'); 


router.post('/cv', 
  verificarToken, 
  verificarRoles(['CANDIDATO']),  
  uploadCV.single('cv'),
  uploadController.subirCV
);

router.post('/foto', 
  verificarToken, 
  verificarRoles(['CANDIDATO']),  
  uploadFoto.single('foto'),
  uploadController.subirFoto
);

router.get('/cv/:id',
  verificarToken,
  uploadController.descargarCV
);

module.exports = router;