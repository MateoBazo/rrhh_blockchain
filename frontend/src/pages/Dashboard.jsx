// file: src/pages/Dashboard.jsx
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" text="Cargando dashboard..." />
      </div>
    );
  }

  // Redirigir según rol
  if (user?.rol === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.rol === 'EMPRESA') {
    return <Navigate to="/empresa/dashboard" replace />;
  } else if (user?.rol === 'CANDIDATO') {
    return <Navigate to="/candidato/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}