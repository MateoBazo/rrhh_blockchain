// file: backend/src/models/index.js

const { sequelize } = require('../config/database');
const { Sequelize } = require('sequelize');

// ============================================
// MODELOS BASE
// ============================================
const Usuario = require('./Usuario');
const Empresa = require('./Empresa');
const Candidato = require('./Candidato');

// ============================================
// MODELOS FACTORY S006-S009
// ============================================
let Referencia, TokenVerificacion, AccesoReferencia;
let Idioma, Certificacion, Documento, ContratoLaboral;
let NotificacionUsuario, RegistroBlockchain, AuditoriaAccion;
let Educacion, ExperienciaLaboral, Habilidad;
let HabilidadCatalogo, CandidatoHabilidad, HistorialLaboral;
let Vacante, VacanteHabilidad, Postulacion; // 🆕 S009.2

// Inicializar modelos S006-S008
try {
  Referencia = require('./Referencia')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo Referencia no encontrado');
}

try {
  TokenVerificacion = require('./TokenVerificacion')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo TokenVerificacion no encontrado');
}

try {
  AccesoReferencia = require('./AccesoReferencia')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo AccesoReferencia no encontrado');
}

try {
  Idioma = require('./Idioma')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo Idioma no encontrado');
}

try {
  Certificacion = require('./Certificacion')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo Certificacion no encontrado');
}

try {
  Documento = require('./Documento')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo Documento no encontrado');
}

try {
  ContratoLaboral = require('./ContratoLaboral')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo ContratoLaboral no encontrado');
}

try {
  NotificacionUsuario = require('./NotificacionUsuario')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo NotificacionUsuario no encontrado');
}

try {
  RegistroBlockchain = require('./RegistroBlockchain')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo RegistroBlockchain no encontrado');
}

try {
  AuditoriaAccion = require('./AuditoriaAccion')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo AuditoriaAccion no encontrado');
}

try {
  Educacion = require('./Educacion')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo Educacion no encontrado');
}

try {
  ExperienciaLaboral = require('./ExperienciaLaboral')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo ExperienciaLaboral no encontrado');
}

try {
  Habilidad = require('./Habilidad')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo Habilidad no encontrado');
}

// Modelos S009.1
try {
  HabilidadCatalogo = require('./HabilidadCatalogo')(sequelize);
  console.log('✅ Modelo HabilidadCatalogo cargado');
} catch (e) {
  console.warn('⚠️  Modelo HabilidadCatalogo no encontrado:', e.message);
}

try {
  CandidatoHabilidad = require('./CandidatoHabilidad')(sequelize);
  console.log('✅ Modelo CandidatoHabilidad cargado');
} catch (e) {
  console.warn('⚠️  Modelo CandidatoHabilidad no encontrado:', e.message);
}

try {
  HistorialLaboral = require('./HistorialLaboral')(sequelize);
  console.log('✅ Modelo HistorialLaboral cargado');
} catch (e) {
  console.warn('⚠️  Modelo HistorialLaboral no encontrado:', e.message);
}

// 🆕 Modelos S009.2
try {
  Vacante = require('./Vacante')(sequelize);
  console.log('✅ Modelo Vacante cargado');
} catch (e) {
  console.warn('⚠️  Modelo Vacante no encontrado:', e.message);
}

try {
  VacanteHabilidad = require('./VacanteHabilidad')(sequelize);
  console.log('✅ Modelo VacanteHabilidad cargado');
} catch (e) {
  console.warn('⚠️  Modelo VacanteHabilidad no encontrado:', e.message);
}

try {
  Postulacion = require('./Postulacion')(sequelize);
  console.log('✅ Modelo Postulacion cargado');
} catch (e) {
  console.warn('⚠️  Modelo Postulacion no encontrado:', e.message);
}

// ============================================
// RELACIONES BASE
// ============================================

// Usuario -> Candidato (1:1)
Usuario.hasOne(Candidato, {
  foreignKey: 'usuario_id',
  as: 'candidato',
  onDelete: 'CASCADE'
});
Candidato.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Usuario -> Empresa (1:N)
Usuario.hasMany(Empresa, {
  foreignKey: 'usuario_id',
  as: 'empresas',
  onDelete: 'SET NULL'
});
Empresa.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// ============================================
// EJECUTAR ASOCIACIONES
// ============================================

const models = {
  Usuario,
  Empresa,
  Candidato,
  Referencia,
  TokenVerificacion,
  AccesoReferencia,
  Idioma,
  Certificacion,
  Documento,
  ContratoLaboral,
  NotificacionUsuario,
  RegistroBlockchain,
  AuditoriaAccion,
  Educacion,
  ExperienciaLaboral,
  Habilidad,
  HabilidadCatalogo,
  CandidatoHabilidad,
  HistorialLaboral,
  Vacante,           // 🆕 S009.2
  VacanteHabilidad,  // 🆕 S009.2
  Postulacion        // 🆕 S009.2
};

// Ejecutar associate()
Object.keys(models).forEach(modelName => {
  if (models[modelName] && typeof models[modelName].associate === 'function') {
    try {
      models[modelName].associate(models);
      console.log(`✅ Asociaciones de ${modelName} ejecutadas`);
    } catch (error) {
      console.error(`❌ Error al asociar modelo ${modelName}:`, error.message);
    }
  }
});

// ============================================
// EXPORTAR
// ============================================
const db = {
  ...models,
  sequelize,
  Sequelize: require('sequelize')
};

module.exports = db;