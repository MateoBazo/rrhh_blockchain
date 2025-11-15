// file: backend/src/models/HistorialLaboral.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HistorialLaboral = sequelize.define('HistorialLaboral', {
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
    empresa_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'empresas',
        key: 'id'
      }
    },
    empresa_nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre de la empresa es obligatorio' }
      }
    },
    empresa_nit: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    cargo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El cargo es obligatorio' },
        len: {
          args: [2, 200],
          msg: 'El cargo debe tener entre 2 y 200 caracteres'
        }
      }
    },
    departamento: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Departamento/área dentro de la empresa'
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Fecha de inicio inválida' }
      }
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'NULL indica que trabaja actualmente'
    },
    actualmente_trabajando: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'TRUE si aún trabaja en esta empresa'
    },
    descripcion_responsabilidades: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Debe describir las responsabilidades' }
      }
    },
    logros_principales: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Logros cuantificables y específicos'
    },
    razon_salida: {
      type: DataTypes.ENUM(
        'renuncia_voluntaria',
        'finalizacion_contrato',
        'despido',
        'mutuo_acuerdo',
        'cierre_empresa',
        'otro'
      ),
      allowNull: true
    },
    salario_mensual: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Cifrado en producción por privacidad'
    },
    tipo_contrato: {
      type: DataTypes.ENUM('indefinido', 'plazo_fijo', 'consultoria', 'pasantia', 'otro'),
      allowNull: true,
      defaultValue: 'indefinido'
    },
    
    // ========================================
    // 🔐 CAMPOS DE VERIFICACIÓN BIDIRECCIONAL
    // ========================================
    verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '⚠️ DEPRECATED - Usar campo estado'
    },
    estado: {
      type: DataTypes.ENUM(
        'PENDIENTE_ACEPTACION',
        'ACEPTADO',
        'RECHAZADO',
        'EXPIRADO'
      ),
      allowNull: false,
      defaultValue: 'PENDIENTE_ACEPTACION',
      comment: 'Estado de verificación bidireccional empresa↔empleado'
    },
    fecha_verificacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '⚠️ DEPRECATED - Usar fecha_respuesta_empleado'
    },
    fecha_certificacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha en que empresa certificó la experiencia'
    },
    fecha_respuesta_empleado: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que empleado aceptó/rechazó'
    },
    ip_respuesta: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP desde donde empleado respondió (IPv4/IPv6)'
    },
    user_agent_respuesta: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent del navegador (auditoría)'
    },
    motivo_rechazo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Razón del empleado para rechazar certificación'
    },
    notificacion_enviada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si se envió email notificación al empleado'
    },
    fecha_notificacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de envío de email'
    },
    
    // ========================================
    // OTROS CAMPOS
    // ========================================
    verificado_por_usuario_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Usuario empresa que verificó'
    },
    archivo_certificado_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Ruta al certificado laboral escaneado'
    },
    hash_documento: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: true,
      comment: 'SHA-256 del certificado para integridad'
    }
  }, {
    tableName: 'historial_laboral',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['candidato_id'] },
      { fields: ['empresa_id'] },
      { fields: ['estado'] },
      { fields: ['fecha_inicio'] },
      { fields: ['actualmente_trabajando'] },
      { fields: ['candidato_id', 'estado'] }
    ]
  });

  // ============================================
  // ASOCIACIONES
  // ============================================
  HistorialLaboral.associate = (models) => {
    // Candidato ← HistorialLaboral
    if (models.Candidato) {
      HistorialLaboral.belongsTo(models.Candidato, {
        foreignKey: 'candidato_id',
        as: 'candidato'
      });
    }

    // Empresa ← HistorialLaboral
    if (models.Empresa) {
      HistorialLaboral.belongsTo(models.Empresa, {
        foreignKey: 'empresa_id',
        as: 'empresa'
      });
    }

    // Usuario ← HistorialLaboral (quien verificó)
    if (models.Usuario) {
      HistorialLaboral.belongsTo(models.Usuario, {
        foreignKey: 'verificado_por_usuario_id',
        as: 'verificador'
      });
    }
  };

  // ============================================
  // MÉTODOS ESTÁTICOS
  // ============================================
  
  /**
   * Obtener historial verificado de un candidato
   */
  HistorialLaboral.porCandidatoVerificado = async function(candidatoId) {
    return await this.findAll({
      where: { 
        candidato_id: candidatoId,
        estado: 'ACEPTADO'
      },
      include: [
        {
          model: sequelize.models.Empresa,
          as: 'empresa',
          attributes: ['id', 'razon_social', 'sector', 'logo_url'],
          required: false
        }
      ],
      order: [
        ['actualmente_trabajando', 'DESC'],
        ['fecha_inicio', 'DESC']
      ]
    });
  };

  /**
   * Obtener empleados certificados por una empresa
   */
  HistorialLaboral.porEmpresa = async function(empresaId, soloVerificados = true) {
    const where = { empresa_id: empresaId };
    if (soloVerificados) {
      where.estado = 'ACEPTADO';
    }

    return await this.findAll({
      where,
      include: [
        {
          model: sequelize.models.Candidato,
          as: 'candidato',
          attributes: ['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'foto_perfil_url'],
          required: false
        }
      ],
      order: [['fecha_inicio', 'DESC']]
    });
  };

  // ============================================
  // MÉTODOS DE INSTANCIA
  // ============================================
  
  /**
   * Calcular duración en meses
   */
  HistorialLaboral.prototype.calcularDuracionMeses = function() {
    const inicio = new Date(this.fecha_inicio);
    const fin = this.fecha_fin ? new Date(this.fecha_fin) : new Date();
    
    const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + 
                  (fin.getMonth() - inicio.getMonth());
    
    return Math.max(0, meses);
  };

  /**
   * Calcular duración en años (decimal)
   */
  HistorialLaboral.prototype.calcularDuracionAnios = function() {
    return (this.calcularDuracionMeses() / 12).toFixed(1);
  };

  /**
   * Verificar si puede ser editado
   */
  HistorialLaboral.prototype.puedeEditar = function() {
    return this.estado === 'PENDIENTE_ACEPTACION';
  };

  /**
   * Verificar si está inmutable
   */
  HistorialLaboral.prototype.esInmutable = function() {
    return this.estado === 'ACEPTADO';
  };

  /**
   * Aceptar certificación (empleado)
   */
  HistorialLaboral.prototype.aceptar = async function(ipAddress, userAgent) {
    if (this.estado !== 'PENDIENTE_ACEPTACION') {
      throw new Error('Solo se pueden aceptar certificaciones pendientes');
    }

    this.estado = 'ACEPTADO';
    this.fecha_respuesta_empleado = new Date();
    this.ip_respuesta = ipAddress;
    this.user_agent_respuesta = userAgent;
    
    await this.save();
    return this;
  };

  /**
   * Rechazar certificación (empleado)
   */
  HistorialLaboral.prototype.rechazar = async function(motivo, ipAddress, userAgent) {
    if (this.estado !== 'PENDIENTE_ACEPTACION') {
      throw new Error('Solo se pueden rechazar certificaciones pendientes');
    }

    this.estado = 'RECHAZADO';
    this.fecha_respuesta_empleado = new Date();
    this.motivo_rechazo = motivo;
    this.ip_respuesta = ipAddress;
    this.user_agent_respuesta = userAgent;
    
    await this.save();
    return this;
  };

  return HistorialLaboral;
};