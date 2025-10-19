// file: backend/src/models/Habilidad.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Habilidad = sequelize.define('Habilidad', {
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
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    tipo_habilidad: {
      type: DataTypes.ENUM('TECNICA', 'BLANDA', 'IDIOMA', 'HERRAMIENTA'),
      allowNull: false
    },
    nivel: {
      type: DataTypes.ENUM('BASICO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO'),
      allowNull: false
    },
    anos_experiencia: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    certificacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'habilidades',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['tipo_habilidad'] },
      { fields: ['nivel'] }
    ]
  });

  Habilidad.associate = (models) => {
    Habilidad.belongsTo(models.Candidato, {
      foreignKey: 'candidato_id',
      as: 'candidato'
    });
  };

  return Habilidad;
};