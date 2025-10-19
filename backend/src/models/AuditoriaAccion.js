// file: backend/src/models/AuditoriaAccion.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditoriaAccion = sequelize.define('AuditoriaAccion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    accion: {
      type: DataTypes.ENUM(
        'CREAR', 'LEER', 'ACTUALIZAR', 'ELIMINAR',
        'LOGIN', 'LOGOUT', 'CAMBIO_ROL',
        'UPLOAD_ARCHIVO', 'DESCARGA_ARCHIVO',
        'APROBACION', 'RECHAZO', 'VERIFICACION'
      ),
      allowNull: false
    },
    entidad_tipo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Tabla afectada (ej: candidatos, empresas)'
    },
    entidad_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID del registro afectado'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IPv4 o IPv6'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cambios_antes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON del estado anterior'
    },
    cambios_despues: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON del estado nuevo'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resultado: {
      type: DataTypes.ENUM('EXITO', 'FALLIDO', 'BLOQUEADO'),
      defaultValue: 'EXITO'
    }
  }, {
    tableName: 'auditoria_acciones',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['usuario_id'] },
      { fields: ['accion'] },
{ fields: ['entidad_tipo', 'entidad_id'] },
{ fields: ['created_at'] },
{ fields: ['resultado'] }
]
});
AuditoriaAccion.associate = (models) => {
AuditoriaAccion.belongsTo(models.Usuario, {
foreignKey: 'usuario_id',
as: 'usuario'
});
};
return AuditoriaAccion;
};