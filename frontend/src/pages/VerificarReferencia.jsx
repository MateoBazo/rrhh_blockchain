// file: frontend/src/pages/VerificarReferencia.jsx

/**
 * PÁGINA PÚBLICA: Verificar Referencia
 * 
 * Página a la que llega la persona referencia desde el email.
 * Valida el token y muestra resultado de verificación.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { referenciasAPI } from '../api/referencias';

export default function VerificarReferencia() {
  const { token } = useParams();
  
  const [estado, setEstado] = useState('verificando'); // verificando | success | error
  const [mensaje, setMensaje] = useState('');
  const [datosReferencia, setDatosReferencia] = useState(null);

  // useCallback para evitar warning de exhaustive-deps
  const verificarToken = useCallback(async () => {
    try {
      setEstado('verificando');
      
      const response = await referenciasAPI.verificarReferencia(token);
      
      console.log('✅ Verificación exitosa:', response.data);
      
      setEstado('success');
      setMensaje(response.data.mensaje);
      setDatosReferencia(response.data.data.referencia);

    } catch (error) {
      console.error('❌ Error en verificación:', error);
      
      setEstado('error');
      
      if (error.response?.status === 404) {
        setMensaje('Token de verificación no encontrado o inválido.');
      } else if (error.response?.status === 400) {
        setMensaje(error.response.data.mensaje || 'Este link ya fue utilizado o ha expirado.');
      } else {
        setMensaje('Error al procesar la verificación. Intenta nuevamente más tarde.');
      }
    }
  }, [token]);

  useEffect(() => {
    verificarToken();
  }, [verificarToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white text-center">
            <div className="text-6xl mb-4">
              {estado === 'verificando' && '⏳'}
              {estado === 'success' && '✅'}
              {estado === 'error' && '❌'}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {estado === 'verificando' && 'Verificando...'}
              {estado === 'success' && '¡Verificación Exitosa!'}
              {estado === 'error' && 'Error de Verificación'}
            </h1>
            <p className="text-purple-100">
              Sistema RRHH Blockchain
            </p>
          </div>

          {/* Contenido */}
          <div className="p-8">
            
            {/* Estado: Verificando */}
            {estado === 'verificando' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">
                  Procesando tu verificación...
                </p>
              </div>
            )}

            {/* Estado: Success */}
            {estado === 'success' && datosReferencia && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-green-900 mb-3">
                    Referencia Verificada Correctamente
                  </h2>
                  <p className="text-green-800 mb-4">
                    {mensaje}
                  </p>

                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Tu nombre:</span>
                      <span className="text-gray-900 font-semibold">{datosReferencia.nombre_completo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Candidato:</span>
                      <span className="text-gray-900 font-semibold">{datosReferencia.candidato}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Fecha:</span>
                      <span className="text-gray-900 font-semibold">
                        {new Date(datosReferencia.fecha_verificacion).toLocaleDateString('es-BO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">✅ ¿Qué significa esto?</h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Has confirmado que conoces al candidato mencionado</li>
                    <li>Autorizas a empresas reclutadoras a contactarte para referencias</li>
                    <li>La verificación queda registrada de forma inmutable</li>
                    <li>Puedes ser contactado en el futuro sobre el candidato</li>
                  </ul>
                </div>

                <div className="text-center pt-4">
                  <p className="text-gray-600 text-sm mb-4">
                    Puedes cerrar esta ventana de forma segura.
                  </p>
                  <button
                    onClick={() => window.close()}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cerrar Ventana
                  </button>
                </div>
              </div>
            )}

            {/* Estado: Error */}
            {estado === 'error' && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-red-900 mb-3">
                    No se pudo verificar la referencia
                  </h2>
                  <p className="text-red-800 mb-4">
                    {mensaje}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Posibles causas:</h3>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>El link de verificación ya fue utilizado anteriormente</li>
                    <li>El link ha expirado (válido por 7 días)</li>
                    <li>El link es inválido o fue modificado</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 ¿Qué hacer?</h3>
                  <p className="text-sm text-blue-800">
                    Si necesitas verificar tu referencia, solicita al candidato que te envíe un nuevo link de verificación.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <button
                    onClick={() => window.close()}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cerrar Ventana
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600 border-t">
            <p>
              <strong>Sistema RRHH Blockchain</strong> · Verificación de Referencias Laborales
            </p>
            <p className="mt-1">
              Este proceso garantiza la autenticidad y consentimiento de las referencias
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}