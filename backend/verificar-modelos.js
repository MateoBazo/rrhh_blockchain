// file: backend/verificar-modelos.js
require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function verificarModelos() {
  try {
    console.log('🔍 Verificando modelos...\n');

    // Test 1: Conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL OK\n');

    // Test 2: Importar modelos individualmente
    console.log('📦 Importando modelos:');
    
    try {
      const Usuario = require('./src/models/Usuario');
      console.log('   ✅ Usuario importado:', typeof Usuario);
    } catch (e) {
      console.error('   ❌ Error Usuario:', e.message);
    }

    try {
      const Empresa = require('./src/models/Empresa');
      console.log('   ✅ Empresa importado:', typeof Empresa);
    } catch (e) {
      console.error('   ❌ Error Empresa:', e.message);
    }

    try {
      const Candidato = require('./src/models/Candidato');
      console.log('   ✅ Candidato importado:', typeof Candidato);
    } catch (e) {
      console.error('   ❌ Error Candidato:', e.message);
    }

    // Test 3: Importar index.js
    console.log('\n📋 Importando index.js:');
    const db = require('./src/models');
    console.log('   ✅ db.Usuario:', typeof db.Usuario);
    console.log('   ✅ db.Empresa:', typeof db.Empresa);
    console.log('   ✅ db.Candidato:', typeof db.Candidato);
    console.log('   ✅ db.sequelize:', typeof db.sequelize);

    // Test 4: Crear un usuario de prueba
    console.log('\n🧪 Test de creación:');
    const testEmail = `test_${Date.now()}@test.com`;
    const usuario = await db.Usuario.create({
      email: testEmail,
      password_hash: 'Test1234!',
      rol: 'CANDIDATO'
    });
    console.log('   ✅ Usuario creado:', usuario.id, usuario.email);

    // Limpieza
    await usuario.destroy();
    console.log('   ✅ Usuario eliminado');

    console.log('\n✅ Todos los tests pasaron');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verificarModelos();