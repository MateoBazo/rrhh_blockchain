// file: backend/src/models/Documento.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Documento = sequelize.define('Documento', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {  // ✅ CAMBIAR de candidato_id a usuario_id
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    tipo: {
      type: DataTypes.ENUM('cv', 'certificado_laboral', 'titulo_academico', 'certificacion', 'contrato', 'carta_recomendacion', 'otro', 'CERTIFICADO'),  // ✅ Agregar CERTIFICADO
      allowNull: false
    },
    nombre_original: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nombre_archivo_cifrado: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    path_cifrado: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    hash_sha256: {
      type: DataTypes.CHAR(64),
      allowNull: false,
      unique: true
    },
    tamano_bytes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING(100),
      defaultValue: 'application/pdf'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    publico: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    descargas: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    fecha_subida: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'documentos',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['usuario_id'] },
      { fields: ['tipo'] },
      { fields: ['publico'] }
    ]
  });

  Documento.associate = (models) => {
    Documento.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
  };

  return Documento;
};