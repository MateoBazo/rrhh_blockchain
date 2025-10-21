// file: src/pages/AdminDashboard.jsx
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
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
            Dashboard Administrador
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              {user?.nombre} {user?.apellido} (ADMIN)
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
            Panel de Administración ⚙️
          </h1>
          <p className="text-gray-600 mb-6">
            Como administrador, tienes acceso completo a:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Gestión de usuarios (Candidatos, Empresas, Admins)</li>
            <li>Analytics y métricas del sistema</li>
            <li>Moderación de contenido</li>
            <li>Configuración de blockchain</li>
            <li>Logs de auditoría</li>
          </ul>

          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              <strong>⚠️ Acceso privilegiado:</strong> Ten cuidado con las acciones
              que realices en este panel.
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            <Button variant="primary">Ver Usuarios</Button>
            <Button variant="secondary">Analytics</Button>
            <Button variant="danger">Logs de Sistema</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Total Usuarios</h3>
            <p className="text-3xl font-bold text-blue-600">5</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Candidatos</h3>
            <p className="text-3xl font-bold text-green-600">3</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Empresas</h3>
            <p className="text-3xl font-bold text-purple-600">1</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-2">Admins</h3>
            <p className="text-3xl font-bold text-orange-600">1</p>
          </div>
        </div>
      </div>
    </div>
  );
}