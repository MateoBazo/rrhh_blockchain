// file: frontend/src/pages/MisReferencias.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidatosAPI } from '../api/candidatos';
import { referenciasAPI } from '../api/referencias'; // ✅ USAR API SERVICE
import FormReferencia from '../components/candidato/FormReferencia';
import ListaReferencias from '../components/candidato/ListaReferencias';

export default function MisReferencias() {
  const navigate = useNavigate();
  
  const [referencias, setReferencias] = useState([]);
  const [candidatoId, setCandidatoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [referenciaEditar, setReferenciaEditar] = useState(null);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Obtener perfil del candidato
      const perfilResponse = await candidatosAPI.obtenerPerfil();
      const candidato = perfilResponse.data.data || perfilResponse.data.candidato;
      
      if (!candidato || !candidato.id) {
        throw new Error('No se pudo obtener el ID del candidato');
      }

      setCandidatoId(candidato.id);

      // 2. Obtener referencias del candidato
      const refResponse = await referenciasAPI.obtenerReferencias(candidato.id); // ✅ CAMBIO
      const refs = refResponse.data.data || refResponse.data.referencias || [];
      setReferencias(refs);

      console.log(`📋 ${refs.length} referencias cargadas para candidato ${candidato.id}`);

    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      setError('Error al cargar tus referencias. Intenta recargar la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setMostrarFormulario(false);
    setReferenciaEditar(null);
    obtenerDatos();
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setReferenciaEditar(null);
  };

  const handleEditar = (referencia) => {
    setReferenciaEditar(referencia);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    try {
      setLoading(true);
      await referenciasAPI.eliminar(id); // ✅ CAMBIO
      console.log(`🗑️ Referencia ${id} eliminada`);
      obtenerDatos();
    } catch (err) {
      console.error('❌ Error al eliminar referencia:', err);
      setError('Error al eliminar referencia');
      setLoading(false);
    }
  };

  const referenciasVerificadas = referencias.filter(r => r.verificado).length;
  const referenciasPendientes = referencias.length - referenciasVerificadas;
  const puedeAgregarMas = referencias.length < 3;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/candidato/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>

          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mis Referencias</h1>
              <p className="text-gray-600 mt-2">
                Gestiona las personas que pueden dar referencias sobre tu experiencia profesional o académica
              </p>
            </div>

            {!mostrarFormulario && puedeAgregarMas && (
              <button
                onClick={() => {
                  setReferenciaEditar(null);
                  setMostrarFormulario(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Referencia
              </button>
            )}

            {!mostrarFormulario && !puedeAgregarMas && (
              <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium">
                ⚠️ Máximo de referencias alcanzado (3/3)
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {mostrarFormulario && candidatoId && (
            <FormReferencia
              referenciaEditar={referenciaEditar}
              candidato_id={candidatoId}
              onSuccess={handleSuccess}
              onCancel={handleCancelar}
            />
          )}

          {!mostrarFormulario && (
            <>
              {/* Cards de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Referencias</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">
                        {referencias.length}/3
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Verificadas</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {referenciasVerificadas}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Pendientes</p>
                      <p className="text-3xl font-bold text-yellow-600 mt-1">
                        {referenciasPendientes}
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <ListaReferencias
                referencias={referencias}
                onEditar={handleEditar}
                onEliminar={handleEliminar}
                loading={loading}
              />
            </>
          )}
        </div>

        {!mostrarFormulario && referencias.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Buenas Prácticas</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Mantén actualizada la información de contacto de tus referencias</li>
                <li>Informa a las personas cuando las agregues como referencia</li>
                <li>Incluye referencias de diferentes ámbitos (laboral, académico, clientes)</li>
                <li>Verifica que tengan disponibilidad para ser contactados</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">🔐 Verificación de Referencias</h3>
              <p className="text-sm text-green-800">
                En el futuro, las referencias verificadas se registrarán en blockchain para garantizar su 
                autenticidad. Esto aumentará la confianza de las empresas en tu perfil profesional.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}