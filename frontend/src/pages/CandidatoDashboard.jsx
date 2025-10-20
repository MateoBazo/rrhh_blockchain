// file: src/pages/CandidatoDashboard.jsx
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export default function CandidatoDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">
            Dashboard Candidato
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              {user?.nombre} {user?.apellido}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-4">
            ¡Bienvenido, {user?.nombre}! 👋
          </h1>
          <p className="text-gray-600 mb-6">
            Este es tu dashboard de candidato. Aquí podrás:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Completar tu perfil profesional</li>
            <li>Subir tu CV y documentos</li>
            <li>Añadir certificaciones y referencias</li>
            <li>Ver ofertas de trabajo disponibles</li>
            <li>Gestionar tus postulaciones</li>
          </ul>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              <strong>🎯 Próximo paso:</strong> Completa tu perfil al 100% para
              aumentar tus posibilidades de ser contratado.
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            <Button variant="primary">Completar Perfil</Button>
            <Button variant="secondary">Subir CV</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Perfil Completado</h3>
            <p className="text-3xl font-bold text-blue-600">45%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Postulaciones</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Entrevistas</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}