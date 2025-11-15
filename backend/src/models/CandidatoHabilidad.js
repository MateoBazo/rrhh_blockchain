// file: backend/src/models/CandidatoHabilidad.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CandidatoHabilidad = sequelize.define('CandidatoHabilidad', {
    candidato_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'candidatos',
        key: 'id'
      }
    },
    habilidad_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'habilidades',
        key: 'id'
      }
    },
    nivel_dominio: {
      type: DataTypes.ENUM('basico', 'intermedio', 'avanzado', 'experto'),
      allowNull: false,
      defaultValue: 'intermedio',
      validate: {
        isIn: {
          args: [['basico', 'intermedio', 'avanzado', 'experto']],
          msg: 'Nivel de dominio inválido'
        }
      }
    },
    anios_experiencia: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Los años de experiencia no pueden ser negativos'
        },
        max: {
          args: [50],
          msg: 'Los años de experiencia no pueden superar 50'
        }
      }
    },
    ultima_vez_usado: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Última vez que usó la habilidad profesionalmente'
    },
    certificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si tiene certificación oficial de la habilidad'
    }
  }, {
    tableName: 'candidato_habilidades',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['habilidad_id'] },
      { fields: ['nivel_dominio'] },
      { fields: ['anios_experiencia'] }
    ]
  });

  // ============================================
  // ASOCIACIONES
  // ============================================
  CandidatoHabilidad.associate = (models) => {
    // Relación con Candidato
    if (models.Candidato) {
      CandidatoHabilidad.belongsTo(models.Candidato, {
        foreignKey: 'candidato_id',
        as: 'candidato'
      });
    }

    // Relación con HabilidadCatalogo
    if (models.HabilidadCatalogo) {
      CandidatoHabilidad.belongsTo(models.HabilidadCatalogo, {
        foreignKey: 'habilidad_id',
        as: 'habilidad'
      });
    }
  };

  // ============================================
  // MÉTODOS ESTÁTICOS
  // ============================================
  
  /**
   * Agregar habilidad a candidato
   */
  CandidatoHabilidad.agregarHabilidad = async function(candidatoId, habilidadId, datos) {
    const { nivel_dominio = 'intermedio', anios_experiencia = 0, certificado = false } = datos;

    // Verificar si ya existe
    const existe = await this.findOne({
      where: { candidato_id: candidatoId, habilidad_id: habilidadId }
    });

    if (existe) {
      // Actualizar si ya existe
      existe.nivel_dominio = nivel_dominio;
      existe.anios_experiencia = anios_experiencia;
      existe.certificado = certificado;
      existe.ultima_vez_usado = new Date();
      await existe.save();
      return existe;
    }

    // Crear nueva relación
    return await this.create({
      candidato_id: candidatoId,
      habilidad_id: habilidadId,
      nivel_dominio,
      anios_experiencia,
      certificado,
      ultima_vez_usado: new Date()
    });
  };

  /**
   * Obtener habilidades de un candidato con detalles
   */
  CandidatoHabilidad.porCandidato = async function(candidatoId) {
    return await this.findAll({
      where: { candidato_id: candidatoId },
      include: [
        {
          model: sequelize.models.HabilidadCatalogo,
          as: 'habilidad',
          where: { activa: true },
          required: true
        }
      ],
      order: [
        ['nivel_dominio', 'DESC'], // Experto primero
        ['anios_experiencia', 'DESC']
      ]
    });
  };

  // ============================================
  // MÉTODOS DE INSTANCIA
  // ============================================
  
  CandidatoHabilidad.prototype.subirNivel = async function() {
    const niveles = ['basico', 'intermedio', 'avanzado', 'experto'];
    const indiceActual = niveles.indexOf(this.nivel_dominio);
    
    if (indiceActual < niveles.length - 1) {
      this.nivel_dominio = niveles[indiceActual + 1];
      await this.save();
      return true;
    }
    return false; // Ya está en nivel máximo
  };

  CandidatoHabilidad.prototype.obtenerPorcentajeCompetencia = function() {
    const niveles = {
      'basico': 25,
      'intermedio': 50,
      'avanzado': 75,
      'experto': 100
    };
    return niveles[this.nivel_dominio] || 0;
  };

  return CandidatoHabilidad;
};