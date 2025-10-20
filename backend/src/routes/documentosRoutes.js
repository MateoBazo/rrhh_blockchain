// file: backend/src/routes/documentosRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const { uploadDocumento } = require('../middlewares/upload');
const {
  subirDocumento,
  obtenerDocumentos,
  obtenerDocumentoPorId,
  verificarIntegridad,
  eliminarDocumento
} = require('../controllers/documentosController');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// POST /api/documentos - Subir documento
router.post('/', uploadDocumento.single('documento'), subirDocumento);

// GET /api/documentos - Listar documentos
router.get('/', obtenerDocumentos);

// GET /api/documentos/:id - Obtener documento por ID
router.get('/:id', obtenerDocumentoPorId);

// GET /api/documentos/:id/verificar - Verificar integridad
router.get('/:id/verificar', verificarIntegridad);

// DELETE /api/documentos/:id - Eliminar documento
router.delete('/:id', eliminarDocumento);

module.exports = router;