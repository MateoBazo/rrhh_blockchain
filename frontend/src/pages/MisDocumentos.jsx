// file: frontend/src/pages/MisDocumentos.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import UploadDocumento from '../components/upload/UploadDocumento';
import ListaDocumentos from '../components/documentos/ListaDocumentos';

const MisDocumentos = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [mostrarUpload, setMostrarUpload] = useState(false);

  const handleDocumentoSubido = () => {
    setRefreshKey(prev => prev + 1); // Trigger reload de lista
    setMostrarUpload(false); // Cerrar upload
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navbar simple */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/candidato/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Volver
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              📄 Mis Documentos
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              👤 {user?.email}
            </span>
            <Button variant="outline" onClick={handleLogout} size="sm">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header con botón upload */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gestión de Documentos
            </h2>
            <p className="text-gray-600 mt-1">
              Administra tu CV, certificados y documentación
            </p>
          </div>
          
          <Button
            onClick={() => setMostrarUpload(!mostrarUpload)}
            variant="primary"
          >
            {mostrarUpload ? '❌ Cancelar' : '➕ Subir Documento'}
          </Button>
        </div>

        {/* Upload Section (collapsible) */}
        {mostrarUpload && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Subir Nuevo Documento
            </h3>
            <UploadDocumento onDocumentoSubido={handleDocumentoSubido} />
          </div>
        )}

        {/* Lista de documentos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📚 Tus Documentos
          </h3>
          <ListaDocumentos refresh={refreshKey} />
        </div>

      </div>
    </div>
  );
};

export default MisDocumentos;