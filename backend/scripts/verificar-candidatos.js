// file: backend/scripts/verificar-candidatos.js
const path = require('path');

// Cargar .env desde la raíz del proyecto backend
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Usuario, Candidato, sequelize } = require('../src/models');

async function verificarCandidatos() {
  try {
    console.log('🔍 Verificando integridad usuarios-candidatos...\n');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida\n');

    // 1. Contar usuarios candidatos
    const totalUsuariosCandidatos = await Usuario.count({
      where: { rol: 'CANDIDATO' }
    });

    // 2. Contar registros en candidatos
    const totalRegistrosCandidatos = await Candidato.count();

    // 3. Usuarios sin candidato
    const usuariosSinCandidato = await Usuario.findAll({
      where: { rol: 'CANDIDATO' },
      include: [{
        model: Candidato,
        as: 'candidato',
        required: false
      }]
    });

    const faltantes = usuariosSinCandidato.filter(u => !u.candidato);

    console.log(`📊 Estadísticas:`);
    console.log(`   Total usuarios con rol CANDIDATO: ${totalUsuariosCandidatos}`);
    console.log(`   Total registros en tabla candidatos: ${totalRegistrosCandidatos}`);
    console.log(`   Usuarios sin candidato: ${faltantes.length}\n`);

    if (faltantes.length > 0) {
      console.log('❌ USUARIOS SIN CANDIDATO:');
      faltantes.forEach(u => {
        console.log(`   - ID: ${u.id}, Email: ${u.email}`);
      });
      await sequelize.close();
      process.exit(1);
    } else {
      console.log('✅ Todos los usuarios CANDIDATO tienen su registro correspondiente\n');
      
      // Verificar candidato@test.com
      const testCandidato = await Usuario.findOne({
        where: { email: 'candidato@test.com' },
        include: [{
          model: Candidato,
          as: 'candidato'
        }]
      });

      if (testCandidato && testCandidato.candidato) {
        console.log('✅ candidato@test.com verificado:');
        console.log(`   Usuario ID: ${testCandidato.id}`);
        console.log(`   Candidato ID: ${testCandidato.candidato.id}`);
        console.log(`   Nombre: ${testCandidato.candidato.nombres} ${testCandidato.candidato.apellido_paterno}\n`);
      } else if (testCandidato) {
        console.log('⚠️  candidato@test.com existe pero NO tiene registro en tabla candidatos');
        console.log('   Ejecuta: mysql -u root -p < backend\\database\\fix-candidatos-seed.sql\n');
        await sequelize.close();
        process.exit(1);
      } else {
        console.log('❌ candidato@test.com NO encontrado en tabla usuarios');
        console.log('   Ejecuta: mysql -u root -p < backend\\database\\fix-candidatos-seed.sql\n');
        await sequelize.close();
        process.exit(1);
      }
    }

    await sequelize.close();
    console.log('🎉 BLOCKER #2 RESUELTO - Integridad verificada\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'SequelizeConnectionRefusedError') {
      console.error('   Asegúrate que MySQL esté corriendo');
    }
    if (error.name === 'SequelizeAccessDeniedError') {
      console.error('   Verifica las credenciales en backend/.env');
      console.error('   DB_USER, DB_PASSWORD, DB_NAME deben ser correctos');
    }
    await sequelize.close();
    process.exit(1);
  }
}

verificarCandidatos();