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

module.exports = {
  getCandidatosStats,
  getEmpresasStats,
  getContratosStats
};