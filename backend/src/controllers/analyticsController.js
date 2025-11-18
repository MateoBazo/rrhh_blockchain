// file: backend/src/controllers/analyticsController.js
const { 
  Candidato, 
  Usuario, 
  Empresa, 
  ContratoLaboral, 
  Educacion, 
  ExperienciaLaboral 
} = require('../models');
const { exitoRespuesta, errorRespuesta } = require('../utils/responses');
const { Op } = require('sequelize');

/**
 * TIMEOUT WRAPPER: Envuelve queries pesadas con timeout
 */
const queryConTimeout = async (promesa, timeoutMs = 10000) => {
  return Promise.race([
    promesa,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout excedido')), timeoutMs)
    )
  ]);
};

/**
 * GET /api/analytics/candidatos-stats
 * Estadísticas agregadas de candidatos (solo ADMIN)
 */
const getCandidatosStats = async (req, res) => {
  try {
    // TIMEOUT 10s para prevenir crashes
    const stats = await queryConTimeout(
      Promise.all([
        // Total candidatos activos
        Candidato.count({
          where: { perfil_publico: true },
          limit: 1000 // LIMIT para prevenir queries sin límite
        }),

        // Distribución por estado laboral
        Candidato.findAll({
          attributes: [
            'estado_laboral',
            [Candidato.sequelize.fn('COUNT', Candidato.sequelize.col('id')), 'total']
          ],
          where: { perfil_publico: true },
          group: ['estado_laboral'],
          limit: 10,
          raw: true // Evita overhead de instancias Sequelize
        }),

        // Distribución por nivel educativo
        Candidato.findAll({
          attributes: [
            'nivel_educativo',
            [Candidato.sequelize.fn('COUNT', Candidato.sequelize.col('id')), 'total']
          ],
          where: { perfil_publico: true },
          group: ['nivel_educativo'],
          limit: 10,
          raw: true
        }),

        // Promedio años experiencia
        Candidato.findOne({
          attributes: [
            [Candidato.sequelize.fn('AVG', Candidato.sequelize.col('anios_experiencia')), 'promedio'],
            [Candidato.sequelize.fn('MAX', Candidato.sequelize.col('anios_experiencia')), 'maximo'],
            [Candidato.sequelize.fn('MIN', Candidato.sequelize.col('anios_experiencia')), 'minimo']
          ],
          where: { 
            perfil_publico: true,
            anios_experiencia: { [Op.not]: null }
          },
          raw: true
        }),

        // Distribución geográfica (top 10 ciudades)
        Candidato.findAll({
          attributes: [
            'ciudad',
            'departamento',
            [Candidato.sequelize.fn('COUNT', Candidato.sequelize.col('id')), 'total']
          ],
          where: { 
            perfil_publico: true,
            ciudad: { [Op.not]: null }
          },
          group: ['ciudad', 'departamento'],
          order: [[Candidato.sequelize.literal('total'), 'DESC']],
          limit: 10,
          raw: true
        }),

        // Promedio completitud perfil
        Candidato.findOne({
          attributes: [
            [Candidato.sequelize.fn('AVG', Candidato.sequelize.col('completitud_perfil')), 'promedio_completitud']
          ],
          where: { perfil_publico: true },
          raw: true
        })
      ]),
      10000 // Timeout 10s
    );

    // Destructurar resultados
    const [
      totalCandidatos,
      porEstadoLaboral,
      porNivelEducativo,
      experienciaStats,
      distribucionGeografica,
      completitudStats
    ] = stats;

    return exitoRespuesta(res, 200, 'Estadísticas de candidatos obtenidas', {
      total_candidatos: totalCandidatos || 0,
      distribucion_estado_laboral: porEstadoLaboral || [],
      distribucion_nivel_educativo: porNivelEducativo || [],
      experiencia: {
        promedio: Math.round(parseFloat(experienciaStats?.promedio || 0) * 10) / 10,
        maximo: experienciaStats?.maximo || 0,
        minimo: experienciaStats?.minimo || 0
      },
      top_ciudades: distribucionGeografica || [],
      promedio_completitud_perfil: Math.round(parseFloat(completitudStats?.promedio_completitud || 0))
    });

  } catch (error) {
    console.error('❌ Error en getCandidatosStats:', error);
    
    // Manejo específico de timeout
    if (error.message.includes('timeout')) {
      return errorRespuesta(res, 504, 'Timeout en query de analytics. Intente más tarde.');
    }
    
    return errorRespuesta(res, 500, 'Error al obtener estadísticas de candidatos', error.message);
  }
};

/**
 * GET /api/analytics/empresas-stats
 * Estadísticas agregadas de empresas (solo ADMIN)
 */
const getEmpresasStats = async (req, res) => {
  try {
    const stats = await queryConTimeout(
      Promise.all([
        // Total empresas
        Empresa.count({
          limit: 1000
        }),

        // Empresas verificadas vs no verificadas
        Empresa.findAll({
          attributes: [
            'verificada',
            [Empresa.sequelize.fn('COUNT', Empresa.sequelize.col('id')), 'total']
          ],
          group: ['verificada'],
          limit: 2,
          raw: true
        }),

        // Distribución por sector
        Empresa.findAll({
          attributes: [
            'sector',
            [Empresa.sequelize.fn('COUNT', Empresa.sequelize.col('id')), 'total']
          ],
          where: { sector: { [Op.not]: null } },
          group: ['sector'],
          order: [[Empresa.sequelize.literal('total'), 'DESC']],
          limit: 10,
          raw: true
        }),

        // Distribución por tamaño
        Empresa.findAll({
          attributes: [
            'tamanio',
            [Empresa.sequelize.fn('COUNT', Empresa.sequelize.col('id')), 'total']
          ],
          where: { tamanio: { [Op.not]: null } },
          group: ['tamanio'],
          limit: 10,
          raw: true
        }),

        // Top 10 ciudades con más empresas
        Empresa.findAll({
          attributes: [
            'ciudad',
            'departamento',
            [Empresa.sequelize.fn('COUNT', Empresa.sequelize.col('id')), 'total']
          ],
          where: { ciudad: { [Op.not]: null } },
          group: ['ciudad', 'departamento'],
          order: [[Empresa.sequelize.literal('total'), 'DESC']],
          limit: 10,
          raw: true
        })
      ]),
      10000
    );

    const [
      totalEmpresas,
      porVerificacion,
      porSector,
      porTamanio,
      topCiudades
    ] = stats;

    return exitoRespuesta(res, 200, 'Estadísticas de empresas obtenidas', {
      total_empresas: totalEmpresas || 0,
      por_verificacion: porVerificacion || [],
      distribucion_sector: porSector || [],
      distribucion_tamanio: porTamanio || [],
      top_ciudades: topCiudades || []
    });

  } catch (error) {
    console.error('❌ Error en getEmpresasStats:', error);
    
    if (error.message.includes('timeout')) {
      return errorRespuesta(res, 504, 'Timeout en query de analytics. Intente más tarde.');
    }
    
    return errorRespuesta(res, 500, 'Error al obtener estadísticas de empresas', error.message);
  }
};

/**
 * GET /api/analytics/contratos-stats
 * Estadísticas de contratos laborales (solo ADMIN)
 */
const getContratosStats = async (req, res) => {
  try {
    const stats = await queryConTimeout(
      Promise.all([
        // Total contratos
        ContratoLaboral.count({
          limit: 1000
        }),

        // Distribución por estado
        ContratoLaboral.findAll({
          attributes: [
            'estado',
            [ContratoLaboral.sequelize.fn('COUNT', ContratoLaboral.sequelize.col('id')), 'total']
          ],
          group: ['estado'],
          limit: 10,
          raw: true
        }),

        // Distribución por tipo
        ContratoLaboral.findAll({
          attributes: [
            'tipo_contrato',
            [ContratoLaboral.sequelize.fn('COUNT', ContratoLaboral.sequelize.col('id')), 'total']
          ],
          where: { tipo_contrato: { [Op.not]: null } },
          group: ['tipo_contrato'],
          limit: 10,
          raw: true
        }),

        // Promedio salario (solo contratos activos)
        ContratoLaboral.findOne({
          attributes: [
            [ContratoLaboral.sequelize.fn('AVG', ContratoLaboral.sequelize.col('salario')), 'promedio'],
            [ContratoLaboral.sequelize.fn('MAX', ContratoLaboral.sequelize.col('salario')), 'maximo'],
            [ContratoLaboral.sequelize.fn('MIN', ContratoLaboral.sequelize.col('salario')), 'minimo']
          ],
          where: { 
            estado: 'ACTIVO',
            salario: { [Op.not]: null }
          },
          raw: true
        }),

        // Contratos creados por mes (últimos 6 meses)
        ContratoLaboral.findAll({
          attributes: [
            [ContratoLaboral.sequelize.fn('DATE_FORMAT', ContratoLaboral.sequelize.col('created_at'), '%Y-%m'), 'mes'],
            [ContratoLaboral.sequelize.fn('COUNT', ContratoLaboral.sequelize.col('id')), 'total']
          ],
          where: {
            created_at: {
              [Op.gte]: Candidato.sequelize.literal('DATE_SUB(NOW(), INTERVAL 6 MONTH)')
            }
          },
          group: [Candidato.sequelize.fn('DATE_FORMAT', Candidato.sequelize.col('created_at'), '%Y-%m')],
          order: [[Candidato.sequelize.literal('mes'), 'DESC']],
          limit: 6,
          raw: true
        })
      ]),
      10000
    );

    const [
      totalContratos,
      porEstado,
      porTipo,
      salarioStats,
      contratosPorMes
    ] = stats;

    return exitoRespuesta(res, 200, 'Estadísticas de contratos obtenidas', {
      total_contratos: totalContratos || 0,
      distribucion_estado: porEstado || [],
      distribucion_tipo: porTipo || [],
      salarios: {
        promedio: Math.round(parseFloat(salarioStats?.promedio || 0)),
        maximo: salarioStats?.maximo || 0,
        minimo: salarioStats?.minimo || 0
      },
      contratos_ultimos_meses: contratosPorMes || []
    });

  } catch (error) {
    console.error('❌ Error en getContratosStats:', error);
    
    if (error.message.includes('timeout')) {
      return errorRespuesta(res, 504, 'Timeout en query de analytics. Intente más tarde.');
    }
    
    return errorRespuesta(res, 500, 'Error al obtener estadísticas de contratos', error.message);
  }
};
/**
 * 1. ESTADÍSTICAS GENERALES EMPRESA
 * GET /api/analytics/empresa/general
 * Rol: EMPRESA
 */
const estadisticasGeneralesEmpresa = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // 1. Buscar empresa
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa) {
      return errorRespuesta(res, 404, 'Empresa no encontrada');
    }

    const { Vacante, Postulacion } = require('../models');

    // 2. Obtener vacantes de la empresa
    const vacantes = await Vacante.findAll({
      where: { empresa_id: empresa.id },
      attributes: ['id']
    });

    const vacanteIds = vacantes.map(v => v.id);

    if (vacanteIds.length === 0) {
      return exitoRespuesta(res, 200, 'Estadísticas obtenidas', {
        total_postulaciones: 0,
        por_estado: {},
        score_promedio: 0,
        tasa_conversion: 0,
        vacantes_activas: 0
      });
    }

    // 3. Total postulaciones
    const totalPostulaciones = await Postulacion.count({
      where: { vacante_id: vacanteIds }
    });

    // 4. Postulaciones por estado
    const porEstado = await Postulacion.findAll({
      where: { vacante_id: vacanteIds },
      attributes: [
        'estado',
        [Postulacion.sequelize.fn('COUNT', Postulacion.sequelize.col('id')), 'count']
      ],
      group: ['estado'],
      raw: true
    });

    const estadoCounts = {};
    porEstado.forEach(item => {
      estadoCounts[item.estado] = parseInt(item.count);
    });

    // 5. Score promedio
    const scorePromedio = await Postulacion.findOne({
      where: { vacante_id: vacanteIds },
      attributes: [[Postulacion.sequelize.fn('AVG', Postulacion.sequelize.col('score_compatibilidad')), 'promedio']],
      raw: true
    });

    // 6. Tasa conversión (total contratados / total postulaciones)
    const totalContratados = estadoCounts['contratado'] || 0;
    const tasaConversion = totalPostulaciones > 0 
      ? ((totalContratados / totalPostulaciones) * 100).toFixed(2)
      : 0;

    console.log(`📊 Estadísticas generales empresa ${empresa.id}`);

    return exitoRespuesta(res, 200, 'Estadísticas obtenidas', {
      total_postulaciones: totalPostulaciones,
      por_estado: estadoCounts,
      score_promedio: parseFloat(scorePromedio?.promedio || 0).toFixed(2),
      tasa_conversion: parseFloat(tasaConversion),
      vacantes_activas: vacantes.length
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas generales empresa:', error);
    return errorRespuesta(res, 500, 'Error al obtener estadísticas', error.message);
  }
};

/**
 * 2. MÉTRICAS POR VACANTE ESPECÍFICA
 * GET /api/analytics/empresa/vacante/:vacante_id
 * Rol: EMPRESA
 */
const metricasVacanteEmpresa = async (req, res) => {
  try {
    const { vacante_id } = req.params;
    const usuarioId = req.usuario.id;

    const { Vacante, Postulacion, Candidato } = require('../models');

    // 1. Verificar vacante y permisos
    const vacante = await Vacante.findByPk(vacante_id);
    if (!vacante) {
      return errorRespuesta(res, 404, 'Vacante no encontrada');
    }

    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa || vacante.empresa_id !== empresa.id) {
      return errorRespuesta(res, 403, 'No tienes permiso para ver estas métricas');
    }

    // 2. Total postulaciones vacante
    const totalPostulaciones = await Postulacion.count({
      where: { vacante_id: vacante_id }
    });

    // 3. Distribución scores por rangos
    const distribucionScores = await Postulacion.findAll({
      where: { vacante_id: vacante_id },
      attributes: [
        [
          Postulacion.sequelize.literal(`CASE 
            WHEN score_compatibilidad >= 90 THEN '90-100'
            WHEN score_compatibilidad >= 80 THEN '80-89'
            WHEN score_compatibilidad >= 70 THEN '70-79'
            WHEN score_compatibilidad >= 60 THEN '60-69'
            ELSE '0-59'
          END`),
          'rango'
        ],
        [Postulacion.sequelize.fn('COUNT', Postulacion.sequelize.col('id')), 'count']
      ],
      group: [Postulacion.sequelize.literal('rango')],
      raw: true
    });

    // 4. Timeline postulaciones (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const timeline = await Postulacion.findAll({
      where: {
        vacante_id: vacante_id,
        fecha_postulacion: { [Op.gte]: hace30Dias }
      },
      attributes: [
        [Postulacion.sequelize.fn('DATE', Postulacion.sequelize.col('fecha_postulacion')), 'fecha'],
        [Postulacion.sequelize.fn('COUNT', Postulacion.sequelize.col('id')), 'count']
      ],
      group: [Postulacion.sequelize.fn('DATE', Postulacion.sequelize.col('fecha_postulacion'))],
      order: [[Postulacion.sequelize.fn('DATE', Postulacion.sequelize.col('fecha_postulacion')), 'ASC']],
      raw: true
    });

    // 5. Top 5 candidatos mejor score
    const topCandidatos = await Postulacion.findAll({
      where: { vacante_id: vacante_id },
      include: [{
        model: Candidato,
        as: 'candidato',
        attributes: ['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'foto_perfil_url']
      }],
      order: [['score_compatibilidad', 'DESC']],
      limit: 5
    });

    console.log(`📊 Métricas vacante ${vacante_id}`);

    return exitoRespuesta(res, 200, 'Métricas obtenidas', {
      vacante: {
        id: vacante.id,
        titulo: vacante.titulo,
        estado: vacante.estado
      },
      total_postulaciones: totalPostulaciones,
      distribucion_scores: distribucionScores,
      timeline_30_dias: timeline,
      top_candidatos: topCandidatos.map(p => ({
        postulacion_id: p.id,
        candidato: {
          id: p.candidato.id,
          nombre_completo: `${p.candidato.nombres} ${p.candidato.apellido_paterno} ${p.candidato.apellido_materno || ''}`.trim(),
          foto_perfil: p.candidato.foto_perfil_url
        },
        score: p.score_compatibilidad,
        estado: p.estado,
        fecha_postulacion: p.fecha_postulacion
      }))
    });

  } catch (error) {
    console.error('❌ Error al obtener métricas vacante:', error);
    return errorRespuesta(res, 500, 'Error al obtener métricas', error.message);
  }
};

/**
 * 3. FUNNEL CONVERSIÓN
 * GET /api/analytics/empresa/funnel
 * Rol: EMPRESA
 */
const funnelConversionEmpresa = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { vacante_id } = req.query;

    const { Vacante, Postulacion } = require('../models');

    // 1. Buscar empresa
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa) {
      return errorRespuesta(res, 404, 'Empresa no encontrada');
    }

    // 2. Construir filtro
    let whereConditions = {};
    
    if (vacante_id) {
      const vacante = await Vacante.findByPk(vacante_id);
      if (!vacante || vacante.empresa_id !== empresa.id) {
        return errorRespuesta(res, 403, 'No tienes permiso para ver esta vacante');
      }
      whereConditions.vacante_id = vacante_id;
    } else {
      const vacantes = await Vacante.findAll({
        where: { empresa_id: empresa.id },
        attributes: ['id']
      });
      whereConditions.vacante_id = vacantes.map(v => v.id);
    }

    // 3. Counts por estado
    const estadisticas = await Postulacion.findAll({
      where: whereConditions,
      attributes: [
        'estado',
        [Postulacion.sequelize.fn('COUNT', Postulacion.sequelize.col('id')), 'count']
      ],
      group: ['estado'],
      raw: true
    });

    // 4. Construir funnel ordenado
    const estadosOrden = [
      'postulado',
      'revisado',
      'preseleccionado',
      'entrevista',
      'contratado',
      'rechazado',
      'retirado'
    ];

    const funnel = {};
    estadosOrden.forEach(estado => {
      const stat = estadisticas.find(s => s.estado === estado);
      funnel[estado] = stat ? parseInt(stat.count) : 0;
    });

    // 5. Calcular tasas conversión
    const total = funnel.postulado + funnel.revisado + funnel.preseleccionado + 
                  funnel.entrevista + funnel.contratado;

    const calcularPorcentaje = (parte, total) => {
      if (!total || total === 0) return 0;
      return parseFloat(((parte / total) * 100).toFixed(2));
    };

    const tasas = {
      postulado_a_revisado: calcularPorcentaje(funnel.revisado, funnel.postulado),
      revisado_a_preseleccionado: calcularPorcentaje(funnel.preseleccionado, funnel.revisado),
      preseleccionado_a_entrevista: calcularPorcentaje(funnel.entrevista, funnel.preseleccionado),
      entrevista_a_contratado: calcularPorcentaje(funnel.contratado, funnel.entrevista),
      global_conversion: calcularPorcentaje(funnel.contratado, total)
    };

    console.log(`📊 Funnel conversión empresa ${empresa.id}`);

    return exitoRespuesta(res, 200, 'Funnel obtenido', {
      funnel,
      tasas_conversion: tasas,
      total_procesadas: total
    });

  } catch (error) {
    console.error('❌ Error al obtener funnel:', error);
    return errorRespuesta(res, 500, 'Error al obtener funnel', error.message);
  }
};

/**
 * 4. TENDENCIAS TEMPORALES
 * GET /api/analytics/empresa/tendencias
 * Rol: EMPRESA
 */
const tendenciasTemporalesEmpresa = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { periodo = 'mes', vacante_id } = req.query;

    const { Vacante, Postulacion } = require('../models');

    // 1. Buscar empresa
    const empresa = await Empresa.findOne({ where: { usuario_id: usuarioId } });
    if (!empresa) {
      return errorRespuesta(res, 404, 'Empresa no encontrada');
    }

    // 2. Construir filtro vacantes
    let vacanteIds = [];
    if (vacante_id) {
      const vacante = await Vacante.findByPk(vacante_id);
      if (!vacante || vacante.empresa_id !== empresa.id) {
        return errorRespuesta(res, 403, 'No tienes permiso');
      }
      vacanteIds = [vacante_id];
    } else {
      const vacantes = await Vacante.findAll({
        where: { empresa_id: empresa.id },
        attributes: ['id']
      });
      vacanteIds = vacantes.map(v => v.id);
    }

    // 3. Calcular rango fechas según periodo
    const ahora = new Date();
    let fechaInicio = new Date();
    let formatoFecha = '';

    switch (periodo) {
      case 'dia':
        fechaInicio.setDate(ahora.getDate() - 30);
        formatoFecha = '%Y-%m-%d';
        break;
      case 'semana':
        fechaInicio.setDate(ahora.getDate() - 90);
        formatoFecha = '%Y-%u';
        break;
      case 'mes':
        fechaInicio.setMonth(ahora.getMonth() - 12);
        formatoFecha = '%Y-%m';
        break;
      default:
        formatoFecha = '%Y-%m';
    }

    // 4. Query tendencias
    const tendencias = await Postulacion.findAll({
      where: {
        vacante_id: vacanteIds,
        fecha_postulacion: { [Op.gte]: fechaInicio }
      },
      attributes: [
        [Postulacion.sequelize.fn('DATE_FORMAT', Postulacion.sequelize.col('fecha_postulacion'), formatoFecha), 'periodo'],
        [Postulacion.sequelize.fn('COUNT', Postulacion.sequelize.col('id')), 'total'],
        [Postulacion.sequelize.fn('AVG', Postulacion.sequelize.col('score_compatibilidad')), 'score_promedio']
      ],
      group: [Postulacion.sequelize.fn('DATE_FORMAT', Postulacion.sequelize.col('fecha_postulacion'), formatoFecha)],
      order: [[Postulacion.sequelize.fn('DATE_FORMAT', Postulacion.sequelize.col('fecha_postulacion'), formatoFecha), 'ASC']],
      raw: true
    });

    console.log(`📊 Tendencias ${periodo} empresa ${empresa.id}`);

    return exitoRespuesta(res, 200, 'Tendencias obtenidas', {
      periodo,
      tendencias: tendencias.map(t => ({
        periodo: t.periodo,
        total_postulaciones: parseInt(t.total),
        score_promedio: parseFloat(t.score_promedio || 0).toFixed(2)
      }))
    });

  } catch (error) {
    console.error('❌ Error al obtener tendencias:', error);
    return errorRespuesta(res, 500, 'Error al obtener tendencias', error.message);
  }
};
module.exports = {
  getCandidatosStats,
  getEmpresasStats,
  getContratosStats,
  estadisticasGeneralesEmpresa,
  metricasVacanteEmpresa,
  funnelConversionEmpresa,
  tendenciasTemporalesEmpresa
};