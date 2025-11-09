// file: frontend/src/components/candidato/ListaReferencias.jsx

/**
 * COMPONENTE: Lista de Referencias
 * 
 * Muestra referencias en cards con estado de verificación.
 * Incluye badges para verificado/no verificado.
 */

import { useState } from 'react';
import { FaEdit, FaTrash, FaPhone, FaEnvelope, FaBriefcase, FaCheckCircle, FaClock } from 'react-icons/fa';

// Helper para formatear tipo de relación
const formatearRelacion = (relacion) => {
  const relaciones = {
    'JEFE_DIRECTO': 'Jefe Directo',
    'SUPERVISOR': 'Supervisor',
    'COLEGA': 'Colega',
    'PROFESOR': 'Profesor/Instructor',
    'CLIENTE': 'Cliente',
    'OTRO': 'Otro'
  };
  return relaciones[relacion] || relacion;
};

export default function ListaReferencias({ referencias, onEditar, onEliminar, loading }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  /**
   * Handler para confirmación de eliminación
   */
  const handleDelete = (id) => {
    if (confirmDelete === id) {
      onEliminar(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      // Auto-cancelar después de 3 segundos
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!referencias || referencias.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <FaBriefcase className="mx-auto text-6xl text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No hay referencias registradas
        </h3>
        <p className="text-gray-500">
          Agrega tus primeras referencias profesionales o académicas (máximo 3)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {referencias.map((ref) => (
        <div
          key={ref.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          {/* Header: Nombre y Estado de Verificación */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-800">{ref.nombre_completo}</h3>
                
                {/* Badge de verificación */}
                {ref.verificado ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <FaCheckCircle />
                    Verificada
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <FaClock />
                    Pendiente
                  </span>
                )}
              </div>

              {/* Cargo y Empresa */}
              {(ref.cargo || ref.empresa) && (
                <p className="text-gray-600">
                  {ref.cargo && <span className="font-semibold">{ref.cargo}</span>}
                  {ref.cargo && ref.empresa && <span> en </span>}
                  {ref.empresa && <span>{ref.empresa}</span>}
                </p>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={() => onEditar(ref)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar referencia"
              >
                <FaEdit size={18} />
              </button>

              <button
                onClick={() => handleDelete(ref.id)}
                className={`p-2 rounded-lg transition-colors ${
                  confirmDelete === ref.id
                    ? 'bg-red-600 text-white'
                    : 'text-red-600 hover:bg-red-50'
                }`}
                title={confirmDelete === ref.id ? 'Confirmar eliminación' : 'Eliminar referencia'}
              >
                <FaTrash size={18} />
              </button>
            </div>
          </div>

          {/* Info de contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <FaEnvelope className="text-blue-600 flex-shrink-0" />
              <a 
                href={`mailto:${ref.email}`}
                className="truncate hover:text-blue-600 transition-colors"
              >
                {ref.email}
              </a>
            </div>

            {ref.telefono && (
              <div className="flex items-center gap-2 text-gray-700">
                <FaPhone className="text-blue-600 flex-shrink-0" />
                <a 
                  href={`tel:${ref.telefono}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {ref.telefono}
                </a>
              </div>
            )}
          </div>

          {/* Detalles adicionales */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Relación:</span>
              <span className="font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                {formatearRelacion(ref.relacion)}
              </span>
            </div>

            {ref.anos_conocidos && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Años de conocimiento:</span>
                <span className="font-medium text-gray-800 bg-blue-50 px-3 py-1 rounded-full">
                  {ref.anos_conocidos} {ref.anos_conocidos === 1 ? 'año' : 'años'}
                </span>
              </div>
            )}
          </div>

          {/* Notas */}
          {ref.notas && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ref.notas}</p>
            </div>
          )}

          {/* Fecha de verificación */}
          {ref.verificado && ref.fecha_verificacion && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Verificada el {new Date(ref.fecha_verificacion).toLocaleDateString('es-BO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Mensaje de confirmación de eliminación */}
          {confirmDelete === ref.id && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Haz clic nuevamente en eliminar para confirmar
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Nota: límite de referencias */}
      {referencias.length >= 3 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>⚠️ Límite alcanzado:</strong> Has llegado al máximo de 3 referencias permitidas. 
            Para agregar una nueva, debes eliminar una existente.
          </p>
        </div>
      )}
    </div>
  );
}