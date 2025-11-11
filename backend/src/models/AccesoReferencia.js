// file: backend/src/models/AccesoReferencia.js

const { DataTypes } = require('sequelize');

/**
 * Modelo Factory: AccesoReferencia
 * Registra cada vez que una empresa consulta una referencia verificada
 * Cumplimiento legal: auditoría y transparencia
 * S008.3
 */
module.exports = (sequelize) => {
  const AccesoReferencia = sequelize.define('AccesoReferencia', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    
    // Relaciones
    referencia_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'ID de la referencia consultada'
    },
    
    empresa_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'ID de la empresa que consulta'
    },
    
    candidato_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'ID del candidato (desnormalizado para queries)'
    },
    
    // Contexto de la consulta
    fecha_acceso: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha y hora exacta de la consulta'
    },
    
    motivo: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [100, 1000],
          msg: 'El motivo debe tener entre 100 y 1000 caracteres'
        },
        notEmpty: {
          msg: 'El motivo es obligatorio'
        }
      },
      comment: 'Razón por la cual la empresa consulta la referencia'
    },
    
    // Auditoría técnica
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      validate: {
        isIP: {
          msg: 'Formato de IP inválido'
        }
      },
      comment: 'Dirección IP desde donde se realizó la consulta'
    },
    
    user_agent: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'User agent del navegador'
    },
    
    duracion_vista_segundos: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'Duración debe ser mayor a 0 segundos'
        },
        max: {
          args: [3600],
          msg: 'Duración no puede exceder 1 hora (3600 segundos)'
        }
      },
      comment: 'Tiempo en segundos que la empresa visualizó la información'
    },
    
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    tableName: 'accesos_referencias',
    timestamps: false, // Usamos created_at manual
    underscored: true,
    indexes: [
      {
        name: 'idx_referencia',
        fields: ['referencia_id']
      },
      {
        name: 'idx_empresa',
        fields: ['empresa_id']
      },
      {
        name: 'idx_candidato',
        fields: ['candidato_id']
      },
      {
        name: 'idx_fecha',
        fields: ['fecha_acceso']
      },
      {
        name: 'idx_rate_limit',
        fields: ['empresa_id', 'referencia_id', 'fecha_acceso']
      }
    ]
  });

  // ============================================
  // ASOCIACIONES
  // ============================================
  AccesoReferencia.associate = (models) => {
    // AccesoReferencia -> Referencia (N:1)
    AccesoReferencia.belongsTo(models.Referencia, {
      foreignKey: 'referencia_id',
      as: 'referencia'
    });

    // AccesoReferencia -> Empresa (N:1)
    AccesoReferencia.belongsTo(models.Empresa, {
      foreignKey: 'empresa_id',
      as: 'empresa'
    });

    // AccesoReferencia -> Candidato (N:1)
    AccesoReferencia.belongsTo(models.Candidato, {
      foreignKey: 'candidato_id',
      as: 'candidato'
    });
  };

  return AccesoReferencia;
};