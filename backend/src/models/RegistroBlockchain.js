// file: backend/src/models/RegistroBlockchain.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RegistroBlockchain = sequelize.define('RegistroBlockchain', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    entidad_tipo: {
      type: DataTypes.ENUM('CANDIDATO', 'EMPRESA', 'CONTRATO', 'DOCUMENTO'),
      allowNull: false,
      comment: 'Tipo de entidad asociada'
    },
    entidad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID de la entidad (polimórfico)'
    },
    hash_documento: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: 'SHA256 del documento'
    },
    hash_ipfs: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'CID de IPFS (futuro)'
    },
    transaccion_hash: {
      type: DataTypes.STRING(66),
      allowNull: true,
      comment: 'Hash de la transacción blockchain'
    },
    bloque_numero: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    red: {
      type: DataTypes.ENUM('LOCAL', 'TESTNET', 'MAINNET'),
      defaultValue: 'LOCAL'
    },
    contrato_address: {
      type: DataTypes.STRING(42),
      allowNull: true,
      comment: 'Dirección del smart contract'
    },
    metadatos: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON con metadata adicional'
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'CONFIRMADO', 'FALLIDO'),
      defaultValue: 'PENDIENTE'
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      comment: 'Usuario que generó el registro'
    }
  }, {
    tableName: 'registros_blockchain',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['entidad_tipo', 'entidad_id'] },
      { fields: ['hash_documento'] },
      { fields: ['transaccion_hash'] },
      { fields: ['estado'] }
    ]
  });

  RegistroBlockchain.associate = (models) => {
    RegistroBlockchain.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
  };

  return RegistroBlockchain;
};