// file: frontend/src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Páginas públicas
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import Landing from '../pages/Landing';
import VerificarReferencia from '../pages/VerificarReferencia';

// Páginas protegidas - Candidato
import Dashboard from '../pages/Dashboard';
import CandidatoDashboard from '../pages/CandidatoDashboard';
import PerfilUsuario from '../pages/PerfilUsuario';
import MisDocumentos from '../pages/MisDocumentos';
import MisReferencias from '../pages/MisReferencias';
import BuscarVacantes from '../pages/candidato/BuscarVacantes';
import DetalleVacante from '../pages/candidato/DetalleVacante';
import MisPostulaciones from '../pages/candidato/MisPostulaciones';

// Páginas protegidas - Empresa
import EmpresaDashboard from '../pages/EmpresaDashboard';
import ReferenciasVerificadas from '../pages/ReferenciasVerificadas'; // 🆕 NUEVO

// Páginas protegidas - Admin
import AdminDashboard from '../pages/AdminDashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ============================================ */}
          {/* RUTAS PÚBLICAS */}
          {/* ============================================ */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/verificar-referencia/:token" element={<VerificarReferencia />} />

          {/* ============================================ */}
          {/* DASHBOARD GENÉRICO (redirige según rol) */}
          {/* ============================================ */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ============================================ */}
          {/* RUTAS CANDIDATO */}
          {/* ============================================ */}
          <Route
            path="/candidato/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATO']}>
                <CandidatoDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATO']}>
                <PerfilUsuario />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mis-documentos"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATO']}>
                <MisDocumentos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mis-referencias"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATO']}>
                <MisReferencias />
              </ProtectedRoute>
            }
          />
          <Route 
          path="/candidato/vacantes" 
          element={
            <ProtectedRoute roles={['CANDIDATO']}>
              <BuscarVacantes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/candidato/vacantes/:id" 
          element={
            <ProtectedRoute roles={['CANDIDATO']}>
              <DetalleVacante />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/candidato/postulaciones" 
          element={
            <ProtectedRoute roles={['CANDIDATO']}>
              <MisPostulaciones />
            </ProtectedRoute>
          } 
        />
          {/* ============================================ */}
          {/* RUTAS EMPRESA */}
          {/* ============================================ */}
          <Route
            path="/empresa/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPRESA']}>
                <EmpresaDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🆕 NUEVA RUTA S008.3 - Ver referencias verificadas de candidato */}
          <Route
            path="/empresa/candidatos/:id/referencias"
            element={
              <ProtectedRoute allowedRoles={['EMPRESA']}>
                <ReferenciasVerificadas />
              </ProtectedRoute>
            }
          />

          {/* ============================================ */}
          {/* RUTAS ADMIN */}
          {/* ============================================ */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ============================================ */}
          {/* RUTA 404 */}
          {/* ============================================ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}