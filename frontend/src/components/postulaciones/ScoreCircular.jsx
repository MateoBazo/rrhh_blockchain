// file: frontend/src/components/postulaciones/ScoreCircular.jsx

/**
 * 🎯 SCORE CIRCULAR
 * Visualización circular de score de compatibilidad (0-100)
 * Con colores según rango: verde (90+), azul (80-89), amarillo (70-79), naranja (60-69), rojo (<60)
 */

import React from 'react';
import { obtenerRangoScore } from '../../utils/constants';

const ScoreCircular = ({ score, size = 'md', showLabel = true }) => {
  // Obtener rango y color
  const rango = obtenerRangoScore(score);
  
  // Colores por rango
  const colores = {
    green: {
      stroke: '#10b981', // green-500
      text: 'text-green-600',
      bg: 'bg-green-50'
    },
    blue: {
      stroke: '#3b82f6', // blue-500
      text: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    yellow: {
      stroke: '#f59e0b', // amber-500
      text: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    orange: {
      stroke: '#f97316', // orange-500
      text: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    red: {
      stroke: '#ef4444', // red-500
      text: 'text-red-600',
      bg: 'bg-red-50'
    }
  };

  const colorConfig = colores[rango.color] || colores.red;

  // Tamaños
  const sizes = {
    sm: { width: 60, stroke: 4, fontSize: 'text-sm' },
    md: { width: 80, stroke: 6, fontSize: 'text-lg' },
    lg: { width: 120, stroke: 8, fontSize: 'text-2xl' },
  };

  const sizeConfig = sizes[size] || sizes.md;
  const { width, stroke } = sizeConfig;
  
  // Cálculo círculo
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* SVG Círculo */}
      <div className={`relative ${colorConfig.bg} rounded-full p-2`}>
        <svg
          width={width}
          height={width}
          className="transform -rotate-90"
        >
          {/* Círculo fondo */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="#e5e7eb" // gray-200
            strokeWidth={stroke}
            fill="none"
          />
          
          {/* Círculo progreso */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke={colorConfig.stroke}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score en el centro */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: sizeConfig.fontSize }}
        >
          <span className={`font-bold ${colorConfig.text}`}>
            {Math.round(score)}
          </span>
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className="mt-2 text-center">
          <p className={`text-xs font-medium ${colorConfig.text}`}>
            {rango.label}
          </p>
        </div>
      )}
    </div>
  );
};

export default ScoreCircular;