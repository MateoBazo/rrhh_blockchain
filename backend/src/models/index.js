// file: backend/src/models/index.js
const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');
const Empresa = require('./Empresa');
const Candidato = require('./Candidato');

// ============================================
// RELACIONES
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

// Usuario -> Empresa (1:N - un usuario admin puede gestionar varias empresas)
Usuario.hasMany(Empresa, {
  foreignKey: 'usuario_id',
  as: 'empresas',
  onDelete: 'SET NULL'
});
Empresa.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario_admin'
});

const models = {
  Usuario,
  Empresa,
  Candidato,
  sequelize
};

module.exports = models;//.