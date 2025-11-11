// file: frontend/src/components/empresa/RegistrarConsultaModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { empresasAPI } from '../../api/empresas'; // ✅ Importar objeto empresasAPI

/**
 * Modal para registrar consulta de referencia
 * Incluye timer para calcular duracion_vista_segundos
 * S008.3
 */
function RegistrarConsultaModal({ referencia, candidato, onClose, onSuccess }) {
  const [motivo, setMotivo] = useState('');
  const [aceptaNotificacion, setAceptaNotificacion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Timer para calcular duración
  const tiempoInicioRef = useRef(Date.now());

  useEffect(() => {
    // Iniciar timer al montar componente
    tiempoInicioRef.current = Date.now();
    
    // Cleanup: registrar tiempo si usuario cierra sin enviar
    return () => {
      const duracion = Math.floor((Date.now() - tiempoInicioRef.current) / 1000);
      console.log(`Usuario vio modal por ${duracion} segundos`);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones frontend
    if (motivo.trim().length < 100) {
      setError('El motivo debe tener mínimo 100 caracteres');
      return;
    }

    if (motivo.length > 1000) {
      setError('El motivo no puede exceder 1000 caracteres');
      return;
    }

    if (!aceptaNotificacion) {
      setError('Debes aceptar que se notificará al candidato y a la referencia');
      return;
    }

    try {
      setLoading(true);

      // Calcular duración de vista en segundos
      const duracionSegundos = Math.floor((Date.now() - tiempoInicioRef.current) / 1000);

      const data = {
        motivo: motivo.trim(),
        duracion_vista_segundos: duracionSegundos
      };

      // ✅ Usar empresasAPI.registrarAccesoReferencia
      await empresasAPI.registrarAccesoReferencia(referencia.id, data);

      // Callback de éxito con ID de referencia y email
      onSuccess(referencia.id, referencia.email);

    } catch (err) {
      console.error('Error registrando consulta:', err);
      setError(err.mensaje || 'Error al registrar consulta');
    } finally {
      setLoading(false);
    }
  };

  const caracteresRestantes = 1000 - motivo.length;
  const caracteresMinimos = Math.max(0, 100 - motivo.length);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Registrar Consulta de Referencia</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Info de referencia */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Consultando referencia de:</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Candidato:</span> {candidato.nombre_completo}</p>
              <p><span className="font-medium">Referencia:</span> {referencia.nombre_completo}</p>
              <p><span className="font-medium">Cargo:</span> {referencia.cargo} en {referencia.empresa}</p>
            </div>
          </div>

          {/* Alert informativo */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">Importante:</span> Se enviará notificación automática al candidato y a la referencia informando sobre esta consulta.
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Motivo */}
            <div className="mb-6">
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                ¿Por qué estás consultando esta referencia? *
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  motivo.length < 100 ? 'border-red-300' : 'border-gray-300'
                }`}
                rows="6"
                placeholder="Ej: Proceso de selección para cargo de Gerente de Recursos Humanos. Necesitamos validar experiencia en gestión de equipos multidisciplinarios y habilidades de liderazgo demostradas en proyectos previos."
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm">
                  {caracteresMinimos > 0 ? (
                    <span className="text-red-600 font-medium">
                      Faltan {caracteresMinimos} caracteres (mínimo 100)
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      ✓ Mínimo alcanzado
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {caracteresRestantes} caracteres restantes
                </div>
              </div>
            </div>

            {/* Checkbox aceptación */}
            <div className="mb-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={aceptaNotificacion}
                  onChange={(e) => setAceptaNotificacion(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Acepto que se notificará al candidato <strong>{candidato.nombre_completo}</strong> y a la referencia <strong>{referencia.nombre_completo}</strong> sobre esta consulta. Esta acción quedará registrada en el sistema de auditoría.
                </span>
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={loading || motivo.length < 100 || !aceptaNotificacion}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Registrar Consulta
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrarConsultaModal;