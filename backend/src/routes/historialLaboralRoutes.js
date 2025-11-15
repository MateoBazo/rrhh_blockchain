// file: backend/src/routes/historialLaboralRoutes.js

const express = require('express');
const router = express.Router();
const { verificarToken, verificarRoles } = require('../middlewares/auth');
const { body, param } = require('express-validator');
const {
  certificarExperiencia,
  responderCertificacion,
  obtenerHistorialCandidato,
  obtenerCertificacionesEmpresa,
  actualizarCertificacion,
  eliminarCertificacion,
  obtenerEstadisticas
} = require('../controllers/historialLaboralController');

/**
 * POST /api/historial-laboral/certificar
 * Empresa certifica experiencia de ex-empleado
 */
router.post(
  '/certificar',
  verificarToken,
  verificarRoles(['EMPRESA', 'ADMIN']),
  [
    body('candidato_id')
      .isInt({ min: 1 })
      .withMessage('ID de candidato inválido'),
    body('cargo')
      .trim()
      .notEmpty()
      .withMessage('El cargo es obligatorio')
      .isLength({ min: 2, max: 200 })
      .withMessage('El cargo debe tener entre 2 y 200 caracteres'),
    body('fecha_inicio')
      .isISO8601()
      .withMessage('Fecha de inicio inválida'),
    body('fecha_fin')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Fecha de fin inválida'),
    body('actualmente_trabajando')
      .optional()
      .isBoolean()
      .withMessage('actualmente_trabajando debe ser boolean'),
    body('descripcion_responsabilidades')
      .trim()
      .notEmpty()
      .withMessage('La descripción de responsabilidades es obligatoria')
      .isLength({ min: 20 })
      .withMessage('La descripción debe tener al menos 20 caracteres'),
    body('tipo_contrato')
      .optional()
      .isIn(['indefinido', 'plazo_fijo', 'consultoria', 'pasantia', 'otro'])
      .withMessage('Tipo de contrato inválido')
  ],
  certificarExperiencia
);

/**
 * PUT /api/historial-laboral/:id/responder
 * Candidato acepta/rechaza certificación
 */
router.put(
  '/:id/responder',
  verificarToken,
  verificarRoles(['CANDIDATO']),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID inválido'),
    body('accion')
      .isIn(['aceptar', 'rechazar'])
      .withMessage('Acción debe ser "aceptar" o "rechazar"'),
    body('motivo_rechazo')
      .if(body('accion').equals('rechazar'))
      .trim()
      .notEmpty()
      .withMessage('El motivo del rechazo es obligatorio')
      .isLength({ min: 10 })
      .withMessage('El motivo debe tener al menos 10 caracteres')
  ],
  responderCertificacion
);

/**
 * GET /api/historial-laboral/candidato/:candidato_id
 * Obtener historial verificado de un candidato
 */
router.get(
  '/candidato/:candidato_id',
  verificarToken,
  [
    param('candidato_id')
      .isInt({ min: 1 })
      .withMessage('ID de candidato inválido')
  ],
  obtenerHistorialCandidato
);

/**
 * GET /api/historial-laboral/empresa/mis-certificaciones
 * Obtener certificaciones emitidas por mi empresa
 */
router.get(
  '/empresa/mis-certificaciones',
  verificarToken,
  verificarRoles(['EMPRESA']),
  obtenerCertificacionesEmpresa
);

/**
 * PATCH /api/historial-laboral/:id
 * Actualizar certificación PENDIENTE
 */
router.patch(
  '/:id',
  verificarToken,
  verificarRoles(['EMPRESA']),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID inválido'),
    body('cargo')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('El cargo debe tener entre 2 y 200 caracteres'),
    body('fecha_inicio')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio inválida'),
    body('fecha_fin')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Fecha de fin inválida')
  ],
  actualizarCertificacion
);

/**
 * DELETE /api/historial-laboral/:id
 * Eliminar certificación PENDIENTE
 */
router.delete(
  '/:id',
  verificarToken,
  verificarRoles(['EMPRESA']),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID inválido')
  ],
  eliminarCertificacion
);

/**
 * GET /api/historial-laboral/estadisticas
 * Estadísticas generales (solo ADMIN)
 */
router.get(
  '/estadisticas',
  verificarToken,
  verificarRoles(['ADMIN']),
  obtenerEstadisticas
);

module.exports = router;