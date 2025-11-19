// file: frontend/src/components/postulaciones/BadgeEstado.jsx

/**
 * 🏷️ BADGE ESTADO
 * Badge coloreado según estado de postulación o vacante
 * Usa constants.js para colores y labels
 */

import React from 'react';
import {
  COLORES_ESTADO_POSTULACION,
  LABELS_ESTADO_POSTULACION,
  ESTADOS_VACANTE
} from '../../utils/constants';

const BadgeEstado = ({ estado, tipo = 'postulacion', size = 'md' }) => {
  // Obtener configuración según tipo
  let colorClasses = '';
  let label = '';

  if (tipo === 'postulacion') {
    colorClasses = COLORES_ESTADO_POSTULACION[estado] || 'bg-gray-100 text-gray-800';
    label = LABELS_ESTADO_POSTULACION[estado] || estado;
  } else if (tipo === 'vacante') {
    // Colores para vacantes
    const coloresVacante = {
      borrador: 'bg-gray-100 text-gray-700',
      abierta: 'bg-green-100 text-green-800',
      pausada: 'bg-yellow-100 text-yellow-800',
      cerrada: 'bg-red-100 text-red-800',
    };
    
    const labelsVacante = {
      borrador: 'Borrador',
      abierta: 'Abierta',
      pausada: 'Pausada',
      cerrada: 'Cerrada',
    };

    colorClasses = coloresVacante[estado] || 'bg-gray-100 text-gray-800';
    label = labelsVacante[estado] || estado;
  }

  // Tamaños
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const sizeClasses = sizes[size] || sizes.md;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${colorClasses}
        ${sizeClasses}
      `}
    >
      {label}
    </span>
  );
};

export default BadgeEstado;