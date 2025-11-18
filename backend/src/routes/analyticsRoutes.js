// file: backend/src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarRoles } = require('../middlewares/auth');
const {
  // Funciones ADMIN existentes
  getCandidatosStats,
  getEmpresasStats,
  getContratosStats,
  
  // 🆕 S009.8: Funciones EMPRESA
  estadisticasGeneralesEmpresa,
  metricasVacanteEmpresa,
  funnelConversionEmpresa,
  tendenciasTemporalesEmpresa
} = require('../controllers/analyticsController');

// ============================================
// RUTAS ADMIN (existentes)
// ============================================

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

// ============================================
// 🆕 S009.8: RUTAS EMPRESA - POSTULACIONES
// ============================================

/**
 * GET /api/analytics/empresa/general
 * Estadísticas generales empresa (postulaciones propias)
 * Rol: EMPRESA
 */
router.get('/empresa/general',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  estadisticasGeneralesEmpresa
);

/**
 * GET /api/analytics/empresa/vacante/:vacante_id
 * Métricas específicas de una vacante
 * Rol: EMPRESA
 */
router.get('/empresa/vacante/:vacante_id',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  metricasVacanteEmpresa
);

/**
 * GET /api/analytics/empresa/funnel
 * Funnel de conversión postulaciones
 * Query params: ?vacante_id=X (opcional)
 * Rol: EMPRESA
 */
router.get('/empresa/funnel',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  funnelConversionEmpresa
);

/**
 * GET /api/analytics/empresa/tendencias
 * Tendencias temporales postulaciones
 * Query params: ?periodo=dia|semana|mes&vacante_id=X
 * Rol: EMPRESA
 */
router.get('/empresa/tendencias',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  tendenciasTemporalesEmpresa
);

module.exports = router;