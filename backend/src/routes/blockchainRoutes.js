// file: backend/src/routes/blockchainRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');
const {
  obtenerRegistros,
  obtenerRegistroPorId,
  verificarHash,
  obtenerEstadisticas
} = require('../controllers/blockchainController');

router.use(verificarToken);

// GET /api/blockchain - Obtener registros blockchain
router.get('/', obtenerRegistros);

// GET /api/blockchain/stats - Estadísticas (solo ADMIN)
router.get('/stats', obtenerEstadisticas);

// GET /api/blockchain/:id - Obtener registro por ID
router.get('/:id', obtenerRegistroPorId);

// POST /api/blockchain/verificar - Verificar hash
router.post(
  '/verificar',
  [body('hash_documento').trim().notEmpty().withMessage('Hash es requerido')],
  verificarHash
);

module.exports = router;