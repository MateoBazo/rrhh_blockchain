// file: backend/src/models/Usuario.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('usuarios', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Formato de email inválido' }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  google_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  rol: {
    type: DataTypes.ENUM('ADMIN', 'EMPRESA', 'CANDIDATO', 'CONTRATISTA'), // 👈 ACTUALIZADO
    allowNull: false,
    defaultValue: 'CANDIDATO' // 👈 ACTUALIZADO
  },
  verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true
  },
  intentos_login_fallidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bloqueado_hasta: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password_hash) {
        const salt = await bcrypt.genSalt(10);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    }
  }
});

// Método para comparar contraseñas
Usuario.prototype.compararPassword = async function(passwordPlano) {
  return await bcrypt.compare(passwordPlano, this.password_hash);
};

// Ocultar password en JSON
Usuario.prototype.toJSON = function() {
  const valores = { ...this.get() };
  delete valores.password_hash;
  return valores;
};

module.exports = Usuario;