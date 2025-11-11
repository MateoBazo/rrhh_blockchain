// file: backend/src/models/Referencia.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Referencia = sequelize.define('Referencia', {
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
    nombre_completo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    empresa: {
      type: DataTypes.STRING(150),
      allowNull: false
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
      type: DataTypes.STRING(100), // ✅ Cambiar de ENUM a STRING para más flexibilidad
      allowNull: false
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
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'referencias',
    timestamps: false, // ✅ Manejamos created_at/updated_at manualmente
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['verificado'] },
      { fields: ['email'] }
    ]
  });

  // ============================================
  // ASOCIACIONES
  // ============================================
  Referencia.associate = (models) => {
    // Referencia -> Candidato (N:1)
    // ✅ IMPORTANTE: Usar el nombre exacto del modelo exportado
    Referencia.belongsTo(models.Candidato || models.candidatos, {
      foreignKey: 'candidato_id',
      as: 'candidato'
    });

    // Referencia -> TokenVerificacion (1:1)
    if (models.TokenVerificacion) {
      Referencia.hasOne(models.TokenVerificacion, {
        foreignKey: 'referencia_id',
        as: 'token',
        onDelete: 'CASCADE'
      });
    }

    // Referencia -> AccesoReferencia (1:N)
    if (models.AccesoReferencia) {
      Referencia.hasMany(models.AccesoReferencia, {
        foreignKey: 'referencia_id',
        as: 'accesos',
        onDelete: 'CASCADE'
      });
    }
  };

  return Referencia;
};