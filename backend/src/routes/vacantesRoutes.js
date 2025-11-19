// file: backend/src/routes/vacantesRoutes.js

/**
 * RUTAS: Vacantes
 * S009.4: CRUD + búsqueda + gestión estados
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { verificarToken, verificarRoles } = require('../middlewares/auth'); // ✅ CORREGIDO: middlewares (plural)
const {
  crearVacante,
  publicarVacante,
  buscarVacantes,
  obtenerDetalleVacante,
  obtenerMisVacantes,
  actualizarVacante,
  pausarVacante,
  reabrirVacante,
  cerrarVacante,
  eliminarVacante
} = require('../controllers/vacantesController');

/**
 * 1. CREAR VACANTE
 * POST /api/vacantes
 */
router.post(
  '/',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    body('titulo')
      .trim()
      .notEmpty().withMessage('El título es obligatorio')
      .isLength({ min: 5, max: 255 }).withMessage('El título debe tener entre 5 y 255 caracteres'),
    
    body('descripcion')
      .trim()
      .notEmpty().withMessage('La descripción es obligatoria')
      .isLength({ min: 50 }).withMessage('La descripción debe tener al menos 50 caracteres'),
    
    body('requisitos')
      .trim()
      .notEmpty().withMessage('Los requisitos son obligatorios')
      .isLength({ min: 20 }).withMessage('Los requisitos deben tener al menos 20 caracteres'),
    
    body('modalidad')
      .optional()
      .isIn(['presencial', 'remoto', 'hibrido']).withMessage('Modalidad inválida'),
    
    body('tipo_contrato')
      .optional()
      .isIn(['indefinido', 'temporal', 'practicas', 'freelance']).withMessage('Tipo de contrato inválido'),
    
    body('experiencia_requerida_anios')
      .optional()
      .isInt({ min: 0, max: 30 }).withMessage('La experiencia debe estar entre 0 y 30 años'),
    
    body('salario_min')
      .optional()
      .isFloat({ min: 0 }).withMessage('El salario mínimo debe ser mayor o igual a 0'),
    
    body('salario_max')
      .optional()
      .isFloat({ min: 0 }).withMessage('El salario máximo debe ser mayor o igual a 0'),
    
    body('fecha_cierre')
      .optional()
      .isISO8601().withMessage('Fecha de cierre inválida')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('La fecha de cierre debe ser futura');
        }
        return true;
      }),
    
    body('vacantes_disponibles')
      .optional()
      .isInt({ min: 1 }).withMessage('Debe haber al menos 1 vacante disponible')
  ],
  crearVacante
);
/**
 * 1.5 LISTAR TODAS LAS VACANTES
 * GET /api/vacantes
 * Query params: estado, modalidad, departamento, ciudad, pagina, limite
 */
router.get(
  '/',
  [
    query('estado').optional().isIn(['abierta', 'pausada', 'cerrada']),
    query('modalidad').optional().isIn(['presencial', 'remoto', 'hibrido']),
    query('departamento').optional().trim(),
    query('ciudad').optional().trim(),
    query('salario_min').optional().isInt({ min: 0 }),
    query('salario_max').optional().isInt({ min: 0 }),
    query('experiencia_max').optional().isInt({ min: 0, max: 30 }),
    query('pagina').optional().isInt({ min: 1 }).toInt(),
    query('limite').optional().isInt({ min: 1, max: 50 }).toInt()
  ],
  buscarVacantes // Reutilizamos el mismo controlador que /buscar
);

/**
 * 2. PUBLICAR VACANTE
 * POST /api/vacantes/:id/publicar
 */
router.post(
  '/:id/publicar',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido')
  ],
  publicarVacante
);

/**
 * 3. BUSCAR VACANTES (público)
 * GET /api/vacantes/buscar
 */
router.get(
  '/buscar',
  [
    query('q').optional().trim(),
    query('modalidad').optional().isIn(['presencial', 'remoto', 'hibrido']),
    query('departamento').optional().trim(),
    query('ciudad').optional().trim(),
    query('salario_min').optional().isInt({ min: 0 }),
    query('salario_max').optional().isInt({ min: 0 }),
    query('experiencia_max').optional().isInt({ min: 0, max: 30 }),
    query('pagina').optional().isInt({ min: 1 }),
    query('limite').optional().isInt({ min: 1, max: 50 })
  ],
  buscarVacantes
);

/**
 * 4. MIS VACANTES (empresa)
 * GET /api/vacantes/empresa/mis-vacantes
 */
router.get(
  '/empresa/mis-vacantes',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    query('estado').optional().isIn(['borrador', 'abierta', 'pausada', 'cerrada']),
    query('pagina').optional().isInt({ min: 1 }),
    query('limite').optional().isInt({ min: 1, max: 50 })
  ],
  obtenerMisVacantes
);

/**
 * 5. DETALLE VACANTE
 * GET /api/vacantes/:id
 */
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido')
  ],
  obtenerDetalleVacante
);

/**
 * 6. ACTUALIZAR VACANTE
 * PATCH /api/vacantes/:id
 */
router.patch(
  '/:id',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('titulo').optional().trim().isLength({ min: 5, max: 255 }),
    body('descripcion').optional().trim().isLength({ min: 50 }),
    body('requisitos').optional().trim().isLength({ min: 20 }),
    body('modalidad').optional().isIn(['presencial', 'remoto', 'hibrido']),
    body('salario_min').optional().isFloat({ min: 0 }),
    body('salario_max').optional().isFloat({ min: 0 })
  ],
  actualizarVacante
);

/**
 * 7. PAUSAR VACANTE
 * PATCH /api/vacantes/:id/pausar
 */
router.patch(
  '/:id/pausar',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido')
  ],
  pausarVacante
);

/**
 * 8. REABRIR VACANTE
 * PATCH /api/vacantes/:id/reabrir
 */
router.patch(
  '/:id/reabrir',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido')
  ],
  reabrirVacante
);

/**
 * 9. CERRAR VACANTE
 * PATCH /api/vacantes/:id/cerrar
 */
router.patch(
  '/:id/cerrar',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido')
  ],
  cerrarVacante
);

/**
 * 10. ELIMINAR VACANTE
 * DELETE /api/vacantes/:id
 */
router.delete(
  '/:id',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido')
  ],
  eliminarVacante
);

module.exports = router;