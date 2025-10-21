// file: backend/server.js
const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

/**
 * Iniciar servidor
 */
const iniciarServidor = async () => {
  try {
    // 1. Probar conexión a MySQL
    await testConnection();

    // 2. Sincronizar modelos con DB 
  
    if (process.env.NODE_ENV === 'development') {
      console.log('⚙️  Sincronizando modelos con base de datos...');
      await sequelize.sync({ alter: false }); // Cambia a true si quieres auto-migrar
      console.log('✅ Modelos sincronizados');
    }

    // 3. Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   🚀 Servidor Backend Iniciado             ║
║   📡 Puerto: ${PORT}                        ║
║   🌍 Entorno: ${process.env.NODE_ENV}       ║
║   📊 Base de datos: MySQL                  ║
║   🔗 URL: http://localhost:${PORT}         ║
╚════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

// Iniciar
iniciarServidor();