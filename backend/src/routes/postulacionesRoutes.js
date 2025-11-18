// file: backend/src/routes/postulacionesRoutes.js

/**
 * RUTAS: Postulaciones
 * S009.6: CRUD + gestión estados
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { verificarToken, verificarRoles } = require('../middlewares/auth');
const {
  postular,
  misPostulaciones,
  postulacionesVacante,
  cambiarEstado,
  retirarPostulacion,
  obtenerDetalle,
  marcarLeida,
  eliminarPostulacion
} = require('../controllers/postulacionesController');

/**
 * 1. POSTULAR
 * POST /api/postulaciones
 */
router.post(
  '/',
  verificarToken,
  verificarRoles(['CANDIDATO']),
  [
    body('vacante_id')
      .isInt({ min: 1 }).withMessage('ID de vacante inválido'),
    body('carta_presentacion')
      .optional()
      .isLength({ max: 2000 }).withMessage('Carta de presentación máximo 2000 caracteres')
  ],
  postular
);

/**
 * 2. MIS POSTULACIONES
 * GET /api/postulaciones/mis-postulaciones
 */
router.get(
  '/mis-postulaciones',
  verificarToken,
  verificarRoles(['CANDIDATO']),
  [
    query('estado')
      .optional()
      .isIn(['postulado', 'revisado', 'preseleccionado', 'entrevista', 'contratado', 'rechazado', 'retirado'])
      .withMessage('Estado inválido'),
    query('pagina')
      .optional()
      .isInt({ min: 1 }).withMessage('Página debe ser mayor a 0'),
    query('limite')
      .optional()
      .isInt({ min: 1, max: 50 }).withMessage('Límite entre 1 y 50')
  ],
  misPostulaciones
);

/**
 * 3. POSTULACIONES DE VACANTE
 * GET /api/postulaciones/vacante/:vacante_id
 */
router.get(
  '/vacante/:vacante_id',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('vacante_id').isInt({ min: 1 }).withMessage('ID de vacante inválido'),
    query('estado').optional().isIn(['postulado', 'revisado', 'preseleccionado', 'entrevista', 'contratado', 'rechazado', 'retirado']),
    query('score_min').optional().isInt({ min: 0, max: 100 }),
    query('pagina').optional().isInt({ min: 1 }),
    query('limite').optional().isInt({ min: 1, max: 50 })
  ],
  postulacionesVacante
);

/**
 * 4. DETALLE POSTULACIÓN
 * GET /api/postulaciones/:id
 */
router.get(
  '/:id',
  verificarToken,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de postulación inválido')
  ],
  obtenerDetalle
);

/**
 * 5. CAMBIAR ESTADO
 * PATCH /api/postulaciones/:id/estado
 */
router.patch(
  '/:id/estado',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID de postulación inválido'),
    body('estado')
      .isIn(['revisado', 'preseleccionado', 'entrevista', 'contratado', 'rechazado'])
      .withMessage('Estado inválido'),
    body('notas')
      .optional()
      .isLength({ max: 1000 }).withMessage('Notas máximo 1000 caracteres')
  ],
  cambiarEstado
);

/**
 * 6. RETIRAR POSTULACIÓN
 * POST /api/postulaciones/:id/retirar
 */
router.post(
  '/:id/retirar',
  verificarToken,
  verificarRoles(['CANDIDATO']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID de postulación inválido'),
    body('motivo')
      .optional()
      .isLength({ max: 500 }).withMessage('Motivo máximo 500 caracteres')
  ],
  retirarPostulacion
);

/**
 * 7. MARCAR COMO LEÍDA
 * PATCH /api/postulaciones/:id/marcar-leida
 */
router.patch(
  '/:id/marcar-leida',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID de postulación inválido')
  ],
  marcarLeida
);

/**
 * 8. ELIMINAR POSTULACIÓN
 * DELETE /api/postulaciones/:id
 */
router.delete(
  '/:id',
  verificarToken,
  verificarRoles(['CANDIDATO']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID de postulación inválido')
  ],
  eliminarPostulacion
);

module.exports = router;