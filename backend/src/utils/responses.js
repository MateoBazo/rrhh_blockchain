// file: backend/src/utils/responses.js
/**
 * Funciones helper para respuestas HTTP consistentes
 * Soporta tanto español como inglés para compatibilidad
 */

// Implementación base en español
const exitoRespuesta = (res, statusCode = 200, mensaje, datos = null) => {
  return res.status(statusCode).json({
    exito: true,
    mensaje,
    datos
  });
};

const errorRespuesta = (res, statusCode = 500, mensaje, errores = null) => {
  return res.status(statusCode).json({
    exito: false,
    mensaje,
    errores
  });
};

// Aliases en inglés que retornan estructura en español
// (para compatibilidad con controladores nuevos)
const successResponse = (res, statusCode = 200, message, data = null) => {
  return exitoRespuesta(res, statusCode, message, data);
};

const errorResponse = (res, statusCode = 500, message, errors = null) => {
  return errorRespuesta(res, statusCode, message, errors);
};

module.exports = {
  // Español (original)
  exitoRespuesta,
  errorRespuesta,
  // Inglés (alias para compatibilidad)
  successResponse,
  errorResponse
};