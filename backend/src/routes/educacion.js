// file: backend/src/routes/educacion.js
const express = require('express');
const router = express.Router();
const educacionController = require('../controllers/educacionController');
const { verificarToken, verificarRoles } = require('../middlewares/auth');

router.post('/', 
  verificarToken, 
  verificarRoles(['CANDIDATO']), 
  educacionController.crear
);

router.get('/', 
  verificarToken, 
  educacionController.listar
);

router.put('/:id', 
  verificarToken, 
  verificarRoles(['CANDIDATO']), 
  educacionController.actualizar
);

router.delete('/:id', 
  verificarToken, 
  verificarRoles(['CANDIDATO']), 
  educacionController.eliminar
);

module.exports = router;