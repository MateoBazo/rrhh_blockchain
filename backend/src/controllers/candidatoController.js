// file: backend/src/controllers/candidatoController.js
const { Candidato, Usuario, Educacion, ExperienciaLaboral, Habilidad, Certificacion, Idioma, Referencia, Documento, ContratoLaboral, Empresa } = require('../models');
const { exitoRespuesta, errorRespuesta } = require('../utils/responses');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * 🆕 Obtener perfil del candidato del usuario logueado
 * GET /api/candidatos/me
 */
const obtenerMiPerfil = async (req, res) => {
  try {
    // Buscar candidato asociado al usuario logueado
    let candidato = await Candidato.findOne({
      where: { usuario_id: req.usuario.id },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'rol', 'activo']
        }
      ]
    });

    if (!candidato) {
      // Si no existe, crear uno con los campos mínimos requeridos
      candidato = await Candidato.create({
        usuario_id: req.usuario.id,
        nombres: 'Sin completar',
        apellido_paterno: 'Sin completar',
        apellido_materno: '',
        ci: null,
        telefono: null,
        profesion: null,
        nivel_educativo: null,
        estado_laboral: null,
        disponibilidad: null,
        modalidad_preferida: null,
        perfil_publico: true
      });

      // Recargar con relaciones
      candidato = await Candidato.findByPk(candidato.id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'email', 'rol', 'activo']
          }
        ]
      });

      return exitoRespuesta(res, 201, 'Perfil creado automáticamente', candidato);
    }

    // Headers no-cache para evitar 304 Not Modified
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return exitoRespuesta(res, 200, 'Perfil obtenido', candidato);

  } catch (error) {
    console.error('❌ Error al obtener mi perfil:', error);
    return errorRespuesta(res, 500, 'Error al obtener perfil', error.message);
  }
};

/**
 * Obtener todos los candidatos (con paginación y filtros)
 * GET /api/candidatos
 */
const obtenerCandidatos = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      limite = 10, 
      profesion, 
      estado_laboral,
      disponibilidad,
      nivel_educativo
    } = req.query;
    
    const offset = (pagina - 1) * limite;
    const where = {};

    // Filtros opcionales
    if (profesion) where.profesion = { [Op.like]: `%${profesion}%` };
    if (estado_laboral) where.estado_laboral = estado_laboral;
    if (disponibilidad) where.disponibilidad = disponibilidad;
    if (nivel_educativo) where.nivel_educativo = nivel_educativo;

    // Solo mostrar perfiles públicos (a menos que sea admin)
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'admin_empresa') {
      where.perfil_publico = true;
    }

    const { count, rows } = await Candidato.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['completitud_perfil', 'DESC'], ['createdAt', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'activo']
        }
      ]
    });

    return exitoRespuesta(res, 200, 'Candidatos obtenidos', {
      total: count,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      candidatos: rows
    });

  } catch (error) {
    console.error('❌ Error al obtener candidatos:', error);
    return errorRespuesta(res, 500, 'Error al obtener candidatos', error.message);
  }
};

/**
 * Obtener candidato por ID
 * GET /api/candidatos/:id
 */
const obtenerCandidatoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const candidato = await Candidato.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'rol', 'activo']
        }
      ]
    });

    if (!candidato) {
      return errorRespuesta(res, 404, 'Candidato no encontrado.');
    }

    // Verificar permisos
    const esPropio = candidato.usuario_id === req.usuario.id;
    const esAdmin = req.usuario.rol === 'ADMIN';
    const esEmpresa = req.usuario.rol === 'EMPRESA';

    // Verificar si el perfil es público o si es el propio usuario
    if (!candidato.perfil_publico && !esPropio && !esAdmin && !esEmpresa) {
      return errorRespuesta(res, 403, 'Este perfil es privado.');
    }

    return exitoRespuesta(res, 200, 'Candidato obtenido', candidato);

  } catch (error) {
    console.error('❌ Error al obtener candidato:', error);
    return errorRespuesta(res, 500, 'Error al obtener candidato', error.message);
  }
};

/**
 * 🆕 Actualizar perfil de candidato
 * PUT /api/candidatos/:id
 */
const actualizarPerfil = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const { id } = req.params;
    const candidato = await Candidato.findByPk(id);

    if (!candidato) {
      return errorRespuesta(res, 404, 'Candidato no encontrado');
    }

    // Verificar que el usuario solo pueda editar su propio perfil (excepto ADMIN)
    if (candidato.usuario_id !== req.usuario.id && req.usuario.rol !== 'ADMIN') {
      return errorRespuesta(res, 403, 'No tienes permiso para editar este perfil');
    }

    // Actualizar campos permitidos
    const camposPermitidos = [
      'nombres',
      'apellido_paterno',
      'apellido_materno',
      'ci',
      'telefono', 
      'direccion', 
      'fecha_nacimiento',
      'profesion',
      'nivel_educativo',
      'estado_laboral',
      'disponibilidad',
      'modalidad_preferida',
      'perfil_publico'
    ];

    const datosActualizar = {};
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        datosActualizar[campo] = req.body[campo];
      }
    });

    if (Object.keys(datosActualizar).length === 0) {
      return errorRespuesta(res, 400, 'No hay datos para actualizar');
    }

    await candidato.update(datosActualizar, {
      fields: Object.keys(datosActualizar),
      validate: true
    });

    // Recargar desde BD para obtener datos frescos
    await candidato.reload({
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'rol', 'activo']
        }
      ]
    });

    // Headers no-cache
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return exitoRespuesta(res, 200, 'Perfil actualizado exitosamente', candidato);

  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    return errorRespuesta(res, 500, 'Error al actualizar perfil', error.message);
  }
};

/**
 * Guardar perfil candidato (crear o actualizar)
 * POST /api/candidatos/perfil
 */
const guardarPerfilCandidato = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return errorRespuesta(res, 400, 'Errores de validación', errores.array());
    }

    const datosActualizar = { ...req.body };
    delete datosActualizar.usuario_id; // No permitir cambiar usuario_id

    // Buscar si ya existe un candidato para este usuario
    let candidato = await Candidato.findOne({ 
      where: { usuario_id: req.usuario.id } 
    });

    if (candidato) {
      // Actualizar
      await candidato.update(datosActualizar);
      return exitoRespuesta(res, 200, 'Perfil actualizado exitosamente', candidato);
    } else {
      // Crear
      const nuevoCandidato = await Candidato.create({
        usuario_id: req.usuario.id,
        ...datosActualizar
      });
      return exitoRespuesta(res, 201, 'Perfil creado exitosamente', nuevoCandidato);
    }

  } catch (error) {
    console.error('❌ Error al guardar perfil:', error);
    return errorRespuesta(res, 500, 'Error al guardar perfil', error.message);
  }
};

/**
 * Obtener perfil completo del candidato (con todas las relaciones)
 * GET /api/candidatos/:id/perfil-completo
 */
const obtenerPerfilCompleto = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    if (req.usuario.rol === 'CANDIDATO') {
      const candidatoUsuario = await Candidato.findOne({ where: { usuario_id: req.usuario.id } });
      if (!candidatoUsuario || candidatoUsuario.id !== parseInt(id)) {
        return errorRespuesta(res, 403, 'No tienes permisos para ver este perfil');
      }
    } else if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'EMPRESA') {
      return errorRespuesta(res, 403, 'No tienes permisos para ver perfiles de candidatos');
    }

    // Query optimizada con eager loading
    const perfil = await Candidato.findByPk(id, {
      include: [
        {
          model: Educacion,
          as: 'educacion',
          attributes: { exclude: ['candidato_id'] },
          required: false
        },
        {
          model: ExperienciaLaboral,
          as: 'experienciaLaboral',
          attributes: { exclude: ['candidato_id'] },
          required: false
        },
        {
          model: Habilidad,
          as: 'habilidades',
          attributes: { exclude: ['candidato_id'] },
          required: false
        },
        {
          model: Certificacion,
          as: 'certificaciones',
          attributes: { exclude: ['candidato_id'] },
          required: false
        },
        {
          model: Idioma,
          as: 'idiomas',
          attributes: { exclude: ['candidato_id'] },
          required: false
        },
        {
          model: Referencia,
          as: 'referencias',
          attributes: { exclude: ['candidato_id'] },
          required: false
        },
        {
          model: Documento,
          as: 'documentos',
          attributes: ['id', 'tipo_documento', 'nombre_archivo', 'tamano_bytes', 'hash_sha256', 'descripcion', 'createdAt'],
          required: false
        },
        {
          model: ContratoLaboral,
          as: 'contratos',
          attributes: { exclude: ['candidato_id'] },
          include: [
            {
              model: Empresa,
              as: 'empresa',
              attributes: ['id', 'nombre_comercial', 'razon_social']
            }
          ],
          required: false
        }
      ]
    });

    if (!perfil) {
      return errorRespuesta(res, 404, 'Candidato no encontrado');
    }

    // Calcular métricas adicionales
    const totalExperienciaMeses = perfil.experienciaLaboral ? perfil.experienciaLaboral.reduce((total, exp) => {
      const inicio = new Date(exp.fecha_inicio);
      const fin = exp.fecha_fin ? new Date(exp.fecha_fin) : new Date();
      const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
      return total + meses;
    }, 0) : 0;

    const certificacionesVigentes = perfil.certificaciones ? perfil.certificaciones.filter(cert => {
      if (!cert.fecha_vencimiento) return true;
      return new Date(cert.fecha_vencimiento) >= new Date();
    }).length : 0;

    const contratoActivo = perfil.contratos ? perfil.contratos.find(c => c.estado === 'ACTIVO') : null;

    return exitoRespuesta(
      res,
      200,
      'Perfil completo obtenido exitosamente',
      {
        datos_personales: {
          id: perfil.id,
          nombres: perfil.nombres,
          apellido_paterno: perfil.apellido_paterno,
          apellido_materno: perfil.apellido_materno,
          ci: perfil.ci,
          telefono: perfil.telefono,
          fecha_nacimiento: perfil.fecha_nacimiento,
          direccion: perfil.direccion,
          foto_perfil_url: perfil.foto_perfil_url,
          perfil_publico: perfil.perfil_publico
        },
        informacion_profesional: {
          profesion: perfil.profesion,
          nivel_educativo: perfil.nivel_educativo,
          anos_experiencia: Math.floor(totalExperienciaMeses / 12),
          meses_experiencia: totalExperienciaMeses % 12,
          total_experiencia_meses: totalExperienciaMeses,
          estado_laboral: perfil.estado_laboral,
          disponibilidad: perfil.disponibilidad,
          modalidad_preferida: perfil.modalidad_preferida
        },
        estado: {
          contrato_activo: contratoActivo ? true : false,
          empresa_actual: contratoActivo ? contratoActivo.empresa?.nombre_comercial : null,
          cargo_actual: contratoActivo ? contratoActivo.cargo : null
        },
        educacion: perfil.educacion || [],
        experiencia_laboral: perfil.experienciaLaboral || [],
        habilidades: perfil.habilidades || [],
        certificaciones: {
          total: perfil.certificaciones ? perfil.certificaciones.length : 0,
          vigentes: certificacionesVigentes,
          vencidas: perfil.certificaciones ? perfil.certificaciones.length - certificacionesVigentes : 0,
          lista: perfil.certificaciones || []
        },
        idiomas: perfil.idiomas || [],
        referencias: perfil.referencias || [],
        documentos: perfil.documentos || [],
        contratos: perfil.contratos || [],
        metricas: {
          total_educacion: perfil.educacion ? perfil.educacion.length : 0,
          total_experiencia: perfil.experienciaLaboral ? perfil.experienciaLaboral.length : 0,
          total_habilidades: perfil.habilidades ? perfil.habilidades.length : 0,
          total_certificaciones: perfil.certificaciones ? perfil.certificaciones.length : 0,
          total_idiomas: perfil.idiomas ? perfil.idiomas.length : 0,
          total_referencias: perfil.referencias ? perfil.referencias.length : 0,
          total_documentos: perfil.documentos ? perfil.documentos.length : 0,
          total_contratos: perfil.contratos ? perfil.contratos.length : 0,
          completitud_perfil: calcularCompletitudPerfil(perfil)
        }
      }
    );
  } catch (error) {
    console.error('❌ Error en obtenerPerfilCompleto:', error);
    return errorRespuesta(res, 500, 'Error al obtener perfil completo');
  }
};

/**
 * Función auxiliar para calcular completitud del perfil (%)
 */
function calcularCompletitudPerfil(perfil) {
  let puntos = 0;
  const maxPuntos = 15;

  // Datos personales básicos (5 puntos)
  if (perfil.nombres && perfil.apellido_paterno) puntos += 1;
  if (perfil.telefono) puntos += 1;
  if (perfil.direccion) puntos += 1;
  if (perfil.fecha_nacimiento) puntos += 1;
  if (perfil.foto_perfil_url) puntos += 1;

  // Información profesional (3 puntos)
  if (perfil.profesion) puntos += 1;
  if (perfil.nivel_educativo) puntos += 1;
  if (perfil.disponibilidad) puntos += 1;

  // Secciones completadas (7 puntos)
  if (perfil.educacion && perfil.educacion.length > 0) puntos += 1;
  if (perfil.experienciaLaboral && perfil.experienciaLaboral.length > 0) puntos += 1.5;
  if (perfil.habilidades && perfil.habilidades.length >= 3) puntos += 1;
  if (perfil.certificaciones && perfil.certificaciones.length > 0) puntos += 1;
  if (perfil.idiomas && perfil.idiomas.length > 0) puntos += 1;
  if (perfil.referencias && perfil.referencias.length > 0) puntos += 1;
  if (perfil.documentos && perfil.documentos.length > 0) puntos += 0.5;

  return Math.round((puntos / maxPuntos) * 100);
}

module.exports = {
  obtenerMiPerfil,
  obtenerCandidatos,
  obtenerCandidatoPorId,
  actualizarPerfil,
  guardarPerfilCandidato,
  obtenerPerfilCompleto
};