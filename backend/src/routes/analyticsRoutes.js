// file: backend/src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const {
  estadisticasCandidatos,
  estadisticasEmpresas,
  estadisticasContratos
} = require('../controllers/analyticsController');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/analytics/candidatos-stats - Estadísticas de candidatos (solo ADMIN)
router.get('/candidatos-stats', estadisticasCandidatos);

// GET /api/analytics/empresas-stats - Estadísticas de empresas (solo ADMIN)
router.get('/empresas-stats', estadisticasEmpresas);

// GET /api/analytics/contratos-stats - Estadísticas de contratos (solo ADMIN)
router.get('/contratos-stats', estadisticasContratos);

module.exports = router;