// file: backend/src/controllers/analyticsController.js
const { Candidato, Empresa, ContratoLaboral, Habilidad, Educacion, ExperienciaLaboral } = require('../models');
const { successResponse, errorResponse } = require('../utils/responses');
const { Op, fn, col, literal } = require('sequelize');

/**
 * @desc    Estadísticas de candidatos
 * @route   GET /api/analytics/candidatos-stats
 * @access  Private (ADMIN)
 */
exports.estadisticasCandidatos = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return errorResponse(res, 'Solo administradores pueden ver analytics', 403);
    }

    // 1. Total de candidatos
    const totalCandidatos = await Candidato.count();

    // 2. Candidatos por nivel educativo
    const porNivelEducativo = await Candidato.findAll({
      attributes: [
        'nivel_educativo',
        [fn('COUNT', col('id')), 'total']
      ],
      group: ['nivel_educativo'],
      raw: true
    });

    // 3. Candidatos por estado laboral
    const disponibles = await Candidato.count({ where: { disponible_trabajar: true } });
    const busquedaActiva = await Candidato.count({ where: { busqueda_activa: true } });
    const conContrato = await ContratoLaboral.count({ where: { estado: 'ACTIVO' }, distinct: true, col: 'candidato_id' });

    // 4. Skills más demandadas (TOP 10)
    const skillsTop = await Habilidad.findAll({
      attributes: [
        'nombre_habilidad',
        [fn('COUNT', col('id')), 'total_candidatos']
      ],
      group: ['nombre_habilidad'],
      order: [[literal('total_candidatos'), 'DESC']],
      limit: 10,
      raw: true
    });

    // 5. Distribución geográfica
    const porPais = await Candidato.findAll({
      attributes: [
        'pais',
        [fn('COUNT', col('id')), 'total']
      ],
      where: { pais: { [Op.ne]: null } },
      group: ['pais'],
      order: [[literal('total'), 'DESC']],
      raw: true
    });

    const porDepartamento = await Candidato.findAll({
      attributes: [
        'departamento',
        [fn('COUNT', col('id')), 'total']
      ],
      where: { departamento: { [Op.ne]: null } },
      group: ['departamento'],
      order: [[literal('total'), 'DESC']],
      limit: 10,
      raw: true
    });

    const porCiudad = await Candidato.findAll({
      attributes: [
        'ciudad',
        [fn('COUNT', col('id')), 'total']
      ],
      where: { ciudad: { [Op.ne]: null } },
      group: ['ciudad'],
      order: [[literal('total'), 'DESC']],
      limit: 10,
      raw: true
    });

    // 6. Promedio de años de experiencia
    const candidatosConExperiencia = await Candidato.findAll({
      attributes: ['id'],
      include: [
        {
          model: ExperienciaLaboral,
          as: 'experienciaLaboral',
          attributes: ['fecha_inicio', 'fecha_fin']
        }
      ]
    });

    let totalMesesExperiencia = 0;
    let candidatosContados = 0;

    candidatosConExperiencia.forEach(candidato => {
      if (candidato.experienciaLaboral && candidato.experienciaLaboral.length > 0) {
        const meses = candidato.experienciaLaboral.reduce((total, exp) => {
          const inicio = new Date(exp.fecha_inicio);
          const fin = exp.fecha_fin ? new Date(exp.fecha_fin) : new Date();
          const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
          return total + Math.max(0, meses);
        }, 0);
        
        totalMesesExperiencia += meses;
        candidatosContados++;
      }
    });

    const promedioAnosExperiencia = candidatosContados > 0
      ? (totalMesesExperiencia / candidatosContados / 12).toFixed(1)
      : 0;

    // 7. Candidatos por modalidad de trabajo preferida
    const porModalidad = await Candidato.findAll({
      attributes: [
        'modalidad_trabajo',
        [fn('COUNT', col('id')), 'total']
      ],
      where: { modalidad_trabajo: { [Op.ne]: null } },
      group: ['modalidad_trabajo'],
      raw: true
    });

    return successResponse(
      res,
      {
        resumen: {
          total_candidatos: totalCandidatos,
          disponibles_trabajar: disponibles,
          busqueda_activa: busquedaActiva,
          con_contrato_activo: conContrato,
          promedio_anos_experiencia: parseFloat(promedioAnosExperiencia)
        },
        nivel_educativo: porNivelEducativo,
        estado_laboral: {
          disponibles,
          busqueda_activa: busquedaActiva,
          con_contrato: conContrato,
          no_disponibles: totalCandidatos - disponibles
        },
        skills_top_10: skillsTop,
        distribucion_geografica: {
          por_pais: porPais,
          por_departamento: porDepartamento,
          por_ciudad: porCiudad
        },
        modalidad_trabajo: porModalidad
      },
      'Estadísticas de candidatos obtenidas exitosamente'
    );
  } catch (error) {
    console.error('Error en estadisticasCandidatos:', error);
    return errorResponse(res, 'Error al obtener estadísticas de candidatos', 500);
  }
};

/**
 * @desc    Estadísticas de empresas
 * @route   GET /api/analytics/empresas-stats
 * @access  Private (ADMIN)
 */
exports.estadisticasEmpresas = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return errorResponse(res, 'Solo administradores pueden ver analytics', 403);
    }

    // 1. Total de empresas
    const totalEmpresas = await Empresa.count();

    // 2. Empresas verificadas vs no verificadas
    const verificadas = await Empresa.count({ where: { verificada: true } });
    const noVerificadas = totalEmpresas - verificadas;

    // 3. Empresas por sector
    const porSector = await Empresa.findAll({
      attributes: [
        'sector',
        [fn('COUNT', col('id')), 'total']
      ],
      where: { sector: { [Op.ne]: null } },
      group: ['sector'],
      order: [[literal('total'), 'DESC']],
      raw: true
    });

    // 4. Empresas por tamaño
    const porTamano = await Empresa.findAll({
      attributes: [
        'tamano_empresa',
        [fn('COUNT', col('id')), 'total']
      ],
      where: { tamano_empresa: { [Op.ne]: null } },
      group: ['tamano_empresa'],
      order: [[literal('total'), 'DESC']],
      raw: true
    });

    // 5. Empresas con más contratos activos
    const empresasConMasContratos = await Empresa.findAll({
      attributes: [
        'id',
        'nombre_comercial',
        'razon_social',
        'sector',
        [fn('COUNT', col('contratos.id')), 'total_contratos_activos']
      ],
      include: [
        {
          model: ContratoLaboral,
          as: 'contratos',
          attributes: [],
          where: { estado: 'ACTIVO' },
          required: true
        }
      ],
      group: ['Empresa.id'],
      order: [[literal('total_contratos_activos'), 'DESC']],
      limit: 10,
      raw: true
    });

    // 6. Distribución geográfica de empresas
    const porPais = await Empresa.findAll({
      attributes: [
        'pais',
        [fn('COUNT', col('id')), 'total']
      ],
      where: { pais: { [Op.ne]: null } },
      group: ['pais'],
      order: [[literal('total'), 'DESC']],
      raw: true
    });

    return successResponse(
      res,
      {
        resumen: {
          total_empresas: totalEmpresas,
          verificadas,
          no_verificadas: noVerificadas,
          porcentaje_verificadas: ((verificadas / totalEmpresas) * 100).toFixed(1)
        },
        por_sector: porSector,
        por_tamano: porTamano,
        top_10_con_mas_contratos: empresasConMasContratos,
        distribucion_geografica: porPais
      },
      'Estadísticas de empresas obtenidas exitosamente'
    );
  } catch (error) {
    console.error('Error en estadisticasEmpresas:', error);
    return errorResponse(res, 'Error al obtener estadísticas de empresas', 500);
  }
};

/**
 * @desc    Estadísticas de contratos laborales
 * @route   GET /api/analytics/contratos-stats
 * @access  Private (ADMIN)
 */
exports.estadisticasContratos = async (req, res) => {
  try {
    if (req.user.rol !== 'ADMIN') {
      return errorResponse(res, 'Solo administradores pueden ver analytics', 403);
    }

    // 1. Total de contratos y por estado
    const totalContratos = await ContratoLaboral.count();
    const activos = await ContratoLaboral.count({ where: { estado: 'ACTIVO' } });
    const finalizados = await ContratoLaboral.count({ where: { estado: 'FINALIZADO' } });
    const suspendidos = await ContratoLaboral.count({ where: { estado: 'SUSPENDIDO' } });
    const borradores = await ContratoLaboral.count({ where: { estado: 'BORRADOR' } });

    // 2. Contratos por tipo
    const porTipo = await ContratoLaboral.findAll({
      attributes: [
        'tipo_contrato',
        [fn('COUNT', col('id')), 'total']
      ],
      group: ['tipo_contrato'],
      order: [[literal('total'), 'DESC']],
      raw: true
    });

    // 3. Promedio de salarios por tipo de contrato
    const promedioSalarioPorTipo = await ContratoLaboral.findAll({
      attributes: [
        'tipo_contrato',
        [fn('AVG', col('salario_mensual')), 'salario_promedio'],
        [fn('MIN', col('salario_mensual')), 'salario_minimo'],
        [fn('MAX', col('salario_mensual')), 'salario_maximo'],
        [fn('COUNT', col('id')), 'total_contratos']
      ],
      where: { salario_mensual:{ [Op.ne]: null } },
      group: ['tipo_contrato'],
      order: [[literal('salario_promedio'), 'DESC']],
      raw: true
    });

    // 4. Promedio de salarios por cargo (TOP 10)
    const promedioSalarioPorCargo = await ContratoLaboral.findAll({
      attributes: [
        'cargo',
        [fn('AVG', col('salario_mensual')), 'salario_promedio'],
        [fn('COUNT', col('id')), 'total_contratos']
      ],
      where: {
        salario_mensual: { [Op.ne]: null },
        cargo: { [Op.ne]: null }
      },
      group: ['cargo'],
      order: [[literal('salario_promedio'), 'DESC']],
      limit: 10,
      raw: true
    });

    // 5. Contratos por jornada laboral
    const porJornada = await ContratoLaboral.findAll({
      attributes: [
        'jornada_laboral',
        [fn('COUNT', col('id')), 'total']
      ],
      where: { jornada_laboral: { [Op.ne]: null } },
      group: ['jornada_laboral'],
      raw: true
    });

    // 6. Duración promedio de contratos finalizados (en meses)
    const contratosFinalizados = await ContratoLaboral.findAll({
      where: {
        estado: 'FINALIZADO',
        fecha_inicio: { [Op.ne]: null },
        fecha_fin: { [Op.ne]: null }
      },
      attributes: ['fecha_inicio', 'fecha_fin'],
      raw: true
    });

    let duracionTotalMeses = 0;
    contratosFinalizados.forEach(contrato => {
      const inicio = new Date(contrato.fecha_inicio);
      const fin = new Date(contrato.fecha_fin);
      const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
      duracionTotalMeses += Math.max(0, meses);
    });

    const duracionPromedio = contratosFinalizados.length > 0
      ? (duracionTotalMeses / contratosFinalizados.length).toFixed(1)
      : 0;

    // 7. Distribución de monedas
    const porMoneda = await ContratoLaboral.findAll({
      attributes: [
        'moneda',
        [fn('COUNT', col('id')), 'total']
      ],
      where: { moneda: { [Op.ne]: null } },
      group: ['moneda'],
      raw: true
    });

    // 8. Sectores con mejores salarios (cruzando con empresas)
    const salariosPorSector = await ContratoLaboral.findAll({
      attributes: [
        [col('empresa.sector'), 'sector'],
        [fn('AVG', col('ContratoLaboral.salario_mensual')), 'salario_promedio'],
        [fn('COUNT', col('ContratoLaboral.id')), 'total_contratos']
      ],
      include: [
        {
          model: Empresa,
          as: 'empresa',
          attributes: [],
          where: { sector: { [Op.ne]: null } }
        }
      ],
      where: { salario_mensual: { [Op.ne]: null } },
      group: ['empresa.sector'],
      order: [[literal('salario_promedio'), 'DESC']],
      raw: true
    });

    return successResponse(
      res,
      {
        resumen: {
          total_contratos: totalContratos,
          activos,
          finalizados,
          suspendidos,
          borradores,
          duracion_promedio_meses: parseFloat(duracionPromedio)
        },
        por_tipo: porTipo,
        por_estado: {
          activos,
          finalizados,
          suspendidos,
          borradores
        },
        por_jornada: porJornada,
        por_moneda: porMoneda,
        salarios: {
          por_tipo_contrato: promedioSalarioPorTipo.map(item => ({
            tipo_contrato: item.tipo_contrato,
            salario_promedio: parseFloat(item.salario_promedio).toFixed(2),
            salario_minimo: parseFloat(item.salario_minimo).toFixed(2),
            salario_maximo: parseFloat(item.salario_maximo).toFixed(2),
            total_contratos: item.total_contratos
          })),
          por_cargo_top_10: promedioSalarioPorCargo.map(item => ({
            cargo: item.cargo,
            salario_promedio: parseFloat(item.salario_promedio).toFixed(2),
            total_contratos: item.total_contratos
          })),
          por_sector: salariosPorSector.map(item => ({
            sector: item.sector,
            salario_promedio: parseFloat(item.salario_promedio).toFixed(2),
            total_contratos: item.total_contratos
          }))
        }
      },
      'Estadísticas de contratos obtenidas exitosamente'
    );
  } catch (error) {
    console.error('Error en estadisticasContratos:', error);
    return errorResponse(res, 'Error al obtener estadísticas de contratos', 500);
  }
};