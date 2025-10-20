// file: backend/src/models/ContratoLaboral.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ContratoLaboral = sequelize.define('ContratoLaboral', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,  
      primaryKey: true,
      autoIncrement: true
    },
    candidato_id: {
      type: DataTypes.INTEGER.UNSIGNED,  
      allowNull: false,
      references: {
        model: 'candidatos',
        key: 'id'
      }
    },
    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresas',
        key: 'id'
      }
    },
    cargo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    tipo_contrato: {
      type: DataTypes.ENUM('INDEFINIDO', 'TEMPORAL', 'PRACTICAS', 'FREELANCE', 'PROYECTO'),
      allowNull: false
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    salario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('ACTIVO', 'FINALIZADO', 'CANCELADO'),
      defaultValue: 'ACTIVO'
    },
    documento_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    tableName: 'contratos_laborales',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['empresa_id'] },
      { fields: ['estado'] }
    ]
  });

  ContratoLaboral.associate = (models) => {
    ContratoLaboral.belongsTo(models.Candidato, {
      foreignKey: 'candidato_id',
      as: 'candidato'
    });
    ContratoLaboral.belongsTo(models.Empresa, {
      foreignKey: 'empresa_id',
      as: 'empresa'
    });
  };

  return ContratoLaboral;
};