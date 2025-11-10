// file: frontend/src/components/candidato/ListaReferencias.jsx

/**
 * COMPONENTE: Lista de Referencias
 * 
 * Muestra referencias en cards con estado de verificación.
 * Incluye badges y botón para enviar verificación.
 */

import { useState } from 'react';
import { FaEdit, FaTrash, FaPhone, FaEnvelope, FaBriefcase, FaCheckCircle, FaClock, FaPaperPlane } from 'react-icons/fa';
import { referenciasAPI } from '../../api/referencias';

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
  const [enviandoVerificacion, setEnviandoVerificacion] = useState(null);
  const [mensajeVerificacion, setMensajeVerificacion] = useState({});

  /**
   * Handler para confirmación de eliminación
   */
  const handleDelete = (id) => {
    if (confirmDelete === id) {
      onEliminar(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  /**
   * Handler para enviar verificación
   */
  const handleEnviarVerificacion = async (id) => {
    try {
      setEnviandoVerificacion(id);
      setMensajeVerificacion({});

      const response = await referenciasAPI.enviarVerificacion(id);
      
      console.log('✅ Email de verificación enviado:', response.data);
      
      setMensajeVerificacion({
        [id]: {
          tipo: 'success',
          texto: `✅ Email enviado a ${response.data.data.email_enviado_a}. Expira en ${response.data.data.expira_en}.`
        }
      });

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setMensajeVerificacion({});
      }, 5000);

    } catch (error) {
      console.error('❌ Error al enviar verificación:', error);
      
      let mensajeError = 'Error al enviar email de verificación';
      
      if (error.response?.status === 429) {
        mensajeError = error.response.data.mensaje || 'Ya se envió un email recientemente. Espera antes de reenviar.';
      } else if (error.response?.status === 400) {
        mensajeError = error.response.data.mensaje || 'Esta referencia ya está verificada';
      } else if (error.response?.status === 500) {
        mensajeError = 'Error al enviar email. Verifica la configuración del servidor.';
      }
      
      setMensajeVerificacion({
        [id]: {
          tipo: 'error',
          texto: `❌ ${mensajeError}`
        }
      });

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setMensajeVerificacion({});
      }, 5000);

    } finally {
      setEnviandoVerificacion(null);
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
              <div className="flex items-center gap-3 mb-2 flex-wrap">
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

          {/* 🆕 Sección de Verificación */}
          {!ref.verificado && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    📧 Verificación Pendiente
                  </h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    Esta referencia aún no ha sido verificada. Envía un email de verificación para que la persona confirme su consentimiento.
                  </p>
                  
                  {/* Botón enviar verificación */}
                  <button
                    onClick={() => handleEnviarVerificacion(ref.id)}
                    disabled={enviandoVerificacion === ref.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      enviandoVerificacion === ref.id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    <FaPaperPlane />
                    {enviandoVerificacion === ref.id ? 'Enviando...' : 'Enviar Verificación'}
                  </button>
                </div>
              </div>

              {/* Mensaje de resultado */}
              {mensajeVerificacion[ref.id] && (
                <div className={`mt-3 p-3 rounded-lg ${
                  mensajeVerificacion[ref.id].tipo === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    mensajeVerificacion[ref.id].tipo === 'success' 
                      ? 'text-green-800' 
                      : 'text-red-800'
                  }`}>
                    {mensajeVerificacion[ref.id].texto}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Fecha de verificación */}
          {ref.verificado && ref.fecha_verificacion && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Verificada el {new Date(ref.fecha_verificacion).toLocaleDateString('es-BO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
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