// file: src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" text="Verificando sesión..." />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">🚫 Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta página.
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  // Si todo está OK, mostrar el contenido
  return children;
}