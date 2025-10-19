// file: backend/src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * Middleware para verificar JWT token
 */
const verificarToken = async (req, res, next) => {
  try {
    // Extraer token del header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        mensaje: 'Token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        mensaje: 'Usuario inactivo'
      });
    }

    // Agregar usuario a req
    req.user = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      candidato_id: usuario.candidato?.id || null,
      empresa_id: usuario.empresas?.[0]?.id || null
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        mensaje: 'Token inválido'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        mensaje: 'Token expirado'
      });
    }
    return res.status(500).json({
      success: false,
      mensaje: 'Error al verificar token'
    });
  }
};

/**
 * Middleware para verificar roles (closure)
 * @param {Array} rolesPermitidos - Array de roles permitidos
 * @returns {Function} Middleware function
 */
const verificarRoles = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        mensaje: 'No autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tiene permisos para esta acción',
        rolRequerido: rolesPermitidos,
        rolActual: req.user.rol
      });
    }

    next();
  };
};

// ✅ EXPORTAR AMBOS (con alias)
module.exports = {
  verificarToken,
  verificarRoles,
  esRol: verificarRoles  
};