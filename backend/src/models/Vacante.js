// file: backend/src/models/Vacante.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vacante = sequelize.define('Vacante', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    empresa_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'empresas',
        key: 'id'
      }
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El título de la vacante es obligatorio' },
        len: {
          args: [5, 255],
          msg: 'El título debe tener entre 5 y 255 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La descripción es obligatoria' },
        len: {
          args: [50],
          msg: 'La descripción debe tener al menos 50 caracteres'
        }
      }
    },
    
    // ========================================
    // UBICACIÓN Y MODALIDAD
    // ========================================
    pais: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Bolivia'
    },
    departamento: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    modalidad: {
      type: DataTypes.ENUM('presencial', 'remoto', 'hibrido'),
      allowNull: false,
      defaultValue: 'presencial',
      validate: {
        isIn: {
          args: [['presencial', 'remoto', 'hibrido']],
          msg: 'Modalidad inválida'
        }
      }
    },
    
    // ========================================
    // REQUISITOS
    // ========================================
    experiencia_requerida_anios: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'La experiencia no puede ser negativa'
        },
        max: {
          args: [30],
          msg: 'La experiencia no puede superar 30 años'
        }
      }
    },
    nivel_educativo_minimo: {
      type: DataTypes.ENUM('secundaria', 'tecnico', 'licenciatura', 'maestria', 'doctorado'),
      allowNull: true
    },
    
    // ========================================
    // SALARIO
    // ========================================
    salario_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'El salario mínimo no puede ser negativo'
        }
      }
    },
    salario_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'El salario máximo no puede ser negativo'
        },
        esConsistente(value) {
          if (value && this.salario_min && value < this.salario_min) {
            throw new Error('El salario máximo no puede ser menor al mínimo');
          }
        }
      }
    },
    mostrar_salario: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si TRUE, muestra rango salarial públicamente'
    },
    
    // ========================================
    // CONTRATO
    // ========================================
    tipo_contrato: {
      type: DataTypes.ENUM('indefinido', 'plazo_fijo', 'consultoria', 'pasantia', 'freelance'),
      allowNull: true,
      defaultValue: 'indefinido'
    },
    jornada: {
      type: DataTypes.ENUM('tiempo_completo', 'medio_tiempo', 'por_horas'),
      allowNull: true,
      defaultValue: 'tiempo_completo',
      field: 'jornada_laboral'
    },
    
    // ========================================
    // ESTADO Y FECHAS
    // ========================================
    estado: {
      type: DataTypes.ENUM('borrador', 'abierta', 'pausada', 'cerrada'),
      allowNull: false,
      defaultValue: 'abierta',
      validate: {
        isIn: {
          args: [['borrador', 'abierta', 'pausada', 'cerrada']],
          msg: 'Estado inválido'
        }
      }
    },
    fecha_publicacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    fecha_cierre: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha límite para postulaciones'
    },
    
    // ========================================
    // CONTADORES
    // ========================================
    vacantes_disponibles: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'Debe haber al menos 1 vacante disponible'
        }
      }
    },
    postulaciones_recibidas: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: 'Contador automático de postulaciones'
    },
    
    // ========================================
    // CONTACTO
    // ========================================
    contacto_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: { msg: 'Email de contacto inválido' }
      }
    },
    contacto_telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    tableName: 'vacantes',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['empresa_id'] },
      { fields: ['estado'] },
      { fields: ['fecha_publicacion'] },
      { fields: ['departamento', 'ciudad'] },
      { fields: ['modalidad'] },
      { fields: ['estado', 'fecha_publicacion', 'modalidad'] } // Índice compuesto para búsquedas
    ]
  });

  // ============================================
  // ASOCIACIONES
  // ============================================
  Vacante.associate = (models) => {
    // Empresa ← Vacante
    if (models.Empresa) {
      Vacante.belongsTo(models.Empresa, {
        foreignKey: 'empresa_id',
        as: 'empresa'
      });
    }

    // Vacante → Postulaciones (1:N)
    if (models.Postulacion) {
      Vacante.hasMany(models.Postulacion, {
        foreignKey: 'vacante_id',
        as: 'postulaciones',
        onDelete: 'CASCADE'
      });
    }

    // Vacante ↔ HabilidadCatalogo (N:M)
    if (models.HabilidadCatalogo) {
      Vacante.belongsToMany(models.HabilidadCatalogo, {
        through: 'vacante_habilidades',
        foreignKey: 'vacante_id',
        otherKey: 'habilidad_id',
        as: 'habilidades'
      });
    }

    // Vacante → VacanteHabilidad (relación directa con tabla intermedia)
    if (models.VacanteHabilidad) {
      Vacante.hasMany(models.VacanteHabilidad, {
        foreignKey: 'vacante_id',
        as: 'habilidadesRequeridas',
        onDelete: 'CASCADE'
      });
    }
  };

  // ============================================
  // MÉTODOS ESTÁTICOS
  // ============================================
  
  /**
   * Buscar vacantes abiertas con filtros
   */
  Vacante.buscar = async function(filtros = {}) {
    const { Op } = require('sequelize');
    const where = { estado: 'abierta' };
    
    if (filtros.departamento) {
      where.departamento = filtros.departamento;
    }
    
    if (filtros.ciudad) {
      where.ciudad = filtros.ciudad;
    }
    
    if (filtros.modalidad) {
      where.modalidad = filtros.modalidad;
    }
    
    if (filtros.titulo) {
      where.titulo = {
        [Op.like]: `%${filtros.titulo}%`
      };
    }
    
    if (filtros.salario_min) {
      where.salario_max = {
        [Op.gte]: filtros.salario_min
      };
    }

    return await this.findAll({
      where,
      include: [
        {
          model: sequelize.models.Empresa,
          as: 'empresa',
          attributes: ['id', 'razon_social', 'sector', 'logo_url']
        },
        {
          model: sequelize.models.VacanteHabilidad,
          as: 'habilidadesRequeridas',
          include: [
            {
              model: sequelize.models.HabilidadCatalogo,
              as: 'habilidad',
              attributes: ['id', 'nombre', 'categoria']
            }
          ]
        }
      ],
      order: [['fecha_publicacion', 'DESC']],
      limit: filtros.limite || 20
    });
  };

  /**
   * Obtener vacantes de una empresa
   */
  Vacante.porEmpresa = async function(empresaId, incluirCerradas = false) {
    const where = { empresa_id: empresaId };
    
    if (!incluirCerradas) {
      where.estado = { [require('sequelize').Op.ne]: 'cerrada' };
    }

    return await this.findAll({
      where,
      include: [
        {
          model: sequelize.models.VacanteHabilidad,
          as: 'habilidadesRequeridas',
          include: [
            {
              model: sequelize.models.HabilidadCatalogo,
              as: 'habilidad'
            }
          ]
        }
      ],
      order: [
        ['estado', 'ASC'], // Abiertas primero
        ['fecha_publicacion', 'DESC']
      ]
    });
  };

  // ============================================
  // MÉTODOS DE INSTANCIA
  // ============================================
  
  /**
   * Verificar si la vacante está activa
   */
  Vacante.prototype.estaActiva = function() {
    if (this.estado !== 'abierta') return false;
    
    if (this.fecha_cierre) {
      const hoy = new Date();
      const cierre = new Date(this.fecha_cierre);
      if (hoy > cierre) return false;
    }
    
    return true;
  };

  /**
   * Cerrar vacante
   */
  Vacante.prototype.cerrar = async function() {
    this.estado = 'cerrada';
    await this.save();
  };

  /**
   * Pausar vacante
   */
  Vacante.prototype.pausar = async function() {
    if (this.estado !== 'abierta') {
      throw new Error('Solo se pueden pausar vacantes abiertas');
    }
    this.estado = 'pausada';
    await this.save();
  };

  /**
   * Reabrir vacante
   */
  Vacante.prototype.reabrir = async function() {
    if (this.estado !== 'pausada' && this.estado !== 'cerrada') {
      throw new Error('Solo se pueden reabrir vacantes pausadas o cerradas');
    }
    this.estado = 'abierta';
    this.fecha_publicacion = new Date();
    await this.save();
  };

  /**
   * Incrementar contador de postulaciones
   */
  Vacante.prototype.incrementarPostulaciones = async function() {
    this.postulaciones_recibidas = (this.postulaciones_recibidas || 0) + 1;
    await this.save();
  };

  /**
   * Calcular días restantes para cierre
   */
  Vacante.prototype.diasRestantes = function() {
    if (!this.fecha_cierre) return null;
    
    const hoy = new Date();
    const cierre = new Date(this.fecha_cierre);
    const diferencia = cierre - hoy;
    
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  return Vacante;
};