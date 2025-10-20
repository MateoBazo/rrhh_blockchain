// file: backend/src/models/Certificacion.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Certificacion = sequelize.define('Certificacion', {
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
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    institucion_emisora: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    fecha_obtencion: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    credencial_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    credencial_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    habilidades_relacionadas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array de habilidades'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'certificaciones',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['fecha_vencimiento'] }
    ]
  });

  Certificacion.associate = (models) => {
    Certificacion.belongsTo(models.Candidato, {
      foreignKey: 'candidato_id',
      as: 'candidato'
    });
  };

  return Certificacion;
};