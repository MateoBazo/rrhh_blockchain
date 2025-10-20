// file: backend/src/routes/documentosRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');
const { uploadDocumento } = require('../middlewares/upload');
const {
  subirDocumento,
  obtenerDocumentos,
  obtenerDocumentoPorId,
  descargarDocumento,
  verificarIntegridad,
  actualizarDocumento,
  eliminarDocumento
} = require('../controllers/documentosController');

router.use(verificarToken);

// POST /api/documentos - Subir documento
// uploadDocumento ya tiene .single('documento') aplicado
router.post(
  '/',
  uploadDocumento, // <-- Ya tiene .single() en upload.js
  [
    body('tipo_documento').trim().notEmpty().withMessage('Tipo de documento es requerido'),
    body('descripcion').optional().trim()
  ],
  subirDocumento
);

// GET /api/documentos - Obtener todos los documentos
router.get('/', obtenerDocumentos);

// GET /api/documentos/:id - Obtener documento por ID
router.get('/:id', obtenerDocumentoPorId);

// GET /api/documentos/:id/descargar - Descargar documento
router.get('/:id/descargar', descargarDocumento);

// POST /api/documentos/:id/verificar - Verificar integridad
router.post('/:id/verificar', verificarIntegridad);

// PUT /api/documentos/:id - Actualizar descripción
router.put(
  '/:id',
  [body('descripcion').optional().trim()],
  actualizarDocumento
);

// DELETE /api/documentos/:id - Eliminar documento
router.delete('/:id', eliminarDocumento);

module.exports = router;