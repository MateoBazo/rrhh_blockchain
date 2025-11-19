// file: frontend/src/components/postulaciones/PostulacionCard.jsx

/**
 * 📬 POSTULACION CARD
 * Tarjeta de postulación con score, estado, timeline y acciones
 * Usado en "Mis Postulaciones" (candidato) y "Postulaciones Vacante" (empresa)
 */

import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Eye,
  XCircle,
  Building2,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import BadgeEstado from './BadgeEstado';
import ScoreCircular from './ScoreCircular';

const PostulacionCard = ({
  postulacion,
  vistaEmpresa = false,
  onVerDetalle,
  onRetirar,
  onCambiarEstado
}) => {
  const [showActions, setShowActions] = useState(false);

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calcular tiempo transcurrido
  const tiempoTranscurrido = () => {
    if (!postulacion.fecha_postulacion) return null;
    
    const hoy = new Date();
    const fecha = new Date(postulacion.fecha_postulacion);
    const diff = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Hace 1 día';
    if (diff < 7) return `Hace ${diff} días`;
    if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`;
    return `Hace ${Math.floor(diff / 30)} meses`;
  };

  // Verificar si puede retirarse
  const puedeRetirar = () => {
    return ['postulado', 'revisado', 'preseleccionado'].includes(postulacion.estado);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          {/* Info principal */}
          <div className="flex-1 min-w-0">
            {/* Título vacante */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
              {postulacion.vacante?.titulo || 'Vacante sin título'}
            </h3>

            {/* Empresa / Candidato según vista */}
            {vistaEmpresa ? (
              // Vista empresa: mostrar candidato
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Building2 size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate">
                  {postulacion.candidato?.nombre_completo || 'Candidato'}
                </span>
              </div>
            ) : (
              // Vista candidato: mostrar empresa
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Building2 size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate">
                  {postulacion.vacante?.empresa?.nombre_comercial || 'Empresa confidencial'}
                </span>
              </div>
            )}

            {/* Ubicación */}
            {postulacion.vacante?.ciudad && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin size={14} className="mr-1 flex-shrink-0" />
                <span>
                  {postulacion.vacante.ciudad}, {postulacion.vacante.departamento}
                </span>
              </div>
            )}
          </div>

          {/* Score Circular */}
          {postulacion.score_compatibilidad !== undefined && (
            <div className="ml-4 flex-shrink-0">
              <ScoreCircular
                score={postulacion.score_compatibilidad}
                size="sm"
                showLabel={false}
              />
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {/* Fecha postulación */}
          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2 flex-shrink-0" />
            <span>{formatFecha(postulacion.fecha_postulacion)}</span>
          </div>

          {/* Tiempo transcurrido */}
          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-2 flex-shrink-0" />
            <span>{tiempoTranscurrido()}</span>
          </div>

          {/* Modalidad */}
          {postulacion.vacante?.modalidad && (
            <div className="flex items-center text-gray-600">
              <Briefcase size={16} className="mr-2 flex-shrink-0" />
              <span className="capitalize">{postulacion.vacante.modalidad}</span>
            </div>
          )}

          {/* Score texto */}
          {postulacion.score_compatibilidad !== undefined && (
            <div className="flex items-center text-gray-600">
              <TrendingUp size={16} className="mr-2 flex-shrink-0" />
              <span>Compatibilidad: {Math.round(postulacion.score_compatibilidad)}%</span>
            </div>
          )}
        </div>

        {/* Carta de presentación preview */}
        {postulacion.carta_presentacion && !vistaEmpresa && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2 italic">
              "{postulacion.carta_presentacion}"
            </p>
          </div>
        )}

        {/* Notas empresa (solo vista candidato) */}
        {postulacion.notas_empresa && !vistaEmpresa && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <MessageSquare size={16} className="mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-900 mb-1">
                  Comentario de la empresa:
                </p>
                <p className="text-sm text-blue-800">
                  {postulacion.notas_empresa}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        {/* Estado */}
        <div className="flex items-center space-x-2">
          <BadgeEstado estado={postulacion.estado} tipo="postulacion" />
          
          {/* Visto por empresa */}
          {!vistaEmpresa && postulacion.visto_por_empresa && (
            <div className="flex items-center text-xs text-gray-500">
              <Eye size={12} className="mr-1" />
              <span>Vista</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          {/* Ver detalle */}
          <button
            onClick={() => onVerDetalle?.(postulacion)}
            className="
              text-sm font-medium text-blue-600 hover:text-blue-700
              transition-colors
            "
          >
            Ver detalle
          </button>

          {/* Retirar (solo candidato y estados permitidos) */}
          {!vistaEmpresa && puedeRetirar() && (
            <button
              onClick={() => onRetirar?.(postulacion)}
              className="
                text-sm font-medium text-red-600 hover:text-red-700
                transition-colors flex items-center
              "
            >
              <XCircle size={16} className="mr-1" />
              Retirar
            </button>
          )}

          {/* Cambiar estado (solo empresa) */}
          {vistaEmpresa && (
            <button
              onClick={() => onCambiarEstado?.(postulacion)}
              className="
                px-3 py-1.5 text-sm font-medium
                bg-blue-600 text-white rounded-lg
                hover:bg-blue-700 transition-colors
              "
            >
              Gestionar
            </button>
          )}
        </div>
      </div>

      {/* Desglose scoring (expandible) */}
      {postulacion.desglose_scoring && (
        <div className="px-6 py-3 border-t border-gray-100">
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium"
          >
            {showActions ? '▼' : '▶'} Ver desglose de compatibilidad
          </button>

          {showActions && (
            <div className="mt-3 space-y-2">
              {Object.entries(postulacion.desglose_scoring).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 capitalize">
                    {key.replace('_', ' ')}:
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(value.puntos / value.peso) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900">
                      {value.puntos}/{value.peso} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostulacionCard;