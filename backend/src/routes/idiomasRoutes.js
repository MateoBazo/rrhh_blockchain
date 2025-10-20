// file: backend/src/routes/idiomasRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');
const {
  crearIdioma,
  obtenerIdiomas,
  obtenerIdiomaPorId,
  actualizarIdioma,
  eliminarIdioma
} = require('../controllers/idiomasController');

router.use(verificarToken);

const validacionIdioma = [
  body('idioma').trim().notEmpty().withMessage('Idioma es requerido'),
  body('nivel_conversacion').trim().notEmpty().withMessage('Nivel de conversación es requerido'),
  body('nivel_escritura').trim().notEmpty().withMessage('Nivel de escritura es requerido'),
  body('nivel_lectura').trim().notEmpty().withMessage('Nivel de lectura es requerido')
];

router.post('/', validacionIdioma, crearIdioma);
router.get('/', obtenerIdiomas);
router.get('/:id', obtenerIdiomaPorId);
router.put('/:id', validacionIdioma, actualizarIdioma);
router.delete('/:id', eliminarIdioma);

module.exports = router;