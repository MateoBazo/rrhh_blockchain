// file: frontend/src/components/vacantes/VacanteCard.jsx

/**
 * 💼 VACANTE CARD
 * Tarjeta visual de vacante con información resumida
 * Click en card abre detalle completo
 */

import React from 'react';
import {
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Building2
} from 'lucide-react';
import BadgeEstado from '../postulaciones/BadgeEstado';

const VacanteCard = ({ vacante, onClick, showActions = true }) => {
  // Formatear salario
  const formatSalario = () => {
    if (!vacante.mostrar_salario) {
      return 'No especificado';
    }
    
    if (vacante.salario_min && vacante.salario_max) {
      return `$${vacante.salario_min.toLocaleString()} - $${vacante.salario_max.toLocaleString()}`;
    }
    
    if (vacante.salario_min) {
      return `Desde $${vacante.salario_min.toLocaleString()}`;
    }
    
    return 'A convenir';
  };

  // Calcular días desde publicación
  const diasPublicacion = () => {
    if (!vacante.fecha_publicacion) return null;
    
    const hoy = new Date();
    const publicacion = new Date(vacante.fecha_publicacion);
    const diff = Math.floor((hoy - publicacion) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff} días`;
    if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`;
    return `Hace ${Math.floor(diff / 30)} meses`;
  };

  // Modalidad badge color
  const modalidadColors = {
    remoto: 'bg-blue-100 text-blue-700',
    presencial: 'bg-purple-100 text-purple-700',
    hibrido: 'bg-green-100 text-green-700',
  };

  return (
    <div
      onClick={onClick}
      className="
        bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md hover:border-blue-300
        transition-all duration-200
        cursor-pointer
        p-6
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {vacante.titulo}
          </h3>
          
          {/* Empresa */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Building2 size={16} className="mr-1 flex-shrink-0" />
            <span className="truncate">
              {vacante.empresa?.nombre_comercial || 'Empresa confidencial'}
            </span>
          </div>
        </div>

        {/* Badge Estado */}
        <BadgeEstado estado={vacante.estado} tipo="vacante" size="sm" />
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        {/* Ubicación */}
        <div className="flex items-center text-gray-600">
          <MapPin size={16} className="mr-2 flex-shrink-0" />
          <span className="truncate">
            {vacante.ciudad}, {vacante.departamento}
          </span>
        </div>

        {/* Modalidad */}
        <div className="flex items-center">
          <Briefcase size={16} className="mr-2 flex-shrink-0 text-gray-400" />
          <span
            className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${modalidadColors[vacante.modalidad] || 'bg-gray-100 text-gray-700'}
            `}
          >
            {vacante.modalidad?.charAt(0).toUpperCase() + vacante.modalidad?.slice(1)}
          </span>
        </div>

        {/* Salario */}
        <div className="flex items-center text-gray-600">
          <DollarSign size={16} className="mr-2 flex-shrink-0" />
          <span className="truncate">{formatSalario()}</span>
        </div>

        {/* Experiencia */}
        {vacante.experiencia_requerida_anios !== null && (
          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-2 flex-shrink-0" />
            <span>
              {vacante.experiencia_requerida_anios === 0
                ? 'Sin experiencia'
                : `${vacante.experiencia_requerida_anios}+ años`}
            </span>
          </div>
        )}
      </div>

      {/* Descripción preview */}
      {vacante.descripcion && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {vacante.descripcion}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Publicación */}
        <div className="flex items-center text-xs text-gray-500">
          <Calendar size={14} className="mr-1" />
          <span>{diasPublicacion()}</span>
        </div>

        {/* Postulaciones count (si disponible) */}
        {vacante.postulaciones_recibidas !== undefined && (
          <div className="flex items-center text-xs text-gray-500">
            <Users size={14} className="mr-1" />
            <span>
              {vacante.postulaciones_recibidas}{' '}
              {vacante.postulaciones_recibidas === 1 ? 'postulación' : 'postulaciones'}
            </span>
          </div>
        )}

        {/* CTA */}
        {showActions && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(vacante);
            }}
            className="
              text-sm font-medium text-blue-600 hover:text-blue-700
              transition-colors
            "
          >
            Ver detalles →
          </button>
        )}
      </div>
    </div>
  );
};

export default VacanteCard;