// file: backend/src/controllers/candidatoController.js
const { Candidato, Usuario } = require('../models');
const { exitoRespuesta, errorRespuesta } = require('../utils/responses');
const { validationResult } = require('express-validator');

/**
 * Obtener todos los candidatos (con paginación y filtros)
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
    if (req.usuario.rol !== 'superadmin' && req.usuario.rol !== 'admin_empresa') {
      where.perfil_publico = true;
    }

    const { count, rows } = await Candidato.findAndCountAll({
      where,
      limit: parseInt(limite),
      offset: parseInt(offset),
      order: [['completitud_perfil', 'DESC'], ['created_at', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'verificado', 'activo']
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
 */
const obtenerCandidatoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const candidato = await Candidato.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'verificado', 'activo']
        }
      ]
    });

    if (!candidato) {
      return errorRespuesta(res, 404, 'Candidato no encontrado.');
    }

    // Verificar si el perfil es público o si es el propio usuario
    if (!candidato.perfil_publico && 
        candidato.usuario_id !== req.usuario.id &&
        req.usuario.rol !== 'superadmin' &&
        req.usuario.rol !== 'admin_empresa') {
      return errorRespuesta(res, 403, 'Este perfil es privado.');
    }

    return exitoRespuesta(res, 200, 'Candidato obtenido', candidato);

  } catch (error) {
    console.error('❌ Error al obtener candidato:', error);
    return errorRespuesta(res, 500, 'Error al obtener candidato', error.message);
  }
};

/**
 * Crear o actualizar perfil de candidato
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
 * @desc    Obtener perfil completo del candidato (con todas las relaciones)
 * @route   GET /api/candidatos/:id/perfil-completo
 * @access  Private (CANDIDATO ve solo el suyo, ADMIN ve todos)
 */
exports.obtenerPerfilCompleto = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    if (req.user.rol === 'CANDIDATO') {
      const candidatoUsuario = await Candidato.findOne({ where: { usuario_id: req.user.id } });
      if (!candidatoUsuario || candidatoUsuario.id !== parseInt(id)) {
        return errorResponse(res, 'No tienes permisos para ver este perfil', 403);
      }
    } else if (req.user.rol !== 'ADMIN' && req.user.rol !== 'EMPRESA') {
      return errorResponse(res, 'No tienes permisos para ver perfiles de candidatos', 403);
    }

    // Query optimizada con eager loading (evita N+1)
    const perfil = await Candidato.findByPk(id, {
      include: [
        {
          model: Educacion,
          as: 'educacion',
          attributes: { exclude: ['candidato_id'] },
          order: [['fecha_inicio', 'DESC']]
        },
        {
          model: ExperienciaLaboral,
          as: 'experienciaLaboral',
          attributes: { exclude: ['candidato_id'] },
          order: [['fecha_inicio', 'DESC']]
        },
        {
          model: Habilidad,
          as: 'habilidades',
          attributes: { exclude: ['candidato_id'] }
        },
        {
          model: Certificacion,
          as: 'certificaciones',
          attributes: { exclude: ['candidato_id'] },
          order: [['fecha_emision', 'DESC']]
        },
        {
          model: Idioma,
          as: 'idiomas',
          attributes: { exclude: ['candidato_id'] }
        },
        {
          model: Referencia,
          as: 'referencias',
          attributes: { exclude: ['candidato_id'] }
        },
        {
          model: Documento,
          as: 'documentos',
          attributes: ['id', 'tipo_documento', 'nombre_archivo', 'tamano_bytes', 'hash_sha256', 'descripcion', 'created_at'],
          order: [['created_at', 'DESC']]
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
          order: [['fecha_inicio', 'DESC']]
        }
      ]
    });

    if (!perfil) {
      return errorResponse(res, 'Candidato no encontrado', 404);
    }

    // Calcular métricas adicionales
    const totalExperienciaMeses = perfil.experienciaLaboral.reduce((total, exp) => {
      const inicio = new Date(exp.fecha_inicio);
      const fin = exp.fecha_fin ? new Date(exp.fecha_fin) : new Date();
      const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
      return total + meses;
    }, 0);

    const certificacionesVigentes = perfil.certificaciones.filter(cert => {
      if (!cert.fecha_vencimiento) return true;
      return new Date(cert.fecha_vencimiento) >= new Date();
    }).length;

    const contratoActivo = perfil.contratos.find(c => c.estado === 'ACTIVO');

    return successResponse(
      res,
      {
        datos_personales: {
          id: perfil.id,
          nombre: perfil.nombre,
          apellido: perfil.apellido,
          email: perfil.email,
          telefono: perfil.telefono,
          fecha_nacimiento: perfil.fecha_nacimiento,
          genero: perfil.genero,
          estado_civil: perfil.estado_civil,
          nacionalidad: perfil.nacionalidad,
          direccion: perfil.direccion,
          ciudad: perfil.ciudad,
          departamento: perfil.departamento,
          pais: perfil.pais,
          codigo_postal: perfil.codigo_postal,
          foto_perfil: perfil.foto_perfil,
          linkedin_url: perfil.linkedin_url,
          github_url: perfil.github_url,
          portfolio_url: perfil.portfolio_url
        },
        informacion_profesional: {
          titulo_profesional: perfil.titulo_profesional,
          nivel_educativo: perfil.nivel_educativo,
          anos_experiencia: Math.floor(totalExperienciaMeses / 12),
          meses_experiencia: totalExperienciaMeses % 12,
          total_experiencia_meses: totalExperienciaMeses,
          area_especializacion: perfil.area_especializacion,
          industria_preferida: perfil.industria_preferida,
          disponibilidad: perfil.disponibilidad,
          modalidad_trabajo: perfil.modalidad_trabajo,
          salario_esperado_min: perfil.salario_esperado_min,
          salario_esperado_max: perfil.salario_esperado_max,
          moneda: perfil.moneda
        },
        estado: {
          disponible_trabajar: perfil.disponible_trabajar,
          busqueda_activa: perfil.busqueda_activa,
          contrato_activo: contratoActivo ? true : false,
          empresa_actual: contratoActivo ? contratoActivo.empresa.nombre_comercial : null,
          cargo_actual: contratoActivo ? contratoActivo.cargo : null
        },
        educacion: perfil.educacion,
        experiencia_laboral: perfil.experienciaLaboral,
        habilidades: perfil.habilidades,
        certificaciones: {
          total: perfil.certificaciones.length,
          vigentes: certificacionesVigentes,
          vencidas: perfil.certificaciones.length - certificacionesVigentes,
          lista: perfil.certificaciones
        },
        idiomas: perfil.idiomas,
        referencias: perfil.referencias,
        documentos: perfil.documentos,
        contratos: perfil.contratos,
        metricas: {
          total_educacion: perfil.educacion.length,
          total_experiencia: perfil.experienciaLaboral.length,
          total_habilidades: perfil.habilidades.length,
          total_certificaciones: perfil.certificaciones.length,
          total_idiomas: perfil.idiomas.length,
          total_referencias: perfil.referencias.length,
          total_documentos: perfil.documentos.length,
          total_contratos: perfil.contratos.length,
          completitud_perfil: calcularCompletitudPerfil(perfil)
        }
      },
      'Perfil completo obtenido exitosamente'
    );
  } catch (error) {
    console.error('Error en obtenerPerfilCompleto:', error);
    return errorResponse(res, 'Error al obtener perfil completo', 500);
  }
};

/**
 * Función auxiliar para calcular completitud del perfil (%)
 */
function calcularCompletitudPerfil(perfil) {
  let puntos = 0;
  const maxPuntos = 15;

  // Datos personales básicos (5 puntos)
  if (perfil.nombre && perfil.apellido && perfil.email) puntos += 1;
  if (perfil.telefono) puntos += 1;
  if (perfil.direccion && perfil.ciudad) puntos += 1;
  if (perfil.fecha_nacimiento) puntos += 1;
  if (perfil.foto_perfil) puntos += 1;

  // Información profesional (3 puntos)
  if (perfil.titulo_profesional) puntos += 1;
  if (perfil.area_especializacion) puntos += 1;
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
  obtenerCandidatos,
  obtenerCandidatoPorId,
  guardarPerfilCandidato
};