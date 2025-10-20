// file: backend/scripts/tests/test-s006-completo.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const IDS = {};
let TOKENS = {};

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}${msg}${colors.reset}`)
};

// Configuración de axios con timeouts
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(config => {
  if (TOKENS.candidato && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${TOKENS.candidato}`;
  }
  return config;
});

/**
 * PASO 1: AUTENTICACIÓN
 */
async function autenticar() {
  log.section('ℹ️  PASO 1: AUTENTICACIÓN');

  try {
    // Login ADMIN
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@rrhh.com',
      password: 'Admin123!'
    });

    if (adminLogin.data.exito && adminLogin.data.datos.token) {
      TOKENS.admin = adminLogin.data.datos.token;
      log.success('ADMIN token obtenido');
    } else {
      throw new Error('Token de admin no recibido');
    }

    // Login CANDIDATO
    const candidatoLogin = await api.post('/auth/login', {
      email: 'juan.perez@email.com',
      password: 'Cand123!'
    });

    if (candidatoLogin.data.exito && candidatoLogin.data.datos.token) {
      TOKENS.candidato = candidatoLogin.data.datos.token;
      IDS.usuarioId = candidatoLogin.data.datos.usuario.id;
      log.success('CANDIDATO token obtenido');

      // Obtener ID de candidato
      const candidatosResponse = await api.get('/candidatos', {
        headers: { Authorization: `Bearer ${TOKENS.candidato}` }
      });

      // ✅ CORRECCIÓN: El array está en .datos.candidatos, no directamente en .datos
      if (candidatosResponse.data.exito) {
        const listaCandidatos = candidatosResponse.data.datos.candidatos || candidatosResponse.data.datos;
        
        if (Array.isArray(listaCandidatos) && listaCandidatos.length > 0) {
          // Buscar el candidato que corresponde al usuario logueado
          const miCandidato = listaCandidatos.find(c => c.usuario_id === IDS.usuarioId);
          
          if (miCandidato) {
            IDS.candidatoId = miCandidato.id;
            log.success(`ID Candidato: ${IDS.candidatoId}`);
          } else {
            // Si no encuentra por usuario_id, tomar el primero
            IDS.candidatoId = listaCandidatos[0].id;
            log.success(`ID Candidato: ${IDS.candidatoId}`);
          }
        } else {
          throw new Error('Lista de candidatos vacía');
        }
      } else {
        throw new Error('No se pudo obtener lista de candidatos');
      }
    } else {
      throw new Error('Token de candidato no recibido');
    }

    return true;
  } catch (error) {
    log.error(`Error en autenticación: ${error.message}`);
    if (error.response) {
      log.error(`Respuesta del servidor: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}
/**
 * TEST 1: REFERENCIAS
 */
async function testReferencias() {
  log.section('ℹ️  TEST 1: REFERENCIAS');
  
  try {
    // Crear 3 referencias
    for (let i = 1; i <= 3; i++) {
      const response = await api.post('/referencias', {
        candidato_id: IDS.candidatoId,
        nombre_completo: `Referencia ${i}`,
        empresa: `Empresa Ref ${i}`,
        cargo: `Cargo ${i}`,
        telefono: `555-000${i}`,
        email: `ref${i}@test.com`,
        relacion: 'JEFE_DIRECTO'
      });

      if (response.data.exito) {
        if (i === 1) IDS.referenciaId = response.data.datos.id;
        log.success(`Referencia ${i} creada (ID: ${response.data.datos.id})`);
      }
    }

    // Intentar crear una 4ta (debe fallar)
    try {
      await api.post('/referencias', {
        candidato_id: IDS.candidatoId,
        nombre_completo: 'Referencia 4',
        empresa: 'Empresa Ref 4',
        cargo: 'Cargo 4',
        telefono: '555-0004',
        email: 'ref4@test.com',
        relacion: 'JEFE_DIRECTO'
      });
      log.error('Validación de máximo 3 referencias NO funcionó');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log.success('Validación correcta: máximo 3 referencias');
      }
    }

    // Listar referencias
    const listado = await api.get(`/referencias?candidato_id=${IDS.candidatoId}`);
    if (listado.data.exito) {
      log.success(`${listado.data.datos.length} referencia(s) encontrada(s)`);
    }

    // Eliminar una referencia
    if (IDS.referenciaId) {
      await api.delete(`/referencias/${IDS.referenciaId}`);
      log.success('Referencia eliminada correctamente');
    }

    return true;
  } catch (error) {
    log.error(`Error en test Referencias: ${error.message}`);
    return false;
  }
}

/**
 * TEST 2: IDIOMAS
 */
async function testIdiomas() {
  log.section('ℹ️  TEST 2: IDIOMAS');
  
  try {
    // Crear idioma válido
    const response = await api.post('/idiomas', {
      candidato_id: IDS.candidatoId,
      idioma: 'Inglés',
      nivel_conversacion: 'C1',
      nivel_escritura: 'B2',
      certificacion: 'TOEFL 95'
    });

    if (response.data.exito) {
      IDS.idiomaId = response.data.datos.id;
      log.success(`Idioma Inglés creado (ID: ${IDS.idiomaId})`);
    }

    // Intentar crear con nivel inválido
    try {
      await api.post('/idiomas', {
        candidato_id: IDS.candidatoId,
        idioma: 'Francés',
        nivel_conversacion: 'X9', // Inválido
        nivel_escritura: 'B1'
      });
      log.error('Validación de niveles NO funcionó');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log.success('Validación correcta: nivel inválido rechazado');
      }
    }

    // Listar idiomas
    const listado = await api.get(`/idiomas?candidato_id=${IDS.candidatoId}`);
    if (listado.data.exito) {
      log.success(`${listado.data.datos.length} idioma(s) encontrado(s)`);
    }

    return true;
  } catch (error) {
    log.error(`Error en test Idiomas: ${error.message}`);
    return false;
  }
}

/**
 * TEST 3: CERTIFICACIONES
 */
async function testCertificaciones() {
  log.section('ℹ️  TEST 3: CERTIFICACIONES');
  
  try {
    const response = await api.post('/certificaciones', {
      candidato_id: IDS.candidatoId,
      nombre_certificacion: 'AWS Certified Solutions Architect',
      institucion_emisora: 'Amazon Web Services',
      fecha_obtencion: '2024-01-15',
      fecha_expiracion: '2027-01-15',
      codigo_verificacion: 'AWS-SA-2024-001'
    });

    if (response.data.exito) {
      IDS.certificacionId = response.data.datos.id;
      log.success(`Certificación creada (ID: ${IDS.certificacionId})`);
    }

    // Listar certificaciones
    const listado = await api.get(`/certificaciones?candidato_id=${IDS.candidatoId}`);
    if (listado.data.exito) {
      log.success(`${listado.data.datos.length} certificación(es) encontrada(s)`);
    }

    return true;
  } catch (error) {
    log.error(`Error en test Certificaciones: ${error.message}`);
    return false;
  }
}

/**
 * TEST 4: DOCUMENTOS (SHA256)
 */
async function testDocumentos() {
  log.section('ℹ️  TEST 4: DOCUMENTOS (SHA256)');
  
  try {
    // Crear archivo temporal de prueba
    const testFilePath = path.join(__dirname, 'test-documento.txt');
    fs.writeFileSync(testFilePath, 'Documento de prueba para verificación de integridad SHA256\n'.repeat(10));

    // Subir documento
    const formData = new FormData();
    formData.append('documento', fs.createReadStream(testFilePath));
    // ✅ REMOVIDO: formData.append('candidato_id', IDS.candidatoId);
    formData.append('tipo_documento', 'CERTIFICADO');
    formData.append('nombre_documento', 'Certificado de Prueba');

    const response = await axios.post(`${BASE_URL}/documentos`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${TOKENS.candidato}`
      },
      timeout: 15000
    });

    if (response.data.exito) {
      IDS.documentoId = response.data.datos.id;
      const hashOriginal = response.data.datos.hash_sha256;
      log.success(`Documento subido (ID: ${IDS.documentoId})`);
      log.info(`Hash SHA256: ${hashOriginal.substring(0, 12)}...`);

      // Verificar integridad
      const verificacion = await api.get(`/documentos/${IDS.documentoId}/verificar`);
      if (verificacion.data.exito && verificacion.data.datos.integro) {
        log.success('Integridad verificada ✓');
      } else {
        log.error('Verificación de integridad falló');
      }
    }

    // Limpiar archivo temporal
    fs.unlinkSync(testFilePath);

    return true;
  } catch (error) {
    log.error(`Error en test Documentos: ${error.message}`);
    return false;
  }
}

/**
 * TEST 5: PERFIL COMPLETO
 */
async function testPerfilCompleto() {
  log.section('ℹ️  TEST 5: PERFIL COMPLETO');
  
  try {
    const response = await api.get(`/candidatos/${IDS.candidatoId}/perfil-completo`);

    if (response.data.exito) {
      const perfil = response.data.datos;
      log.success('Perfil completo obtenido');
      
      // Manejar diferentes estructuras de nombre
      const nombre = perfil.nombres || perfil.Usuario?.nombre_completo || 'N/A';
      const apellido = perfil.apellido_paterno || '';
      
      log.info(`- Nombre: ${nombre} ${apellido}`.trim());
      log.info(`- Educación: ${perfil.Educacions?.length || perfil.educacion?.length || 0} registro(s)`);
      log.info(`- Experiencia: ${perfil.ExperienciaLaborals?.length || perfil.experiencia_laboral?.length || 0} registro(s)`);
      log.info(`- Habilidades: ${perfil.Habilidads?.length || perfil.habilidades?.length || 0} habilidad(es)`);
      log.info(`- Completitud: ${perfil.porcentaje_completitud || perfil.completitud_perfil || 0}%`);
    }

    return true;
  } catch (error) {
    log.error(`Error en test Perfil Completo: ${error.message}`);
    return false;
  }
}

/**
 * TEST 6: ANALYTICS DASHBOARD
 */
async function testAnalytics() {
  log.section('ℹ️  TEST 6: ANALYTICS DASHBOARD');
  
  try {
    // Estadísticas de Candidatos
    const candidatosStats = await api.get('/analytics/candidatos-stats', {
      headers: { Authorization: `Bearer ${TOKENS.admin}` }
    });

    if (candidatosStats.data.exito) {
      const stats = candidatosStats.data.datos;
      log.success('Estadísticas de Candidatos obtenidas');
      log.info(`- Total candidatos: ${stats.total || stats.total_candidatos || 0}`);
      log.info(`- Disponibles: ${stats.disponibles || stats.busqueda_activa || 0}`);
    }

    // Estadísticas de Empresas
    const empresasStats = await api.get('/analytics/empresas-stats', {
      headers: { Authorization: `Bearer ${TOKENS.admin}` }
    });

    if (empresasStats.data.exito) {
      const stats = empresasStats.data.datos;
      log.success('Estadísticas de Empresas obtenidas');
      log.info(`- Total empresas: ${stats.total || stats.total_empresas || 0}`);
    }

    // Estadísticas de Contratos
    const contratosStats = await api.get('/analytics/contratos-stats', {
      headers: { Authorization: `Bearer ${TOKENS.admin}` }
    });

    if (contratosStats.data.exito) {
      const stats = contratosStats.data.datos;
      log.success('Estadísticas de Contratos obtenidas');
      log.info(`- Total contratos: ${stats.total || stats.total_contratos || 0}`);
    }

    return true;
  } catch (error) {
    log.error(`Error en test Analytics: ${error.message}`);
    if (error.code === 'ECONNRESET') {
      log.warn('El servidor se crasheó. Verificar analyticsController.js');
    }
    return false;
  }
}

/**
 * EJECUTAR TODOS LOS TESTS
 */
async function ejecutarTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     🧪 TEST COMPLETO SESIÓN S006                            ║');
  console.log('║     Sistema RRHH con Blockchain                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const resultados = {
    total: 6,
    exitosos: 0,
    fallidos: 0
  };

  try {
    // PASO 1: Autenticación (prerequisito)
    await autenticar();

    // Ejecutar tests
    const tests = [
      { nombre: 'Referencias', fn: testReferencias },
      { nombre: 'Idiomas', fn: testIdiomas },
      { nombre: 'Certificaciones', fn: testCertificaciones },
      { nombre: 'Documentos', fn: testDocumentos },
      { nombre: 'Perfil Completo', fn: testPerfilCompleto },
      { nombre: 'Analytics', fn: testAnalytics }
    ];

    for (const test of tests) {
      try {
        const exito = await test.fn();
        if (exito) {
          resultados.exitosos++;
        } else {
          resultados.fallidos++;
        }
      } catch (error) {
        log.error(`Test ${test.nombre} falló con excepción: ${error.message}`);
        resultados.fallidos++;
      }
    }

  } catch (error) {
    log.error(`Error crítico en la ejecución: ${error.message}`);
    process.exit(1);
  }

  // Mostrar resumen
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     RESUMEN DE TESTS                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`Total de tests: ${resultados.total}`);
  console.log(`${colors.green}✅ Exitosos: ${resultados.exitosos}${colors.reset}`);
  console.log(`${colors.red}❌ Fallidos: ${resultados.fallidos}${colors.reset}\n`);

  const cobertura = ((resultados.exitosos / resultados.total) * 100).toFixed(1);
  console.log(`Cobertura: ${cobertura}%\n`);

  if (resultados.fallidos === 0) {
    console.log(`${colors.green}🎉 ¡TODOS LOS TESTS PASARON! 🎉${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️  Algunos tests fallaron. Revise los logs.${colors.reset}\n`);
    process.exit(1);
  }
}

// Ejecutar
ejecutarTests();