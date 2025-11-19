// file: frontend/src/components/common/EmptyState.jsx

/**
 * 📭 EMPTY STATE
 * Mostrar cuando no hay datos disponibles
 * Con ilustración, mensaje y CTA opcional
 */

import React from 'react';
import { FileX, Briefcase, Send, Search, AlertCircle } from 'lucide-react';

const EmptyState = ({
  icon = 'default',
  title = 'No hay datos disponibles',
  description = 'No se encontraron resultados.',
  action = null,
  variant = 'default'
}) => {
  // Seleccionar ícono
  const icons = {
    default: FileX,
    vacantes: Briefcase,
    postulaciones: Send,
    search: Search,
    error: AlertCircle,
  };

  const IconComponent = icons[icon] || icons.default;

  // Colores por variante
  const variants = {
    default: 'text-gray-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  };

  const iconColor = variants[variant] || variants.default;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Ícono */}
      <div className={`mb-4 ${iconColor}`}>
        <IconComponent size={64} strokeWidth={1.5} />
      </div>

      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Descripción */}
      <p className="text-gray-600 max-w-md mb-6">
        {description}
      </p>

      {/* Acción (botón CTA) */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.icon && <action.icon size={20} className="mr-2" />}
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;