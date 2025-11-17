// file: backend/src/routes/vacanteHabilidadesRoutes.js

/**
 * RUTAS: Habilidades Vacante
 * S009.5: Gestión relación N:M vacantes-habilidades
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { verificarToken, verificarRoles } = require('../middlewares/auth');
const {
  agregarHabilidad,
  listarHabilidades,
  actualizarHabilidad,
  eliminarHabilidad,
  listarObligatorias
} = require('../controllers/vacanteHabilidadesController');

/**
 * 1. AGREGAR HABILIDAD
 * POST /api/vacantes/:vacante_id/habilidades
 */
router.post(
  '/:vacante_id/habilidades',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('vacante_id').isInt({ min: 1 }).withMessage('ID de vacante inválido'),
    body('habilidad_id')
      .isInt({ min: 1 }).withMessage('ID de habilidad inválido'),
    body('nivel_minimo_requerido')
      .optional()
      .isIn(['basico', 'intermedio', 'avanzado', 'experto'])
      .withMessage('Nivel inválido'),
    body('obligatoria')
      .optional()
      .isBoolean().withMessage('Obligatoria debe ser true/false'),
    body('peso_ponderacion')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Peso debe estar entre 1 y 100')
  ],
  agregarHabilidad
);

/**
 * 2. LISTAR HABILIDADES
 * GET /api/vacantes/:vacante_id/habilidades
 */
router.get(
  '/:vacante_id/habilidades',
  [
    param('vacante_id').isInt({ min: 1 }).withMessage('ID de vacante inválido')
  ],
  listarHabilidades
);

/**
 * 3. LISTAR SOLO OBLIGATORIAS
 * GET /api/vacantes/:vacante_id/habilidades/obligatorias
 */
router.get(
  '/:vacante_id/habilidades/obligatorias',
  [
    param('vacante_id').isInt({ min: 1 }).withMessage('ID de vacante inválido')
  ],
  listarObligatorias
);

/**
 * 4. ACTUALIZAR HABILIDAD
 * PATCH /api/vacantes/:vacante_id/habilidades/:habilidad_id
 */
router.patch(
  '/:vacante_id/habilidades/:habilidad_id',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('vacante_id').isInt({ min: 1 }).withMessage('ID de vacante inválido'),
    param('habilidad_id').isInt({ min: 1 }).withMessage('ID de habilidad inválido'),
    body('nivel_minimo_requerido')
      .optional()
      .isIn(['basico', 'intermedio', 'avanzado', 'experto'])
      .withMessage('Nivel inválido'),
    body('obligatoria')
      .optional()
      .isBoolean().withMessage('Obligatoria debe ser true/false'),
    body('peso_ponderacion')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Peso debe estar entre 1 y 100')
  ],
  actualizarHabilidad
);

/**
 * 5. ELIMINAR HABILIDAD
 * DELETE /api/vacantes/:vacante_id/habilidades/:habilidad_id
 */
router.delete(
  '/:vacante_id/habilidades/:habilidad_id',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('vacante_id').isInt({ min: 1 }).withMessage('ID de vacante inválido'),
    param('habilidad_id').isInt({ min: 1 }).withMessage('ID de habilidad inválido')
  ],
  eliminarHabilidad
);

module.exports = router;