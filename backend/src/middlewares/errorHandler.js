// file: backend/src/middlewares/errorHandler.js
/**
 * Middleware centralizado para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  // Si el statusCode ya está establecido, úsalo; sino, 500
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  console.error('❌ Error:', {
    mensaje: err.message,
    stack: err.stack,
    url: req.originalUrl,
    metodo: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json({
    success: false,
    mensaje: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;