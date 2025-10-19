// file: backend/src/models/ExperienciaLaboral.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExperienciaLaboral = sequelize.define('ExperienciaLaboral', {
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
    empresa: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    cargo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    tipo_empleo: {
      type: DataTypes.ENUM('TIEMPO_COMPLETO', 'MEDIO_TIEMPO', 'FREELANCE', 'PRACTICAS', 'VOLUNTARIADO'),
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
    trabajo_actual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logros: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ubicacion: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'experiencia_laboral',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['trabajo_actual'] }
    ]
  });

  ExperienciaLaboral.associate = (models) => {
    ExperienciaLaboral.belongsTo(models.Candidato, {
      foreignKey: 'candidato_id',
      as: 'candidato'
    });
  };

  return ExperienciaLaboral;
};