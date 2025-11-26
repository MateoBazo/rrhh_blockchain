// file: backend/src/models/Candidato.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { SECTORES_ENUM } = require('../utils/constants'); // ✅ IMPORTAR

const Candidato = sequelize.define('candidatos', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  ci: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'La cédula de identidad es obligatoria' },
      len: {
        args: [5, 20],
        msg: 'El CI debe tener entre 5 y 20 caracteres'
      }
    }
  },
  nombres: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es obligatorio' }
    }
  },
  apellido_paterno: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El apellido paterno es obligatorio' }
    }
  },
  apellido_materno: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'Fecha de nacimiento inválida' },
      isBeforeToday(value) {
        if (new Date(value) >= new Date()) {
          throw new Error('La fecha de nacimiento debe ser anterior a hoy');
        }
      },
      isAdult(value) {
        const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) {
          throw new Error('Debes ser mayor de 18 años para registrarte');
        }
      }
    }
  },
  genero: {
    type: DataTypes.ENUM('Masculino', 'Femenino', 'Otro', 'Prefiero no decir'),
    defaultValue: 'Prefiero no decir'
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  telefono_alternativo: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  pais_residencia: {
    type: DataTypes.STRING(100),
    defaultValue: 'Bolivia'
  },
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El departamento es obligatorio' }
    }
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La ciudad es obligatoria' }
    }
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profesion: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Ej: Ingeniero de Sistemas, Contador, Diseñador Gráfico'
  },
  // ✅ NUEVO CAMPO: sector de interés laboral
  sector: {
    type: DataTypes.ENUM(...SECTORES_ENUM),
    allowNull: false, // ✅ OBLIGATORIO en registro
    comment: 'Sector de interés laboral del candidato',
    validate: {
      notEmpty: { msg: 'El sector de interés es obligatorio' },
      isIn: {
        args: [SECTORES_ENUM],
        msg: 'Sector inválido'
      }
    }
  },
  titulo_profesional: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  nivel_educativo: {
    type: DataTypes.ENUM('Secundaria', 'Técnico', 'Licenciatura', 'Maestría', 'Doctorado'),
    allowNull: true
  },
  anios_experiencia: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Los años de experiencia no pueden ser negativos' },
      max: { args: [50], msg: 'Los años de experiencia no pueden exceder 50' }
    }
  },
  estado_laboral: {
    type: DataTypes.ENUM('Empleado', 'Desempleado', 'Busqueda_activa', 'Busqueda_pasiva'),
    defaultValue: 'Busqueda_pasiva'
  },

  disponibilidad: {
    type: DataTypes.ENUM('inmediata', '2_semanas', '1_mes', 'mas_1_mes'),
    defaultValue: 'inmediata'
  },
  modalidad_preferida: {
    type: DataTypes.ENUM('Presencial', 'Remoto', 'Híbrido', 'Indiferente'),
    defaultValue: 'Indiferente'
  },
  salario_esperado_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'En Bs.'
  },
  salario_esperado_max: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'En Bs.'
  },
  resumen_profesional: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Resumen breve del perfil profesional (máx 500 caracteres)'
  },
  cv_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Ruta del CV en el servidor'
  },
  foto_perfil_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  /*linkedin_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: { msg: 'URL de LinkedIn inválida' }
    }
  },
  portfolio_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: { msg: 'URL de portafolio inválida' }
    }
  },*/
  perfil_publico: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si TRUE, las empresas pueden ver el perfil en búsquedas'
  },
  mostrar_telefono: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Permitir que empresas vean el teléfono'
  },
  mostrar_direccion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Permitir que empresas vean la dirección'
  },
  completitud_perfil: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: 'Porcentaje de completitud del perfil (0-100)',
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'candidatos',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['usuario_id'] },
    { fields: ['ci'] },
    { fields: ['profesion'] },
    { fields: ['sector'] }, // ✅ NUEVO ÍNDICE
    { fields: ['departamento'] },
    { fields: ['ciudad'] },
    { fields: ['estado_laboral'] },
    { fields: ['disponibilidad'] },
    { fields: ['perfil_publico'] },
    { fields: ['completitud_perfil'] }
  ]
});

// ============================================
// ASOCIACIONES
// ============================================
Candidato.associate = (models) => {
  // Candidato → Referencias (1:N)
  if (models.Referencia) {
    Candidato.hasMany(models.Referencia, {
      foreignKey: 'candidato_id',
      as: 'referencias',
      onDelete: 'CASCADE'
    });
  }

  // Candidato → Educacion (1:N)
  if (models.Educacion) {
    Candidato.hasMany(models.Educacion, {
      foreignKey: 'candidato_id',
      as: 'educacion',
      onDelete: 'CASCADE'
    });
  }

  // Candidato → ExperienciaLaboral (1:N)
  if (models.ExperienciaLaboral) {
    Candidato.hasMany(models.ExperienciaLaboral, {
      foreignKey: 'candidato_id',
      as: 'experienciaLaboral',
      onDelete: 'CASCADE'
    });
  }

  // Candidato → Habilidades (1:N)
  if (models.Habilidad) {
    Candidato.hasMany(models.Habilidad, {
      foreignKey: 'candidato_id',
      as: 'habilidades',
      onDelete: 'CASCADE'
    });
  }

  // Candidato → Certificaciones (1:N)
  if (models.Certificacion) {
    Candidato.hasMany(models.Certificacion, {
      foreignKey: 'candidato_id',
      as: 'certificaciones',
      onDelete: 'CASCADE'
    });
  }

  // Candidato → Idiomas (1:N)
  if (models.Idioma) {
    Candidato.hasMany(models.Idioma, {
      foreignKey: 'candidato_id',
      as: 'idiomas',
      onDelete: 'CASCADE'
    });
  }

  // Candidato → HistorialLaboral (1:N)
  if (models.HistorialLaboral) {
    Candidato.hasMany(models.HistorialLaboral, {
      foreignKey: 'candidato_id',
      as: 'historialLaboral',
      onDelete: 'CASCADE'
    });
  }

  // Candidato → Postulaciones (1:N)
  if (models.Postulacion) {
    Candidato.hasMany(models.Postulacion, {
      foreignKey: 'candidato_id',
      as: 'postulaciones',
      onDelete: 'CASCADE'
    });
  }

  // Candidato → CandidatoHabilidad (1:N)
  if (models.CandidatoHabilidad) {
    Candidato.hasMany(models.CandidatoHabilidad, {
      foreignKey: 'candidato_id',
      as: 'candidatoHabilidades',
      onDelete: 'CASCADE'
    });
  }

  // Candidato → HabilidadCatalogo (N:M through candidato_habilidades)
  if (models.HabilidadCatalogo && models.CandidatoHabilidad) {
    Candidato.belongsToMany(models.HabilidadCatalogo, {
      through: 'candidato_habilidades',
      foreignKey: 'candidato_id',
      otherKey: 'habilidad_id',
      as: 'habilidadesCatalogo'
    });
  }
};

module.exports = Candidato;