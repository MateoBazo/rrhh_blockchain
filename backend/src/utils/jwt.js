// file: backend/src/utils/jwt.js
const jwt = require('jsonwebtoken');

const generarToken = (usuario) => {
  const payload = {
    id: usuario.id, // 👈 Usar 'id' según tu tabla
    email: usuario.email,
    rol: usuario.rol
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const verificarTokenUtil = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generarToken,
  verificarTokenUtil
};//.