// file: backend/src/models/TokenVerificacion.js

/**
 * MODELO: TokenVerificacion
 * 
 * Gestiona tokens de verificación de referencias por email.
 * Tokens expiran después de 7 días.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TokenVerificacion = sequelize.define('TokenVerificacion', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    referencia_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'referencias',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    fecha_generacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_expiracion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    usado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fecha_uso: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ip_verificacion: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tokens_verificacion',
    timestamps: false,
    indexes: [
      { fields: ['referencia_id'] },
      { fields: ['token'] },
      { fields: ['fecha_expiracion'] },
      { fields: ['token', 'usado', 'fecha_expiracion'] }
    ]
  });

  TokenVerificacion.associate = (models) => {
    TokenVerificacion.belongsTo(models.Referencia, {
      foreignKey: 'referencia_id',
      as: 'referencia'
    });
  };

  /**
   * Método estático: Generar token único
   */
  TokenVerificacion.generarToken = () => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  };

  /**
   * Método de instancia: Verificar si token está expirado
   */
  TokenVerificacion.prototype.estaExpirado = function() {
    return new Date() > new Date(this.fecha_expiracion);
  };

  /**
   * Método de instancia: Verificar si token es válido
   */
  TokenVerificacion.prototype.esValido = function() {
    return !this.usado && !this.estaExpirado();
  };

  return TokenVerificacion;
};