// file: backend/src/middlewares/errorHandler.js
/**
 * Middleware centralizado para manejo de errores
 */

// Middleware para rutas no encontradas (404)
const noEncontrado = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware para errores generales
const manejadorErrores = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log del error (en producción usar logger profesional)
  console.error('❌ Error:', {
    mensaje: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    ruta: req.originalUrl,
    metodo: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json({
    exito: false,
    mensaje: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  noEncontrado,
  manejadorErrores
};