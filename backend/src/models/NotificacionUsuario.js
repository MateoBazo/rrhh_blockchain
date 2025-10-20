// file: backend/src/models/NotificacionUsuario.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotificacionUsuario = sequelize.define('NotificacionUsuario', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,  
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER.UNSIGNED,  
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    tipo: {
      type: DataTypes.ENUM(
        'INFO', 'ADVERTENCIA', 'ERROR', 'EXITO',
        'NUEVO_CONTRATO', 'VENCIMIENTO_DOCUMENTO',
        'SOLICITUD_VERIFICACION', 'CAMBIO_ESTADO'
      ),
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    fecha_lectura: {
      type: DataTypes.DATE,
      allowNull: true
    },
    url_accion: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL para redirigir al hacer clic'
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON con datos adicionales'
    },
    prioridad: {
      type: DataTypes.ENUM('BAJA', 'MEDIA', 'ALTA', 'CRITICA'),
      defaultValue: 'MEDIA'
    }
  }, {
    tableName: 'notificaciones_usuario',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['usuario_id'] },
      { fields: ['leida'] },
      { fields: ['tipo'] },
      { fields: ['prioridad'] },
      { fields: ['created_at'] }
    ]
  });

  NotificacionUsuario.associate = (models) => {
    NotificacionUsuario.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
  };

  return NotificacionUsuario;
};