// file: backend/src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarRoles } = require('../middlewares/auth');
const {
  getCandidatosStats,
  getEmpresasStats,
  getContratosStats
} = require('../controllers/analyticsController');

/**
 * GET /api/analytics/candidatos-stats
 * Estadísticas de candidatos (solo ADMIN)
 */
router.get('/candidatos-stats',
  verificarToken,
  verificarRoles(['ADMIN']),
  getCandidatosStats
);

/**
 * GET /api/analytics/empresas-stats
 * Estadísticas de empresas (solo ADMIN)
 */
router.get('/empresas-stats',
  verificarToken,
  verificarRoles(['ADMIN']),
  getEmpresasStats
);

/**
 * GET /api/analytics/contratos-stats
 * Estadísticas de contratos (solo ADMIN)
 */
router.get('/contratos-stats',
  verificarToken,
  verificarRoles(['ADMIN']),
  getContratosStats
);

module.exports = router;