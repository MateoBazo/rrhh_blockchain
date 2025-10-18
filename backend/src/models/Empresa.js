// file: backend/src/models/Empresa.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Empresa = sequelize.define('empresas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: { // 👈 FK a usuarios
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  nit: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  razon_social: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La razón social no puede estar vacía' }
    }
  },
  nombre_comercial: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  sector: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tamanio: {
    type: DataTypes.ENUM('Micro', 'Pequeña', 'Mediana', 'Grande'),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  sitio_web: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pais: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  verificada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha_verificacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
  // created_at y updated_at automáticos
}, {
  tableName: 'empresas',
  timestamps: true,
  underscored: true
});

module.exports = Empresa;//.