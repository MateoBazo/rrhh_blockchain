// file: backend/src/utils/responses.js
/**
 * Funciones helper para respuestas HTTP consistentes
 * Formato en INGLÉS para compatibilidad con frontend
 */

const successResponse = (res, statusCode = 200, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    status: statusCode,
    message,
    data
  });
};

const errorResponse = (res, statusCode = 500, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    error: errors
  });
};

// Aliases en español (por si algún controlador viejo los usa)
const exitoRespuesta = successResponse;
const errorRespuesta = errorResponse;

module.exports = {
  successResponse,
  errorResponse,
  exitoRespuesta,
  errorRespuesta
};