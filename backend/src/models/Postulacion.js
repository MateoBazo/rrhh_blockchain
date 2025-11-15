// file: backend/src/models/Postulacion.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Postulacion = sequelize.define('Postulacion', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    vacante_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'vacantes',
        key: 'id'
      }
    },
    candidato_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'candidatos',
        key: 'id'
      }
    },
    
    // ========================================
    // ESTADO DEL PROCESO
    // ========================================
    estado: {
      type: DataTypes.ENUM(
        'postulado',
        'revisado',
        'preseleccionado',
        'entrevista_agendada',
        'entrevista_realizada',
        'rechazado',
        'contratado',
        'retirado'
      ),
      allowNull: false,
      defaultValue: 'postulado',
      comment: 'Estado actual en el proceso de selección'
    },
    fecha_postulacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    fecha_ultima_actualizacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    
    // ========================================
    // MATCHING Y RANKING
    // ========================================
    score_compatibilidad: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'El score mínimo es 0'
        },
        max: {
          args: [100],
          msg: 'El score máximo es 100'
        }
      },
      comment: 'Score de compatibilidad 0-100 calculado por algoritmo'
    },
    desglose_scoring: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Desglose detallado del cálculo de score'
    },
    ranking_posicion: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Posición en el ranking de postulantes de esta vacante'
    },
    
    // ========================================
    // DOCUMENTOS DE POSTULACIÓN
    // ========================================
    carta_presentacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Carta de presentación o motivación'
    },
    cv_postulacion_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'CV específico para esta postulación (opcional)'
    },
    
    // ========================================
    // NOTAS Y SEGUIMIENTO
    // ========================================
    notas_empresa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas internas del reclutador (no visibles para candidato)'
    },
    fecha_entrevista: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resultado_entrevista: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Feedback de la entrevista'
    },
    
    // ========================================
    // TRACKING DE VISUALIZACIÓN
    // ========================================
    visto_por_empresa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si la empresa vio la postulación'
    },
    fecha_visto: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que empresa vio por primera vez'
    }
  }, {
    tableName: 'postulaciones',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['vacante_id'] },
      { fields: ['candidato_id'] },
      { fields: ['estado'] },
      { fields: ['score_compatibilidad'], order: 'DESC' },
      { fields: ['vacante_id', 'ranking_posicion'] },
      { 
        fields: ['vacante_id', 'candidato_id'],
        unique: true,
        name: 'unique_postulacion'
      }
    ]
  });

  // ============================================
  // ASOCIACIONES
  // ============================================
  Postulacion.associate = (models) => {
    // Vacante ← Postulacion
    if (models.Vacante) {
      Postulacion.belongsTo(models.Vacante, {
        foreignKey: 'vacante_id',
        as: 'vacante'
      });
    }

    // Candidato ← Postulacion
    if (models.Candidato) {
      Postulacion.belongsTo(models.Candidato, {
        foreignKey: 'candidato_id',
        as: 'candidato'
      });
    }
  };

  // ============================================
  // HOOKS
  // ============================================
  Postulacion.addHook('beforeUpdate', (postulacion) => {
    postulacion.fecha_ultima_actualizacion = new Date();
  });

  // ============================================
  // MÉTODOS ESTÁTICOS
  // ============================================
  
  /**
   * Obtener postulaciones de un candidato
   */
  Postulacion.porCandidato = async function(candidatoId) {
    return await this.findAll({
      where: { candidato_id: candidatoId },
      include: [
        {
          model: sequelize.models.Vacante,
          as: 'vacante',
          include: [
            {
              model: sequelize.models.Empresa,
              as: 'empresa',
              attributes: ['id', 'razon_social', 'sector', 'logo_url']
            }
          ]
        }
      ],
      order: [['fecha_postulacion', 'DESC']]
    });
  };

  /**
   * Obtener postulaciones de una vacante ordenadas por score
   */
  Postulacion.porVacante = async function(vacanteId, soloActivas = true) {
    const where = { vacante_id: vacanteId };
    
    if (soloActivas) {
      where.estado = {
        [require('sequelize').Op.notIn]: ['rechazado', 'retirado']
      };
    }

    return await this.findAll({
      where,
      include: [
        {
          model: sequelize.models.Candidato,
          as: 'candidato',
          attributes: [
            'id', 'nombres', 'apellido_paterno', 'apellido_materno',
            'foto_perfil_url', 'profesion', 'anios_experiencia',
            'departamento', 'ciudad'
          ]
        }
      ],
      order: [
        ['score_compatibilidad', 'DESC'],
        ['fecha_postulacion', 'ASC']
      ]
    });
  };

  /**
   * Verificar si candidato ya postuló a vacante
   */
  Postulacion.yaPostulo = async function(vacanteId, candidatoId) {
    const postulacion = await this.findOne({
      where: { vacante_id: vacanteId, candidato_id: candidatoId }
    });
    return !!postulacion;
  };

  // ============================================
  // MÉTODOS DE INSTANCIA
  // ============================================
  
  /**
   * Cambiar estado de la postulación
   */
  Postulacion.prototype.cambiarEstado = async function(nuevoEstado, notas = null) {
    const estadosValidos = [
      'postulado', 'revisado', 'preseleccionado', 
      'entrevista_agendada', 'entrevista_realizada',
      'rechazado', 'contratado', 'retirado'
    ];

    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error(`Estado inválido: ${nuevoEstado}`);
    }

    this.estado = nuevoEstado;
    
    if (notas) {
      this.notas_empresa = this.notas_empresa 
        ? `${this.notas_empresa}\n\n[${new Date().toISOString()}] ${notas}`
        : notas;
    }

    await this.save();
    return this;
  };

  /**
   * Marcar como visto por empresa
   */
  Postulacion.prototype.marcarVisto = async function() {
    if (!this.visto_por_empresa) {
      this.visto_por_empresa = true;
      this.fecha_visto = new Date();
      await this.save();
    }
  };

  /**
   * Agendar entrevista
   */
  Postulacion.prototype.agendarEntrevista = async function(fecha, notas = null) {
    this.estado = 'entrevista_agendada';
    this.fecha_entrevista = fecha;
    
    if (notas) {
      this.notas_empresa = this.notas_empresa 
        ? `${this.notas_empresa}\n\n[ENTREVISTA] ${notas}`
        : `[ENTREVISTA] ${notas}`;
    }

    await this.save();
    return this;
  };

  /**
   * Registrar resultado de entrevista
   */
  Postulacion.prototype.registrarEntrevista = async function(resultado, nuevoEstado = 'entrevista_realizada') {
    this.estado = nuevoEstado;
    this.resultado_entrevista = resultado;
    await this.save();
    return this;
  };

  /**
   * Retirar postulación (por candidato)
   */
  Postulacion.prototype.retirar = async function(motivo = null) {
    this.estado = 'retirado';
    
    if (motivo) {
      this.notas_empresa = this.notas_empresa 
        ? `${this.notas_empresa}\n\n[RETIRADO POR CANDIDATO] ${motivo}`
        : `[RETIRADO POR CANDIDATO] ${motivo}`;
    }

    await this.save();
    return this;
  };

  /**
   * Calcular antigüedad de la postulación en días
   */
  Postulacion.prototype.diasDesdePostulacion = function() {
    const ahora = new Date();
    const diferencia = ahora - new Date(this.fecha_postulacion);
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  };

  return Postulacion;
};