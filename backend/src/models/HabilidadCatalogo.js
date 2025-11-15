// file: backend/src/models/HabilidadCatalogo.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HabilidadCatalogo = sequelize.define('HabilidadCatalogo', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: {
        msg: 'Ya existe una habilidad con este nombre'
      },
      validate: {
        notEmpty: { msg: 'El nombre de la habilidad es obligatorio' },
        len: {
          args: [2, 150],
          msg: 'El nombre debe tener entre 2 y 150 caracteres'
        }
      }
    },
    categoria: {
      type: DataTypes.ENUM('tecnica', 'blanda', 'idioma', 'herramienta', 'certificacion'),
      allowNull: false,
      defaultValue: 'tecnica',
      validate: {
        isIn: {
          args: [['tecnica', 'blanda', 'idioma', 'herramienta', 'certificacion']],
          msg: 'Categoría inválida'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    demanda_mercado: {
      type: DataTypes.ENUM('baja', 'media', 'alta', 'muy_alta'),
      allowNull: true,
      defaultValue: 'media',
      comment: 'Demanda actual en el mercado laboral'
    },
    activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si FALSE, la habilidad está obsoleta/deprecated'
    }
  }, {
    tableName: 'habilidades',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['nombre'] },
      { fields: ['categoria'] },
      { fields: ['demanda_mercado'] },
      { fields: ['activa'] }
    ]
  });

  // ============================================
  // ASOCIACIONES
  // ============================================
  HabilidadCatalogo.associate = (models) => {
    // N:M con Candidato a través de candidato_habilidades
    if (models.Candidato) {
      HabilidadCatalogo.belongsToMany(models.Candidato, {
        through: 'candidato_habilidades',
        foreignKey: 'habilidad_id',
        otherKey: 'candidato_id',
        as: 'candidatos'
      });
    }
  };

  // ============================================
  // MÉTODOS ESTÁTICOS
  // ============================================
  
  /**
   * Buscar habilidades por nombre (fuzzy search)
   */
  HabilidadCatalogo.buscarPorNombre = async function(termino) {
    const { Op } = require('sequelize');
    return await this.findAll({
      where: {
        nombre: {
          [Op.like]: `%${termino}%`
        },
        activa: true
      },
      order: [['nombre', 'ASC']],
      limit: 20
    });
  };

  /**
   * Obtener habilidades por categoría
   */
  HabilidadCatalogo.porCategoria = async function(categoria) {
    return await this.findAll({
      where: { categoria, activa: true },
      order: [['demanda_mercado', 'DESC'], ['nombre', 'ASC']]
    });
  };

  /**
   * Obtener habilidades más demandadas
   */
  HabilidadCatalogo.masDemandadas = async function(limite = 20) {
    return await this.findAll({
      where: { 
        activa: true,
        demanda_mercado: ['muy_alta', 'alta']
      },
      order: [
        ['demanda_mercado', 'DESC'],
        ['nombre', 'ASC']
      ],
      limit: limite
    });
  };

  // ============================================
  // MÉTODOS DE INSTANCIA
  // ============================================
  
  HabilidadCatalogo.prototype.desactivar = async function() {
    this.activa = false;
    await this.save();
  };

  HabilidadCatalogo.prototype.actualizarDemanda = async function(nuevaDemanda) {
    const demandasValidas = ['baja', 'media', 'alta', 'muy_alta'];
    if (!demandasValidas.includes(nuevaDemanda)) {
      throw new Error('Demanda inválida');
    }
    this.demanda_mercado = nuevaDemanda;
    await this.save();
  };

  return HabilidadCatalogo;
};