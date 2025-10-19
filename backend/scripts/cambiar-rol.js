// file: backend/scripts/cambiar-rol.js
require('dotenv').config();
const db = require('../src/models');

async function cambiarRol() {
  try {
    // Obtener argumentos
    const email = process.argv[2];
    const nuevoRol = process.argv[3];

    if (!email || !nuevoRol) {
      console.error('❌ Uso: node cambiar-rol.js <email> <ROL>');
      console.log('   Roles válidos: ADMIN, EMPRESA, CANDIDATO, CONTRATISTA');
      process.exit(1);
    }

    // Validar rol
    const rolesValidos = ['ADMIN', 'EMPRESA', 'CANDIDATO', 'CONTRATISTA'];
    if (!rolesValidos.includes(nuevoRol)) {
      console.error(`❌ Rol inválido. Válidos: ${rolesValidos.join(', ')}`);
      process.exit(1);
    }

    // Conectar a DB
    await db.sequelize.authenticate();

    // Buscar usuario
    const usuario = await db.Usuario.findOne({ where: { email } });
    
    if (!usuario) {
      console.error(`❌ Usuario con email ${email} no encontrado`);
      process.exit(1);
    }

    // Cambiar rol
    usuario.rol = nuevoRol;
    await usuario.save();

    console.log(`✅ Rol actualizado exitosamente`);
    console.log(`   Email: ${email}`);
    console.log(`   Nuevo rol: ${nuevoRol}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cambiarRol();