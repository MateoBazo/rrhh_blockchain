// file: backend/src/controllers/authController.js
const { Usuario, Candidato } = require('../models');
const { generarToken } = require('../utils/jwt');
const { exitoRespuesta, errorRespuesta } = require('../utils/responses');
const { validationResult } = require('express-validator');

const registrar = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { email, password } = req.body;

    // Verificar email existente
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return errorRespuesta(res, 409, 'El email ya está registrado.');
    }

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      email,
      password_hash: password, // Se hasheará automáticamente
      rol: 'CANDIDATO' // 👈 ACTUALIZADO: por defecto CANDIDATO
    });

    const token = generarToken(nuevoUsuario);

    return exitoRespuesta(res, 201, 'Usuario registrado exitosamente', {
      usuario: nuevoUsuario,
      token
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    return errorRespuesta(res, 500, 'Error al registrar usuario', error.message);
  }
};

const login = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return errorRespuesta(res, 401, 'Credenciales inválidas.');
    }

    if (!usuario.activo) {
      return errorRespuesta(res, 403, 'Usuario inactivo. Contacta al administrador.');
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return errorRespuesta(res, 401, 'Credenciales inválidas.');
    }

    // Actualizar último acceso
    usuario.ultimo_acceso = new Date();
    await usuario.save();

    const token = generarToken(usuario);

    return exitoRespuesta(res, 200, 'Login exitoso', {
      usuario,
      token
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    return errorRespuesta(res, 500, 'Error al iniciar sesión', error.message);
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      include: [{ model: Candidato, as: 'candidato' }]
    });

    if (!usuario) {
      return errorRespuesta(res, 404, 'Usuario no encontrado.');
    }

    return exitoRespuesta(res, 200, 'Perfil obtenido', usuario);

  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    return errorRespuesta(res, 500, 'Error al obtener perfil', error.message);
  }
};

module.exports = {
  registrar,
  login,
  obtenerPerfil
};