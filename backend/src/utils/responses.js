// file: backend/src/utils/responses.js
/**
 * Funciones helper para respuestas HTTP consistentes
 */

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

module.exports = {
  exitoRespuesta,
  errorRespuesta
};