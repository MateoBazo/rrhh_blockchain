// file: backend/src/models/Candidato.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Candidato = sequelize.define('candidatos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: { // 👈 FK a usuarios
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
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
    type: DataTypes.ENUM('M', 'F', 'Otro', 'Prefiero no decir'),
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
    type: DataTypes.ENUM('Secundaria', 'Técnico', 'Universitario', 'Postgrado', 'Maestría', 'Doctorado'),
    allowNull: true
  },
  anios_experiencia: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  estado_laboral: {
    type: DataTypes.ENUM('Empleado', 'Desempleado', 'Buscando', 'Freelance', 'Estudiante'),
    allowNull: true
  },
  disponibilidad: {
    type: DataTypes.ENUM('Inmediata', '15 días', '1 mes', '2 meses', 'No disponible'),
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
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  }
  // created_at y updated_at automáticos
}, {
  tableName: 'candidatos',
  timestamps: true,
  underscored: true
});

module.exports = Candidato;//.