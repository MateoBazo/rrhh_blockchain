// file: src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Páginas públicas
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import Landing from '../pages/Landing';

// Páginas protegidas (crearemos después)
import Dashboard from '../pages/Dashboard';
import CandidatoDashboard from '../pages/CandidatoDashboard';
import EmpresaDashboard from '../pages/EmpresaDashboard';
import AdminDashboard from '../pages/AdminDashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Dashboard genérico (redirige según rol) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Candidato */}
          <Route
            path="/candidato/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATO']}>
                <CandidatoDashboard />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Empresa */}
          <Route
            path="/empresa/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPRESA']}>
                <EmpresaDashboard />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}