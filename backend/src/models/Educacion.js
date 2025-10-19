// file: backend/src/models/Educacion.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Educacion = sequelize.define('Educacion', {
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
    nivel_educacion: {
      type: DataTypes.ENUM('SECUNDARIA', 'TECNICO', 'UNIVERSITARIO', 'POSTGRADO', 'MAESTRIA', 'DOCTORADO'),
      allowNull: false
    },
    institucion: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    titulo_obtenido: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    campo_estudio: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    en_curso: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    promedio: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'educacion',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['nivel_educacion'] }
    ]
  });

  Educacion.associate = (models) => {
    Educacion.belongsTo(models.Candidato, {
      foreignKey: 'candidato_id',
      as: 'candidato'
    });
  };

  return Educacion;
};