// file: backend/src/routes/experiencia.js
const express = require('express');
const router = express.Router();
const experienciaController = require('../controllers/experienciaController');
const { verificarToken, verificarRoles } = require('../middlewares/auth');

router.post('/', 
  verificarToken, 
  verificarRoles(['CANDIDATO']), 
  experienciaController.crear
);

router.get('/', 
  verificarToken, 
  experienciaController.listar
);

router.put('/:id', 
  verificarToken, 
  verificarRoles(['CANDIDATO']), 
  experienciaController.actualizar
);

router.delete('/:id', 
  verificarToken, 
  verificarRoles(['CANDIDATO']), 
  experienciaController.eliminar
);

module.exports = router;