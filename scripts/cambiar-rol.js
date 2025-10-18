// file: backend/scripts/cambiar-rol.js
const { Usuario } = require('../src/models');
const { sequelize } = require('../src/config/database');

const cambiarRol = async (email, nuevoRol) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      console.log(`❌ Usuario ${email} no encontrado`);
      process.exit(1);
    }

    const rolAnterior = usuario.rol;
    usuario.rol = nuevoRol;
    await usuario.save();

    console.log(`✅ Rol actualizado para ${email}`);
    console.log(`   Anterior: ${rolAnterior}`);
    console.log(`   Nuevo: ${nuevoRol}`);

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Leer argumentos de línea de comandos
const email = process.argv[2];
const rol = process.argv[3];

if (!email || !rol) {
  console.log('Uso: node scripts/cambiar-rol.js <email> <ROL>');
  console.log('Roles válidos: ADMIN, EMPRESA, CANDIDATO, CONTRATISTA');
  process.exit(1);
}

if (!['ADMIN', 'EMPRESA', 'CANDIDATO', 'CONTRATISTA'].includes(rol)) {
  console.log('❌ Rol inválido. Roles válidos: ADMIN, EMPRESA, CANDIDATO, CONTRATISTA');
  process.exit(1);
}

cambiarRol(email, rol);//.