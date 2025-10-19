// file: backend/scripts/sync-models.js
require('dotenv').config();
const db = require('../src/models');

async function syncModels() {
  try {
    console.log('🔄 Iniciando sincronización de modelos...');
    
    // Autenticar conexión
    await db.sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // Sincronizar modelos (alter: true ajusta tablas existentes)
    await db.sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados exitosamente');

    // Mostrar modelos registrados
    console.log('\n📋 Modelos registrados:');
    Object.keys(db).forEach(key => {
      if (key !== 'sequelize' && key !== 'Sequelize') {
        console.log(`   - ${key}`);
      }
    });

    console.log('\n✨ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    process.exit(1);
  }
}

syncModels();