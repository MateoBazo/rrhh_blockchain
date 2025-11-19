// file: frontend/src/components/common/SkeletonCard.jsx

/**
 * 💀 SKELETON CARD
 * Placeholder animado para estados de carga
 * Usado mientras se cargan vacantes, postulaciones, etc.
 */

import React from 'react';

const SkeletonCard = ({ variant = 'default', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  // Variante por defecto (vacante/postulación)
  if (variant === 'default') {
    return (
      <>
        {skeletons.map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {/* Título */}
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                {/* Empresa */}
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              {/* Badge */}
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>

            {/* Detalles */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  // Variante lista simple
  if (variant === 'list') {
    return (
      <>
        {skeletons.map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 mb-3 animate-pulse"
          >
            <div className="flex items-center space-x-4">
              {/* Avatar/Icon */}
              <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  // Variante tabla
  if (variant === 'table') {
    return (
      <div className="animate-pulse">
        {skeletons.map((index) => (
          <div key={index} className="border-b border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonCard;