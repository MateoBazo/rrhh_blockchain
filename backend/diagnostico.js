// file: backend/diagnostico.js
const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DEL PROYECTO\n');

// 1. Verificar estructura de carpetas
const carpetas = [
  'src/models',
  'src/controllers',
  'src/routes',
  'src/middlewares',
  'src/utils',
  'src/config',
  'scripts',
  'tests',
  'uploads/cv',
  'uploads/fotos'
];

console.log('📁 CARPETAS:');
carpetas.forEach(carpeta => {
  const existe = fs.existsSync(carpeta);
  console.log(`   ${existe ? '✅' : '❌'} ${carpeta}`);
});

// 2. Verificar archivos críticos
const archivos = [
  'src/app.js',
  'src/models/index.js',
  'src/models/Usuario.js',
  'src/models/Empresa.js',
  'src/models/Candidato.js',
  'src/routes/authRoutes.js',
  'src/routes/empresaRoutes.js',
  'src/routes/candidatoRoutes.js',
  'src/controllers/authController.js',
  'src/controllers/empresaController.js',
  'src/controllers/candidatoController.js',
  'src/middlewares/auth.js',
  'src/middlewares/errorHandler.js',
  'src/config/database.js',
  'scripts/cambiar-rol.js',
  '.env',
  'server.js',
  'package.json'
];

console.log('\n📄 ARCHIVOS CRÍTICOS:');
archivos.forEach(archivo => {
  const existe = fs.existsSync(archivo);
  console.log(`   ${existe ? '✅' : '❌'} ${archivo}`);
  
  if (!existe && archivo.includes('.js')) {
    console.log(`       ⚠️  FALTA: ${archivo}`);
  }
});

// 3. Verificar node_modules
console.log('\n📦 DEPENDENCIAS:');
const deps = ['express', 'sequelize', 'mysql2', 'multer', 'uuid', 'bcryptjs', 'jsonwebtoken'];
deps.forEach(dep => {
  const ruta = path.join('node_modules', dep);
  const existe = fs.existsSync(ruta);
  console.log(`   ${existe ? '✅' : '❌'} ${dep}`);
});

// 4. Verificar .env
if (fs.existsSync('.env')) {
  const env = fs.readFileSync('.env', 'utf8');
  console.log('\n🔐 VARIABLES .ENV:');
  const vars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
  vars.forEach(v => {
    const existe = env.includes(v);
    console.log(`   ${existe ? '✅' : '❌'} ${v}`);
  });
}

console.log('\n✅ Diagnóstico completo');