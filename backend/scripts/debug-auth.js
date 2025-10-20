// file: backend/scripts/debug-auth.js
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { Usuario } = require('../src/models');

const API_URL = 'http://localhost:5000/api';

async function debugAuth() {
  console.log('\n🔍 === DEBUG DE AUTENTICACIÓN ===\n');

  try {
    // 1. Buscar admin
    console.log('1️⃣  VERIFICANDO admin@rrhh.com:');
    const admin = await Usuario.findOne({ 
      where: { email: 'admin@rrhh.com' },
      raw: true  // Obtener objeto plano
    });

    if (!admin) {
      console.log('   ❌ Usuario admin@rrhh.com NO EXISTE');
      console.log('\n💡 Creando usuario con password: Admin123!');
      
      await Usuario.create({
        email: 'admin@rrhh.com',
        password_hash: await bcrypt.hash('Admin123!', 10),  // <-- password_hash
        rol: 'ADMIN',
        activo: true
      });

      console.log('   ✅ Usuario creado con password: Admin123!');
    } else {
      console.log('   ✅ Usuario encontrado');
      
      // Buscar el campo correcto (password o password_hash)
      const passwordHash = admin.password_hash || admin.password;
      
      if (!passwordHash) {
        console.log('   ❌ No se encontró campo de contraseña');
        console.log('   Campos disponibles:', Object.keys(admin));
        return;
      }
      
      console.log(`   Hash: ${passwordHash.substring(0, 30)}...`);
      
      // Probar contraseñas comunes
      const passwordsPrueba = ['Admin123!', 'admin123', 'Admin@123', 'admin', 'password', '123456'];
      
      console.log('\n   🔐 Probando contraseñas comunes:');
      let passwordEncontrada = false;
      
      for (const pwd of passwordsPrueba) {
        const esValida = await bcrypt.compare(pwd, passwordHash);
        console.log(`      "${pwd}": ${esValida ? '✅ VÁLIDA' : '❌ inválida'}`);
        
        if (esValida) {
          console.log(`\n   ✅✅✅ USA ESTA CONTRASEÑA: "${pwd}" ✅✅✅`);
          passwordEncontrada = true;
          break;
        }
      }
      
      if (!passwordEncontrada) {
        console.log('\n   ⚠️  Ninguna contraseña común funcionó');
        console.log('   💡 Reseteando contraseña a "Admin123!"...');
        
        await Usuario.update(
          { password_hash: await bcrypt.hash('Admin123!', 10) },
          { where: { email: 'admin@rrhh.com' } }
        );
        
        console.log('   ✅ Contraseña reseteada a: Admin123!');
      }
    }

    // 2. Buscar candidato
    console.log('\n2️⃣  VERIFICANDO candidato@test.com:');
    const candidato = await Usuario.findOne({ 
      where: { email: 'candidato@test.com' },
      raw: true
    });

    if (!candidato) {
      console.log('   ❌ Usuario candidato@test.com NO EXISTE');
      console.log('\n💡 Buscando otros usuarios con rol CANDIDATO...');
      
      const candidatos = await Usuario.findAll({ 
        where: { rol: 'CANDIDATO' }, 
        limit: 5,
        attributes: ['email', 'rol'],
        raw: true
      });
      
      if (candidatos.length > 0) {
        console.log('\n   📋 Usuarios CANDIDATO encontrados:');
        candidatos.forEach(c => {
          console.log(`      - ${c.email}`);
        });
        console.log('\n   💡 Actualiza el script con uno de estos emails');
        
        // Resetear password del primero
        const primerCandidato = candidatos[0];
        console.log(`\n   🔧 Reseteando password de ${primerCandidato.email} a "Cand123!"...`);
        
        await Usuario.update(
          { password_hash: await bcrypt.hash('Cand123!', 10) },
          { where: { email: primerCandidato.email } }
        );
        
        console.log(`   ✅ Password reseteado a: Cand123!`);
      } else {
        console.log('   ⚠️  NO HAY CANDIDATOS EN LA BD');
      }
    } else {
      console.log('   ✅ Usuario encontrado');
      
      const passwordHash = candidato.password_hash || candidato.password;
      
      if (!passwordHash) {
        console.log('   ❌ No se encontró campo de contraseña');
        return;
      }
      
      const passwordsPrueba = ['Cand123!', 'candidato123', 'password123', 'password'];
      
      console.log('\n   🔐 Probando contraseñas comunes:');
      let passwordEncontrada = false;
      
      for (const pwd of passwordsPrueba) {
        const esValida = await bcrypt.compare(pwd, passwordHash);
        console.log(`      "${pwd}": ${esValida ? '✅ VÁLIDA' : '❌ inválida'}`);
        
        if (esValida) {
          console.log(`\n   ✅✅✅ USA ESTA CONTRASEÑA: "${pwd}" ✅✅✅`);
          passwordEncontrada = true;
          break;
        }
      }
      
      if (!passwordEncontrada) {
        console.log('\n   ⚠️  Ninguna contraseña común funcionó');
        console.log('   💡 Reseteando contraseña a "Cand123!"...');
        
        await Usuario.update(
          { password_hash: await bcrypt.hash('Cand123!', 10) },
          { where: { email: 'candidato@test.com' } }
        );
        
        console.log('   ✅ Contraseña reseteada a: Cand123!');
      }
    }

    // 3. Probar login con API
    console.log('\n3️⃣  PROBANDO LOGIN CON API:');
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@rrhh.com',
        password: 'Admin123!'
      });

      console.log('   ✅ LOGIN EXITOSO');
      console.log(`   Token: ${loginRes.data.data.token.substring(0, 30)}...`);
    } catch (error) {
      console.log(`   ❌ LOGIN FALLÓ: ${error.response?.data?.message || error.message}`);
      console.log('   💡 Verifica que el servidor esté corriendo en puerto 5000');
    }

    console.log('\n✅ === DEBUG COMPLETADO ===\n');
    console.log('📝 RESUMEN:');
    console.log('   Email Admin: admin@rrhh.com');
    console.log('   Password Admin: Admin123!');
    console.log('   Email Candidato: candidato@test.com');
    console.log('   Password Candidato: Cand123!');
    console.log('\n💡 Usa estas credenciales en test-s006-completo.js\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugAuth();