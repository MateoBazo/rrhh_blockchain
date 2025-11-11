// file: frontend/src/pages/ReferenciasVerificadas.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { empresasAPI } from '../api/empresas'; // ✅ Importar objeto empresasAPI
import RegistrarConsultaModal from '../components/empresa/RegistrarConsultaModal';

/**
 * Página para que empresas vean referencias verificadas de candidatos
 * Solo muestra referencias WHERE verificado=TRUE
 * S008.3
 */
function ReferenciasVerificadas() {
  const { id: candidatoId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [candidato, setCandidato] = useState(null);
  const [referencias, setReferencias] = useState([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [referenciaSeleccionada, setReferenciaSeleccionada] = useState(null);

  useEffect(() => {
    cargarReferencias();
  }, [candidatoId]);

  const cargarReferencias = async () => {
    try {
      setLoading(true);
      setError('');
      
      // ✅ Usar empresasAPI.obtenerReferenciasVerificadas
      const response = await empresasAPI.obtenerReferenciasVerificadas(candidatoId);
      
      setCandidato(response.data.candidato);
      setReferencias(response.data.referencias);
      
    } catch (err) {
      console.error('Error cargando referencias:', err);
      setError(err.mensaje || 'Error al cargar referencias verificadas');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalConsulta = (referencia) => {
    setReferenciaSeleccionada(referencia);
    setModalOpen(true);
  };

  const handleConsultaRegistrada = (referenciaId, emailReferencia) => {
    // Actualizar contador de accesos en la referencia sin recargar página
    setReferencias(prev => prev.map(ref => 
      ref.id === referenciaId 
        ? { ...ref, accesos_previos: (ref.accesos_previos || 0) + 1 }
        : ref
    ));
    
    setSuccess(`✅ Consulta registrada. Se ha enviado notificación a ${emailReferencia}`);
    setModalOpen(false);
    
    // Limpiar mensaje después de 5 segundos
    setTimeout(() => setSuccess(''), 5000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Referencias Verificadas
        </h1>
        {candidato && (
          <p className="text-lg text-gray-600">
            Candidato: <span className="font-semibold">{candidato.nombre_completo}</span>
            {candidato.profesion && (
              <span className="text-gray-500"> • {candidato.profesion}</span>
            )}
          </p>
        )}
      </div>

      {/* Alert informativo */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Política de Transparencia:</span> Solo se muestran referencias verificadas. El candidato y las referencias recibirán notificación automática cuando consultes esta información.
            </p>
          </div>
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Lista de referencias */}
      {referencias.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay referencias verificadas
          </h3>
          <p className="text-gray-600">
            Este candidato aún no tiene referencias verificadas en el sistema.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {referencias.map((referencia) => (
            <div 
              key={referencia.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header con badge verificada */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {referencia.nombre_completo}
                    </h3>
                    <p className="text-gray-600">
                      {referencia.cargo}
                    </p>
                    <p className="text-sm text-gray-500">
                      {referencia.empresa}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verificada
                  </span>
                </div>

                {/* Información de contacto */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${referencia.email}`} className="text-blue-600 hover:underline">
                      {referencia.email}
                    </a>
                  </div>
                  
                  {referencia.telefono && (
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${referencia.telefono}`} className="text-blue-600 hover:underline">
                        {referencia.telefono}
                      </a>
                    </div>
                  )}
                </div>

                {/* Detalles adicionales */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-24">Relación:</span>
                    <span className="text-gray-600">{referencia.relacion}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-24">Verificada:</span>
                    <span className="text-gray-600">
                      {new Date(referencia.fecha_verificacion).toLocaleDateString('es-BO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Notas si existen */}
                {referencia.notas && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700 italic">
                      "{referencia.notas}"
                    </p>
                  </div>
                )}

                {/* Badge contador de consultas */}
                {referencia.accesos_previos > 0 && (
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Has consultado esta referencia {referencia.accesos_previos} {referencia.accesos_previos === 1 ? 'vez' : 'veces'}
                    </span>
                  </div>
                )}

                {/* Botón registrar consulta */}
                <button
                  onClick={() => abrirModalConsulta(referencia)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Registrar Consulta y Notificar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Registrar Consulta */}
      {modalOpen && referenciaSeleccionada && (
        <RegistrarConsultaModal
          referencia={referenciaSeleccionada}
          candidato={candidato}
          onClose={() => setModalOpen(false)}
          onSuccess={handleConsultaRegistrada}
        />
      )}
    </div>
  );
}

export default ReferenciasVerificadas;