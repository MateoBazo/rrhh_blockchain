// file: backend/src/models/VacanteHabilidad.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VacanteHabilidad = sequelize.define('VacanteHabilidad', {
    vacante_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'vacantes',
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
    nivel_minimo_requerido: {
      type: DataTypes.ENUM('basico', 'intermedio', 'avanzado', 'experto'),
      allowNull: false,
      defaultValue: 'intermedio',
      validate: {
        isIn: {
          args: [['basico', 'intermedio', 'avanzado', 'experto']],
          msg: 'Nivel mínimo inválido'
        }
      }
    },
    obligatoria: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: 'Si TRUE, es requisito obligatorio. Si FALSE, es deseable'
    },
    peso_ponderacion: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 10,
      validate: {
        min: {
          args: [1],
          msg: 'El peso mínimo es 1'
        },
        max: {
          args: [100],
          msg: 'El peso máximo es 100'
        }
      },
      comment: 'Peso en algoritmo de matching (1-100)'
    }
  }, {
    tableName: 'vacante_habilidades',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['vacante_id'] },
      { fields: ['habilidad_id'] },
      { fields: ['obligatoria'] }
    ]
  });

  // ============================================
  // ASOCIACIONES
  // ============================================
  VacanteHabilidad.associate = (models) => {
    // Relación con Vacante
    if (models.Vacante) {
      VacanteHabilidad.belongsTo(models.Vacante, {
        foreignKey: 'vacante_id',
        as: 'vacante'
      });
    }

    // Relación con HabilidadCatalogo
    if (models.HabilidadCatalogo) {
      VacanteHabilidad.belongsTo(models.HabilidadCatalogo, {
        foreignKey: 'habilidad_id',
        as: 'habilidad'
      });
    }
  };

  // ============================================
  // MÉTODOS ESTÁTICOS
  // ============================================
  
  /**
   * Agregar habilidad a vacante con configuración
   */
  VacanteHabilidad.agregarHabilidad = async function(vacanteId, habilidadId, config = {}) {
    const {
      nivel_minimo_requerido = 'intermedio',
      obligatoria = true,
      peso_ponderacion = 10
    } = config;

    // Verificar si ya existe
    const existe = await this.findOne({
      where: { vacante_id: vacanteId, habilidad_id: habilidadId }
    });

    if (existe) {
      // Actualizar configuración
      existe.nivel_minimo_requerido = nivel_minimo_requerido;
      existe.obligatoria = obligatoria;
      existe.peso_ponderacion = peso_ponderacion;
      await existe.save();
      return existe;
    }

    // Crear nueva relación
    return await this.create({
      vacante_id: vacanteId,
      habilidad_id: habilidadId,
      nivel_minimo_requerido,
      obligatoria,
      peso_ponderacion
    });
  };

  /**
   * Obtener habilidades de una vacante
   */
  VacanteHabilidad.porVacante = async function(vacanteId) {
    return await this.findAll({
      where: { vacante_id: vacanteId },
      include: [
        {
          model: sequelize.models.HabilidadCatalogo,
          as: 'habilidad',
          where: { activa: true },
          required: true
        }
      ],
      order: [
        ['obligatoria', 'DESC'], // Obligatorias primero
        ['peso_ponderacion', 'DESC']
      ]
    });
  };

  /**
   * Obtener habilidades obligatorias de una vacante
   */
  VacanteHabilidad.obligatoriasPorVacante = async function(vacanteId) {
    return await this.findAll({
      where: { 
        vacante_id: vacanteId,
        obligatoria: true
      },
      include: [
        {
          model: sequelize.models.HabilidadCatalogo,
          as: 'habilidad'
        }
      ]
    });
  };

  // ============================================
  // MÉTODOS DE INSTANCIA
  // ============================================
  
  /**
   * Verificar si el nivel del candidato cumple el requisito
   */
  VacanteHabilidad.prototype.cumpleNivel = function(nivelCandidato) {
    const niveles = {
      'basico': 1,
      'intermedio': 2,
      'avanzado': 3,
      'experto': 4
    };
    
    return niveles[nivelCandidato] >= niveles[this.nivel_minimo_requerido];
  };

  /**
   * Marcar como opcional
   */
  VacanteHabilidad.prototype.marcarOpcional = async function() {
    this.obligatoria = false;
    await this.save();
  };

  /**
   * Aumentar peso
   */
  VacanteHabilidad.prototype.aumentarPeso = async function(incremento = 5) {
    this.peso_ponderacion = Math.min(100, this.peso_ponderacion + incremento);
    await this.save();
  };

  return VacanteHabilidad;
};