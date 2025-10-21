// file: src/pages/EmpresaDashboard.jsx
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export default function EmpresaDashboard() {
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
            Dashboard Empresa
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
            ¡Bienvenido, {user?.nombre}! 🏢
          </h1>
          <p className="text-gray-600 mb-6">
            Este es tu dashboard de empresa. Aquí podrás:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Publicar ofertas de trabajo</li>
            <li>Buscar candidatos en la base de datos</li>
            <li>Ver perfiles verificados en blockchain</li>
            <li>Gestionar procesos de selección</li>
            <li>Contratar talento de forma segura</li>
          </ul>

          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              <strong>🚀 Próximo paso:</strong> Completa el perfil de tu empresa
              y publica tu primera oferta de trabajo.
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            <Button variant="primary">Publicar Oferta</Button>
            <Button variant="secondary">Buscar Candidatos</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Ofertas Activas</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Candidatos Vistos</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Contrataciones</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}