// file: backend/src/utils/auditHelper.js

const { AuditoriaAccion } = require('../models');

/**
 * Registrar acción de auditoría
 */
const registrarAuditoria = async (datos) => {
  try {
    if (!AuditoriaAccion) {
      console.warn('⚠️  Modelo AuditoriaAccion no disponible');
      return null;
    }

    const {
      usuario_id,
      accion,
      entidad,        // ← nombre tabla
      entidad_id,
      datos_adicionales = {},
      ip_address = null,
      user_agent = null
    } = datos;

    if (!usuario_id || !accion || !entidad) {
      console.error('❌ Faltan campos obligatorios para auditoría');
      return null;
    }

    const auditoria = await AuditoriaAccion.create({
      usuario_id,
      accion,
      entidad_tipo: entidad,  // ✅ MAPEAR entidad → entidad_tipo
      entidad_id: entidad_id ? String(entidad_id) : null,
      datos_adicionales: JSON.stringify(datos_adicionales),
      ip_address,
      user_agent
    });

    console.log(`✅ Auditoría: ${accion} en ${entidad} #${entidad_id}`);
    return auditoria;

  } catch (error) {
    console.error('❌ Error al registrar auditoría:', error.message);
    return null;
  }
};

/**
 * Extraer IP real del request
 */
const obtenerIPReal = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
    || req.headers['x-real-ip'] 
    || req.connection?.remoteAddress 
    || req.socket?.remoteAddress 
    || req.ip
    || 'unknown';
};

/**
 * Extraer User Agent del request
 */
const obtenerUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

module.exports = {
  registrarAuditoria,
  obtenerIPReal,
  obtenerUserAgent
};