// file: backend/src/models/Candidato.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Candidato = sequelize.define('candidatos', {
  // ... (mantener todos los campos existentes) ...
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
  // ... (resto de campos) ...
  ci: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  nombres: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido_paterno: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido_materno: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  fecha_nacimiento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  genero: {
    type: DataTypes.ENUM('Masculino', 'Femenino', 'Otro', 'Prefiero no decir'),
    allowNull: true
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
    allowNull: true
  },
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  profesion: {
    type: DataTypes.STRING(150),
    allowNull: true
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
    allowNull: true,
    defaultValue: 0
  },
  estado_laboral: {
    type: DataTypes.ENUM('Empleado','Desempleado','Busqueda_activa','Busqueda_pasiva'),
    allowNull: true
  },
  disponibilidad: {
    type: DataTypes.ENUM('inmediata','2_semanas','1_mes','mas_1_mes'),
    allowNull: true
  },
  modalidad_preferida: {
    type: DataTypes.ENUM('Presencial', 'Remoto', 'Híbrido', 'Indiferente'),
    allowNull: true
  },
  salario_esperado_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salario_esperado_max: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  resumen_profesional: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cv_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  foto_perfil_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  perfil_publico: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  mostrar_telefono: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mostrar_direccion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completitud_perfil: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'candidatos',
  timestamps: true,
  underscored: true
});

// ============================================
// ASOCIACIONES
// ============================================
Candidato.associate = (models) => {
  // ❌ NO DEFINIR Candidato -> Usuario AQUÍ (ya está en index.js)
  // Candidato.belongsTo(models.Usuario, {
  //   foreignKey: 'usuario_id',
  //   as: 'usuario'
  // });

  // ✅ SOLO DEFINIR LAS ASOCIACIONES QUE NO ESTÁN EN index.js

  // Candidato -> Referencias (1:N)
  if (models.Referencia) {
    Candidato.hasMany(models.Referencia, {
      foreignKey: 'candidato_id',
      as: 'referencias',
      onDelete: 'CASCADE'
    });
  }

  // Candidato -> Educacion (1:N)
  if (models.Educacion) {
    Candidato.hasMany(models.Educacion, {
      foreignKey: 'candidato_id',
      as: 'educacion',
      onDelete: 'CASCADE'
    });
  }

  // Candidato -> ExperienciaLaboral (1:N)
  if (models.ExperienciaLaboral) {
    Candidato.hasMany(models.ExperienciaLaboral, {
      foreignKey: 'candidato_id',
      as: 'experienciaLaboral',
      onDelete: 'CASCADE'
    });
  }

  // Candidato -> Habilidad (1:N)
  if (models.Habilidad) {
    Candidato.hasMany(models.Habilidad, {
      foreignKey: 'candidato_id',
      as: 'habilidades',
      onDelete: 'CASCADE'
    });
  }

  // Candidato -> Certificacion (1:N)
  if (models.Certificacion) {
    Candidato.hasMany(models.Certificacion, {
      foreignKey: 'candidato_id',
      as: 'certificaciones',
      onDelete: 'CASCADE'
    });
  }

  // Candidato -> Idioma (1:N)
  if (models.Idioma) {
    Candidato.hasMany(models.Idioma, {
      foreignKey: 'candidato_id',
      as: 'idiomas',
      onDelete: 'CASCADE'
    });
  }

  // Candidato -> Documento (1:N)
  if (models.Documento) {
    Candidato.hasMany(models.Documento, {
      foreignKey: 'candidato_id',
      as: 'documentos',
      onDelete: 'CASCADE'
    });
  }

  // Candidato -> ContratoLaboral (1:N)
  if (models.ContratoLaboral) {
    Candidato.hasMany(models.ContratoLaboral, {
      foreignKey: 'candidato_id',
      as: 'contratos',
      onDelete: 'SET NULL'
    });
  }

  // Candidato -> AccesoReferencia (1:N)
  if (models.AccesoReferencia) {
    Candidato.hasMany(models.AccesoReferencia, {
      foreignKey: 'candidato_id',
      as: 'accesos_referencias',
      onDelete: 'CASCADE'
    });
  }
};

module.exports = Candidato;