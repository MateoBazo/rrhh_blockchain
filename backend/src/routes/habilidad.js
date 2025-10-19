// file: backend/src/routes/habilidad.js
const express = require('express');
const router = express.Router();
const habilidadController = require('../controllers/habilidadController');
const { verificarToken, verificarRoles } = require('../middlewares/auth');

router.post('/', 
  verificarToken, 
  verificarRoles(['CANDIDATO']), 
  habilidadController.crear
);

router.get('/', 
  verificarToken, 
  habilidadController.listar
);

router.put('/:id', 
  verificarToken, 
  verificarRoles(['CANDIDATO']), 
  habilidadController.actualizar
);

router.delete('/:id', 
  verificarToken, 
  verificarRoles(['CANDIDATO']), 
  habilidadController.eliminar
);

module.exports = router;