// file: backend/src/models/Idioma.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Idioma = sequelize.define('Idioma', {
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
    idioma: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    nivel_lectura: {
      type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'NATIVO'),
      allowNull: false
    },
    nivel_escritura: {
      type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'NATIVO'),
      allowNull: false
    },
    nivel_conversacion: {
      type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'NATIVO'),
      allowNull: false
    },
    certificacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ej: TOEFL, IELTS, DELE'
    },
    puntuacion_certificacion: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fecha_certificacion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    tableName: 'idiomas',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['idioma'] }
    ]
  });

  Idioma.associate = (models) => {
    Idioma.belongsTo(models.Candidato, {
      foreignKey: 'candidato_id',
      as: 'candidato'
    });
  };

  return Idioma;
};