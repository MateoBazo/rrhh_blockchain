// file: frontend/src/pages/CandidatoDashboard.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { candidatosAPI } from '../api/candidatos'; // ✅ CORREGIDO
import Button from '../components/common/Button';

const CandidatoDashboard = () => {
  const { user, logout } = useAuth();
  const [candidato, setCandidato] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const response = await candidatosAPI.obtenerPerfil(); // ✅ CORREGIDO
      if (response.data.success) {
        setCandidato(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const nombreCompleto = candidato?.nombre && candidato?.apellido 
    ? `${candidato.nombre} ${candidato.apellido}`
    : user?.email || 'Usuario';

  const nombreBienvenida = candidato?.nombre || 'Candidato';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">HR Blockchain</h1>
              <p className="text-xs text-gray-500">Panel de Candidato</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                👤 {nombreCompleto}
              </span>
              <Button variant="outline" onClick={logout} size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bienvenida */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            ¡Bienvenido, {nombreBienvenida}! 👋
          </h2>
          <p className="mt-2 text-gray-600">
            Completa tu perfil para comenzar a recibir ofertas de trabajo
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Completar Perfil */}
          <Link to="/perfil">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  📝 Completar Perfil
                </h3>
                <span className="text-2xl">→</span>
              </div>
              <p className="text-sm text-gray-600">
                Actualiza tus datos personales, experiencia y habilidades
              </p>
            </div>
          </Link>

          {/* Subir CV */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border-l-4 border-green-500 opacity-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                📄 Subir CV
              </h3>
              <span className="text-sm text-gray-500">(Próximamente)</span>
            </div>
            <p className="text-sm text-gray-600">
              Carga tu currículum actualizado (PDF)
            </p>
          </div>

          {/* Ver Ofertas */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border-l-4 border-purple-500 opacity-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                💼 Ver Ofertas
              </h3>
              <span className="text-sm text-gray-500">(Próximamente)</span>
            </div>
            <p className="text-sm text-gray-600">
              Explora las ofertas de trabajo disponibles
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Perfil Completado</p>
                <p className="text-3xl font-bold text-blue-600">
                  {candidato?.completitud_perfil || 0}%
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Postulaciones</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <div className="text-4xl">📨</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entrevistas</p>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatoDashboard;