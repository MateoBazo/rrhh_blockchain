// file: backend/src/controllers/authController.js

const { Usuario, Candidato, Empresa, sequelize } = require('../models');
const { generarToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/responses');
const { validationResult } = require('express-validator');

/**
 * @desc    Registrar nuevo usuario (EMPRESA o CANDIDATO)
 * @route   POST /api/auth/registrar
 * @access  Public
 */
const registrar = async (req, res) => {
  // ✅ INICIAR TRANSACCIÓN
  const transaction = await sequelize.transaction();
  
  try {
    // Validar errores de express-validator
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      await transaction.rollback();
      return errorResponse(res, 400, 'Errores de validación', errores.array());
    }

    const { email, password, rol } = req.body;

    // Validar rol
    if (!['EMPRESA', 'CANDIDATO'].includes(rol)) {
      await transaction.rollback();
      return errorResponse(res, 400, 'Rol inválido. Debe ser EMPRESA o CANDIDATO');
    }

    // Verificar email existente
    const usuarioExistente = await Usuario.findOne({ 
      where: { email },
      transaction 
    });
    
    if (usuarioExistente) {
      await transaction.rollback();
      return errorResponse(res, 409, 'El email ya está registrado');
    }

    // ✅ PASO 1: Crear usuario
    const nuevoUsuario = await Usuario.create({
      email,
      password_hash: password, // Se hasheará automáticamente por el hook
      rol,
      verificado: false,
      activo: true
    }, { transaction });

    console.log(`✅ Usuario creado: ID=${nuevoUsuario.id}, Email=${email}, Rol=${rol}`);

    // ✅ PASO 2: Crear registro según rol
    if (rol === 'EMPRESA') {
      const { 
        nit, 
        razon_social, 
        nombre_comercial, 
        sector,
        telefono,
        departamento,
        ciudad 
      } = req.body;

      // Validaciones específicas de empresa
      if (!nit || !razon_social || !sector || !departamento || !ciudad) {
        await transaction.rollback();
        return errorResponse(
          res, 
          400, 
          'Faltan datos obligatorios de empresa',
          {
            requeridos: ['nit', 'razon_social', 'sector', 'departamento', 'ciudad'],
            recibidos: { nit: !!nit, razon_social: !!razon_social, sector: !!sector, departamento: !!departamento, ciudad: !!ciudad }
          }
        );
      }

      // Verificar NIT único
      const empresaExistente = await Empresa.findOne({ 
        where: { nit },
        transaction 
      });
      
      if (empresaExistente) {
        await transaction.rollback();
        return errorResponse(res, 409, 'El NIT ya está registrado');
      }

      // Crear registro en tabla empresas
      const nuevaEmpresa = await Empresa.create({
        usuario_id: nuevoUsuario.id,
        nit,
        razon_social,
        nombre_comercial: nombre_comercial || razon_social,
        sector,
        telefono: telefono || null,
        pais: 'Bolivia',
        departamento,
        ciudad,
        verificada: false
      }, { transaction });

      console.log(`✅ Empresa creada: ID=${nuevaEmpresa.id}, NIT=${nit}, Sector=${sector}`);

    } else if (rol === 'CANDIDATO') {
      const { 
        ci, 
        nombres, 
        apellido_paterno, 
        apellido_materno,
        fecha_nacimiento,
        sector,
        telefono,
        departamento,
        ciudad
      } = req.body;

      // Validaciones específicas de candidato
      if (!ci || !nombres || !apellido_paterno || !fecha_nacimiento || !sector || !departamento || !ciudad) {
        await transaction.rollback();
        return errorResponse(
          res, 
          400, 
          'Faltan datos obligatorios de candidato',
          {
            requeridos: ['ci', 'nombres', 'apellido_paterno', 'fecha_nacimiento', 'sector', 'departamento', 'ciudad'],
            recibidos: { 
              ci: !!ci, 
              nombres: !!nombres, 
              apellido_paterno: !!apellido_paterno, 
              fecha_nacimiento: !!fecha_nacimiento,
              sector: !!sector,
              departamento: !!departamento,
              ciudad: !!ciudad
            }
          }
        );
      }

      // Verificar CI único
      const candidatoExistente = await Candidato.findOne({ 
        where: { ci },
        transaction 
      });
      
      if (candidatoExistente) {
        await transaction.rollback();
        return errorResponse(res, 409, 'El CI ya está registrado');
      }

      // Validar edad (mayor de 18)
      const edad = Math.floor((new Date() - new Date(fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000));
      if (edad < 18) {
        await transaction.rollback();
        return errorResponse(res, 400, 'Debes ser mayor de 18 años para registrarte');
      }

      // Crear registro en tabla candidatos
      const nuevoCandidato = await Candidato.create({
        usuario_id: nuevoUsuario.id,
        ci,
        nombres,
        apellido_paterno,
        apellido_materno: apellido_materno || null,
        fecha_nacimiento,
        sector, // ✅ NUEVO CAMPO
        telefono: telefono || null,
        pais_residencia: 'Bolivia',
        departamento,
        ciudad,
        perfil_publico: true,
        completitud_perfil: 30 // Perfil básico al registrarse
      }, { transaction });

      console.log(`✅ Candidato creado: ID=${nuevoCandidato.id}, CI=${ci}, Sector=${sector}`);
    }

    // ✅ CONFIRMAR TRANSACCIÓN
    await transaction.commit();

    // Generar token JWT
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
    // ✅ ROLLBACK EN CASO DE ERROR
    await transaction.rollback();
    console.error('❌ Error en registro:', error);
    
    // Manejo de errores específicos de Sequelize
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(res, 400, 'Error de validación', error.errors.map(e => ({
        field: e.path,
        message: e.message
      })));
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return errorResponse(res, 409, 'Ya existe un registro con esos datos', error.errors.map(e => e.message));
    }
    
    return errorResponse(res, 500, 'Error al registrar usuario', error.message);
  }
};

/**
 * @desc    Login de usuario
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorResponse(res, 400, 'Errores de validación', errores.array());
    }

    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return errorResponse(res, 401, 'Credenciales inválidas');
    }

    if (!usuario.activo) {
      return errorResponse(res, 403, 'Usuario inactivo. Contacta al administrador');
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return errorResponse(res, 401, 'Credenciales inválidas');
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

/**
 * @desc    Obtener perfil del usuario autenticado
 * @route   GET /api/auth/perfil
 * @access  Private
 */
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { 
          model: Candidato, 
          as: 'candidato',
          required: false // LEFT JOIN
        },
        {
          model: Empresa,
          as: 'empresas',
          required: false // LEFT JOIN
        }
      ]
    });

    if (!usuario) {
      return errorResponse(res, 404, 'Usuario no encontrado');
    }

    return successResponse(res, 200, 'Perfil obtenido exitosamente', usuario);

  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    return errorResponse(res, 500, 'Error al obtener perfil', error.message);
  }
};

/**
 * @desc    Verificar token JWT
 * @route   GET /api/auth/verificar
 * @access  Private
 */
const verificarToken = async (req, res) => {
  try {
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