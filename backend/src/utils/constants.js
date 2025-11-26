// file: backend/src/utils/constants.js

/**
 * Constantes compartidas del sistema
 * Sincronizadas con ENUM de MySQL
 */

const SECTORES_ENUM = [
  'Tecnología de la Información',
  'Banca y Finanzas',
  'Manufactura',
  'Construcción',
  'Salud y Farmacéutica',
  'Educación',
  'Comercio y Retail',
  'Turismo y Hotelería',
  'Agricultura y Ganadería',
  'Transporte y Logística',
  'Energía y Minería',
  'Telecomunicaciones',
  'Alimentos y Bebidas',
  'Consultoría y Servicios Profesionales',
  'Arte y Entretenimiento',
  'Gobierno y Administración Pública',
  'Medios de Comunicación',
  'Inmobiliaria',
  'Seguros',
  'Textil y Confección',
  'Automotriz',
  'Química y Petroquímica',
  'Deportes y Recreación',
  'Investigación y Desarrollo',
  'Otro'
];

const DEPARTAMENTOS_BOLIVIA = [
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Oruro',
  'Potosí',
  'Chuquisaca',
  'Tarija',
  'Beni',
  'Pando'
];

const TAMANIOS_EMPRESA = ['Micro', 'Pequeña', 'Mediana', 'Grande'];

const ROLES_USUARIO = ['ADMIN', 'EMPRESA', 'CANDIDATO', 'CONTRATISTA'];

module.exports = {
  SECTORES_ENUM,
  DEPARTAMENTOS_BOLIVIA,
  TAMANIOS_EMPRESA,
  ROLES_USUARIO
};