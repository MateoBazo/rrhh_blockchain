// file: backend/src/models/Empresa.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { SECTORES_ENUM, TAMANIOS_EMPRESA } = require('../utils/constants'); // IMPORTAR

const Empresa = sequelize.define('empresas', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,  
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER.UNSIGNED,  
    allowNull: true,
    unique: true, // AGREGAR: Un usuario solo puede tener una empresa
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  nit: {
    type: DataTypes.STRING(20),
    allowNull: false, // CAMBIAR: Ahora obligatorio en registro
    unique: true,
    validate: {
      notEmpty: { msg: 'El NIT es obligatorio' },
      len: {
        args: [5, 20],
        msg: 'El NIT debe tener entre 5 y 20 caracteres'
      }
    }
  },
  razon_social: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La razón social no puede estar vacía' }
    }
  },
  nombre_comercial: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // CAMBIAR: VARCHAR → ENUM
  sector: {
    type: DataTypes.ENUM(...SECTORES_ENUM),
    allowNull: false, // OBLIGATORIO en registro
    validate: {
      notEmpty: { msg: 'El sector es obligatorio' },
      isIn: {
        args: [SECTORES_ENUM],
        msg: 'Sector inválido'
      }
    }
  },
  tamanio: {
    type: DataTypes.ENUM('Micro', 'Pequeña', 'Mediana', 'Grande'),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  sitio_web: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: { msg: 'URL inválida' }
    }
  },
  pais: {
    type: DataTypes.STRING(100),
    defaultValue: 'Bolivia'
  },
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: false, // OBLIGATORIO en registro
    validate: {
      notEmpty: { msg: 'El departamento es obligatorio' }
    }
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: false, // OBLIGATORIO en registro
    validate: {
      notEmpty: { msg: 'La ciudad es obligatoria' }
    }
  },
  direccion: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  verificada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha_verificacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'empresas',
  timestamps: true,
  underscored: true
});

// ============================================
// ASOCIACIONES
// ============================================
Empresa.associate = (models) => {
  // 🆕 Empresa → Vacantes (1:N)
  if (models.Vacante) {
    Empresa.hasMany(models.Vacante, {
      foreignKey: 'empresa_id',
      as: 'vacantes',
      onDelete: 'CASCADE'
    });
  }

  // 🆕 Empresa → HistorialLaboral (1:N)
  if (models.HistorialLaboral) {
    Empresa.hasMany(models.HistorialLaboral, {
      foreignKey: 'empresa_id',
      as: 'historialLaboral',
      onDelete: 'SET NULL'
    });
  }
};

module.exports = Empresa;