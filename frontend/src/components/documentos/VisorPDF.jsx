// file: frontend/src/components/documentos/VisorPDF.jsx
import { useEffect } from 'react';
import { documentosAPI } from '../../api/documentos';
import Button from '../common/Button';

const VisorPDF = ({ documento, onClose }) => {
  const urlDocumento = documentosAPI.getDocumentoUrl(documento.path_cifrado);

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevenir scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDescargar = () => {
    if (urlDocumento) {
      window.open(urlDocumento, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {documento.nombre_original}
              </h2>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {documento.tipo.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleDescargar} variant="secondary" size="sm">
                📥 Descargar
              </Button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-auto p-4 bg-gray-100">
            {/* Si es PDF */}
            {documento.mime_type === 'application/pdf' ? (
              <iframe
                src={urlDocumento}
                className="w-full h-full min-h-[600px] rounded border-0"
                title={documento.nombre_original}
              />
            ) : documento.mime_type?.startsWith('image/') ? (
              /* Si es imagen */
              <div className="flex justify-center items-center h-full">
                <img
                  src={urlDocumento}
                  alt={documento.nombre_original}
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
            ) : (
              /* Otros tipos */
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 mb-4">
                  Vista previa no disponible para este tipo de archivo
                </p>
                <Button onClick={handleDescargar} variant="primary">
                  📥 Descargar para ver
                </Button>
              </div>
            )}
          </div>

          {/* Footer con info */}
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Tipo:</span> {documento.mime_type}
              </div>
              <div>
                <span className="font-medium">Tamaño:</span> {(documento.tamano_bytes / 1024).toFixed(2)} KB
              </div>
              <div>
                <span className="font-medium">Subido:</span> {new Date(documento.fecha_subida).toLocaleDateString('es-ES')}
              </div>
              <div>
                <span className="font-medium">Hash:</span> {documento.hash_sha256?.substring(0, 8)}...
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisorPDF;