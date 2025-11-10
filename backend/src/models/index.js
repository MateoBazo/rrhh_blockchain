// file: backend/src/models/index.js

const { sequelize } = require('../config/database');
const { Sequelize } = require('sequelize');

// ============================================
// IMPORTAR E INICIALIZAR MODELOS
// ============================================

// Modelos base (ya inicializados directamente)
const Usuario = require('./Usuario');
const Empresa = require('./Empresa');
const Candidato = require('./Candidato');

// Modelos nuevos S006 y S008 (factories que necesitan sequelize)
let Referencia, TokenVerificacion, Idioma, Certificacion, Documento, ContratoLaboral;
let NotificacionUsuario, RegistroBlockchain, AuditoriaAccion;
let Educacion, ExperienciaLaboral, Habilidad;

// Inicializar modelos S006 (con try-catch para los que no existan)
try {
  Referencia = require('./Referencia')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo Referencia no encontrado');
}

// 🆕 Inicializar modelo TokenVerificacion S008.2
try {
  TokenVerificacion = require('./TokenVerificacion')(sequelize);
} catch (e) {
  console.warn('⚠️  Modelo TokenVerificacion no encontrado');
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

// ============================================
// RELACIONES BASE (solo Usuario-Candidato-Empresa)
// Estas NO tienen método associate(), se definen aquí
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
  as: 'usuario_admin'
});

// ============================================
// EJECUTAR ASOCIACIONES DE MODELOS FACTORY
// Cada modelo factory define sus propias relaciones en associate()
// ============================================

const models = {
  Usuario,
  Empresa,
  Candidato,
  Referencia,
  TokenVerificacion, // 🆕 AGREGADO
  Idioma,
  Certificacion,
  Documento,
  ContratoLaboral,
  NotificacionUsuario,
  RegistroBlockchain,
  AuditoriaAccion,
  Educacion,
  ExperienciaLaboral,
  Habilidad
};

// Ejecutar associate() para cada modelo que lo tenga
Object.keys(models).forEach(modelName => {
  if (models[modelName] && typeof models[modelName].associate === 'function') {
    try {
      models[modelName].associate(models);
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