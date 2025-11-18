// file: backend/src/services/matchingService.js

/**
 * SERVICIO: Matching y Scoring Candidato-Vacante
 * S009.6: Algoritmo básico scoring compatibilidad 0-100
 */

const { 
  Candidato, 
  Vacante,
  HabilidadCatalogo,
  CandidatoHabilidad,
  VacanteHabilidad,
  ExperienciaLaboral,
  Educacion
} = require('../models');
const { Op } = require('sequelize');

/**
 * CALCULAR SCORE DE COMPATIBILIDAD
 */
const calcularScore = async (candidatoId, vacanteId) => {
  try {
    // 1. Cargar candidato con relaciones
    const candidato = await Candidato.findByPk(candidatoId, {
      include: [
        {
          model: HabilidadCatalogo,
          as: 'habilidadesCatalogo',
          through: {
            model: CandidatoHabilidad,
            as: 'candidato_habilidad',
            attributes: ['nivel_dominio', 'anios_experiencia']  // ✅ CAMBIAR nivel_habilidad → nivel_dominio
          }
        },
        {
          model: ExperienciaLaboral,
          as: 'experienciaLaboral'
        },
        {
          model: Educacion,
          as: 'educacion'
        }
      ]
    });

    // 2. Cargar vacante con relaciones
    const vacante = await Vacante.findByPk(vacanteId, {
      include: [
        {
          model: HabilidadCatalogo,
          as: 'habilidades',
          through: {
            model: VacanteHabilidad,
            as: 'vacante_habilidad',
            attributes: ['nivel_minimo_requerido', 'obligatoria', 'peso_ponderacion']
          }
        }
      ]
    });

    if (!candidato || !vacante) {
      throw new Error('Candidato o vacante no encontrados');
    }

    // 3. Calcular componentes del score
    const scoreHabilidades = calcularScoreHabilidades(candidato, vacante);
    const scoreExperiencia = calcularScoreExperiencia(candidato, vacante);
    const scoreEducacion = calcularScoreEducacion(candidato, vacante);
    const scoreUbicacion = calcularScoreUbicacion(candidato, vacante);

    // 4. Score total ponderado
    const scoreTotal = Math.round(
      scoreHabilidades.puntos * 0.40 +  // 40%
      scoreExperiencia.puntos * 0.25 +  // 25%
      scoreEducacion.puntos * 0.20 +    // 20%
      scoreUbicacion.puntos * 0.15      // 15%
    );

    // 5. Desglose detallado
    const desglose = {
      habilidades: {
        puntos: scoreHabilidades.puntos,
        peso: 40,
        detalle: scoreHabilidades.detalle
      },
      experiencia: {
        puntos: scoreExperiencia.puntos,
        peso: 25,
        detalle: scoreExperiencia.detalle
      },
      educacion: {
        puntos: scoreEducacion.puntos,
        peso: 20,
        detalle: scoreEducacion.detalle
      },
      ubicacion: {
        puntos: scoreUbicacion.puntos,
        peso: 15,
        detalle: scoreUbicacion.detalle
      }
    };

    console.log(`📊 Score calculado: ${scoreTotal}/100 para candidato ${candidatoId} en vacante ${vacanteId}`);

    return {
      score_total: scoreTotal,
      desglose: desglose
    };

  } catch (error) {
    console.error('❌ Error al calcular score:', error);
    throw error;
  }
};

/**
 * CALCULAR SCORE HABILIDADES (0-100)
 */
const calcularScoreHabilidades = (candidato, vacante) => {
  const habilidadesVacante = vacante.habilidades || [];
  const habilidadesCandidato = candidato.habilidadesCatalogo || [];

  if (habilidadesVacante.length === 0) {
    return { puntos: 100, detalle: 'Sin habilidades requeridas' };
  }

  let puntosObtenidos = 0;
  let pesoTotal = 0;
  const detalleHabilidades = [];

  // Mapear niveles a números
  const nivelesMap = {
    'basico': 1,
    'intermedio': 2,
    'avanzado': 3,
    'experto': 4
  };

  habilidadesVacante.forEach(habilidadRequerida => {
    const pesoHabilidad = habilidadRequerida.vacante_habilidad.peso_ponderacion || 10;
    const nivelRequerido = habilidadRequerida.vacante_habilidad.nivel_minimo_requerido || 'basico';
    const esObligatoria = habilidadRequerida.vacante_habilidad.obligatoria || false;

    pesoTotal += pesoHabilidad;

    // Buscar si candidato tiene esta habilidad
    const habilidadCandidato = habilidadesCandidato.find(
      h => h.id === habilidadRequerida.id
    );

    if (!habilidadCandidato) {
      // No tiene la habilidad
      if (esObligatoria) {
        puntosObtenidos += 0;
        detalleHabilidades.push({
          habilidad: habilidadRequerida.nombre,
          requerido: nivelRequerido,
          candidato: 'No posee',
          match: 0,
          obligatoria: true
        });
      } else {
        detalleHabilidades.push({
          habilidad: habilidadRequerida.nombre,
          requerido: nivelRequerido,
          candidato: 'No posee',
          match: 0,
          obligatoria: false
        });
      }
    } else {
      // Tiene la habilidad, comparar niveles
      const nivelCandidato = habilidadCandidato.candidato_habilidad.nivel_dominio || 'basico';  // ✅ CAMBIAR
      const nivelCandidatoNum = nivelesMap[nivelCandidato] || 1;
      const nivelRequeridoNum = nivelesMap[nivelRequerido] || 1;

      if (nivelCandidatoNum >= nivelRequeridoNum) {
        // Cumple o supera el nivel
        puntosObtenidos += pesoHabilidad;
        
        const bonus = nivelCandidatoNum > nivelRequeridoNum ? 5 : 0;
        puntosObtenidos += bonus;

        detalleHabilidades.push({
          habilidad: habilidadRequerida.nombre,
          requerido: nivelRequerido,
          candidato: nivelCandidato,
          match: 100,
          bonus: bonus > 0 ? `+${bonus}pts` : null
        });
      } else {
        // Nivel inferior
        const proporcion = nivelCandidatoNum / nivelRequeridoNum;
        puntosObtenidos += pesoHabilidad * proporcion * 0.5;

        detalleHabilidades.push({
          habilidad: habilidadRequerida.nombre,
          requerido: nivelRequerido,
          candidato: nivelCandidato,
          match: Math.round(proporcion * 50),
          penalizacion: '-50%'
        });
      }
    }
  });

  // Normalizar a escala 0-100
  const scoreNormalizado = pesoTotal > 0 
    ? Math.min(100, Math.round((puntosObtenidos / pesoTotal) * 100))
    : 0;

  return {
    puntos: scoreNormalizado,
    detalle: {
      habilidades_evaluadas: habilidadesVacante.length,
      peso_total: pesoTotal,
      puntos_obtenidos: Math.round(puntosObtenidos),
      matches: detalleHabilidades
    }
  };
};

/**
 * CALCULAR SCORE EXPERIENCIA (0-100)
 */
const calcularScoreExperiencia = (candidato, vacante) => {
  const experienciasRelevantes = candidato.experienciaLaboral || [];
  const aniosRequeridos = vacante.experiencia_requerida_anios || 0;

  // Sumar años de experiencia total
  let aniosTotales = 0;
  experienciasRelevantes.forEach(exp => {
    if (exp.fecha_inicio && exp.fecha_fin) {
      const inicio = new Date(exp.fecha_inicio);
      const fin = exp.fecha_fin === 'Actualidad' ? new Date() : new Date(exp.fecha_fin);
      const anios = (fin - inicio) / (1000 * 60 * 60 * 24 * 365);
      aniosTotales += anios;
    }
  });

  let score = 0;
  if (aniosRequeridos === 0) {
    score = 100;
  } else if (aniosTotales >= aniosRequeridos) {
    score = 100;
  } else {
    score = Math.round((aniosTotales / aniosRequeridos) * 100);
  }

  return {
    puntos: Math.min(100, score),
    detalle: {
      anios_candidato: Math.round(aniosTotales * 10) / 10,
      anios_requeridos: aniosRequeridos,
      cumple: aniosTotales >= aniosRequeridos
    }
  };
};

/**
 * CALCULAR SCORE EDUCACIÓN (0-100)
 */
const calcularScoreEducacion = (candidato, vacante) => {
  const educaciones = candidato.educacion || [];
  const nivelRequerido = vacante.nivel_educativo_minimo || 'secundaria';

  // ✅ MAPEAR ENUM CORRECTO
  const nivelesEducacion = {
    'secundaria': 1,
    'tecnico': 2,
    'universitario': 3,
    'licenciatura': 3,
    'postgrado': 4,
    'maestria': 4,
    'doctorado': 5
  };

  // Encontrar el nivel más alto del candidato
  let nivelMaxCandidato = 0;
  let nivelMaxNombre = 'ninguno';
  
  educaciones.forEach(edu => {
    const nivel = nivelesEducacion[edu.nivel_educacion?.toLowerCase()] || 0;  // ✅ CAMBIAR
    if (nivel > nivelMaxCandidato) {
      nivelMaxCandidato = nivel;
      nivelMaxNombre = edu.nivel_educacion?.toLowerCase() || 'ninguno';
    }
  });

  const nivelRequeridoNum = nivelesEducacion[nivelRequerido?.toLowerCase()] || 1;

  let score = 0;
  if (nivelMaxCandidato >= nivelRequeridoNum) {
    score = 100;
  } else if (nivelMaxCandidato > 0) {
    score = Math.round((nivelMaxCandidato / nivelRequeridoNum) * 70);
  } else {
    score = 0;
  }

  return {
    puntos: score,
    detalle: {
      nivel_candidato: nivelMaxNombre,
      nivel_requerido: nivelRequerido,
      cumple: nivelMaxCandidato >= nivelRequeridoNum
    }
  };
};

/**
 * CALCULAR SCORE UBICACIÓN (0-100)
 */
const calcularScoreUbicacion = (candidato, vacante) => {
  const modalidad = vacante.modalidad || 'presencial';

  if (modalidad === 'remoto') {
    return {
      puntos: 100,
      detalle: {
        modalidad: 'remoto',
        ubicacion_relevante: false
      }
    };
  }

  const ciudadCandidato = candidato.ciudad?.toLowerCase() || '';
  const ciudadVacante = vacante.ciudad?.toLowerCase() || '';

  if (ciudadCandidato === ciudadVacante) {
    return {
      puntos: 100,
      detalle: {
        modalidad: modalidad,
        ciudad_candidato: candidato.ciudad,
        ciudad_vacante: vacante.ciudad,
        match: true
      }
    };
  }

  const deptoCandidato = candidato.departamento?.toLowerCase() || '';
  const deptoVacante = vacante.departamento?.toLowerCase() || '';

  if (deptoCandidato === deptoVacante) {
    return {
      puntos: modalidad === 'hibrido' ? 80 : 60,
      detalle: {
        modalidad: modalidad,
        departamento_match: true,
        penalizacion: 'Diferente ciudad'
      }
    };
  }

  return {
    puntos: modalidad === 'hibrido' ? 40 : 20,
    detalle: {
      modalidad: modalidad,
      ubicacion_match: false,
      penalizacion: 'Ubicación distante'
    }
  };
};

module.exports = {
  calcularScore
};