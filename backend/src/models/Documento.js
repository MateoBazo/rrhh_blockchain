// file: backend/src/models/Documento.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Documento = sequelize.define('Documento', {
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
    tipo_documento: {
      type: DataTypes.ENUM('TITULO', 'CERTIFICADO', 'CARNET_IDENTIDAD', 'LICENCIA', 'ANTECEDENTES', 'CONTRATO', 'OTRO'),
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    archivo_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    archivo_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: 'SHA256 hash para verificación de integridad'
    },
    tamano_bytes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_emision: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'documentos',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['tipo_documento'] },
      { fields: ['verificado'] }
    ]
  });

  Documento.associate = (models) => {
    Documento.belongsTo(models.Candidato, {
      foreignKey: 'candidato_id',
      as: 'candidato'
    });
    Documento.belongsTo(models.Usuario, {
      foreignKey: 'verificado_por',
      as: 'verificador'
    });
  };

  return Documento;
};