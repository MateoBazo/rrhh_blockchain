// file: backend/src/controllers/authController.js
const { Usuario, Candidato, Empresa } = require('../models');
const { generarToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/responses');
const { validationResult } = require('express-validator');

const registrar = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorResponse(res, 400, 'Errores de validación', errores.array());
    }

    const { email, password, rol } = req.body;

    // Verificar email existente
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return errorResponse(res, 409, 'El email ya está registrado.');
    }

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      email,
      password_hash: password, // Se hasheará automáticamente por el hook
      rol: rol || 'CANDIDATO' // Por defecto CANDIDATO
    });

    const token = generarToken(nuevoUsuario);

    return successResponse(res, 201, 'Usuario registrado exitosamente', {
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      },
      token
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    return errorResponse(res, 500, 'Error al registrar usuario', error.message);
  }
};

const login = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorResponse(res, 400, 'Errores de validación', errores.array());
    }

    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return errorResponse(res, 401, 'Credenciales inválidas.');
    }

    if (!usuario.activo) {
      return errorResponse(res, 403, 'Usuario inactivo. Contacta al administrador.');
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return errorResponse(res, 401, 'Credenciales inválidas.');
    }

    // Actualizar último acceso
    usuario.ultimo_acceso = new Date();
    await usuario.save();

    const token = generarToken(usuario);

    return successResponse(res, 200, 'Login exitoso', {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      token
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    return errorResponse(res, 500, 'Error al iniciar sesión', error.message);
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { 
          model: Candidato, 
          as: 'candidato',
          required: false // LEFT JOIN para que no falle si no existe
        },
        {
          model: Empresa,
          as: 'empresas',
          required: false
        }
      ]
    });

    if (!usuario) {
      return errorResponse(res, 404, 'Usuario no encontrado.');
    }

    return successResponse(res, 200, 'Perfil obtenido exitosamente', usuario);

  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    return errorResponse(res, 500, 'Error al obtener perfil', error.message);
  }
};

const verificarToken = async (req, res) => {
  try {
    // El middleware verificarToken ya valida el token y agrega req.usuario
    return successResponse(res, 200, 'Token válido', {
      usuario: req.usuario
    });
  } catch (error) {
    console.error('❌ Error al verificar token:', error);
    return errorResponse(res, 500, 'Error al verificar token', error.message);
  }
};

module.exports = {
  registrar,
  login,
  obtenerPerfil,
  verificarToken
};