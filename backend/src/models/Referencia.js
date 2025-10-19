// file: backend/src/models/Referencia.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Referencia = sequelize.define('Referencia', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    candidato_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'candidatos',
        key: 'id'
      }
    },
    nombre_completo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    empresa: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    relacion: {
      type: DataTypes.ENUM('SUPERVISOR', 'COLEGA', 'PROFESOR', 'CLIENTE', 'OTRO'),
      allowNull: false
    },
    anos_conocidos: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    fecha_verificacion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'referencias',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['verificado'] }
    ]
  });

  Referencia.associate = (models) => {
    Referencia.belongsTo(models.Candidato, {
      foreignKey: 'candidato_id',
      as: 'candidato'
    });
  };

  return Referencia;
};