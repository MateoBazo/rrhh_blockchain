// file: backend/src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido o inactivo.'
      });
    }

    req.usuario = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor, inicia sesión nuevamente.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación.',
      error: error.message
    });
  }
};

const verificarRoles = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado.'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarRoles
};