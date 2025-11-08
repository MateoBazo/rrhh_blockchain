// file: frontend/src/components/documentos/ListaDocumentos.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { documentosAPI } from '../../api/documentos';
import Button from '../common/Button';
import VisorPDF from './VisorPDF';

const ListaDocumentos = ({ refresh = 0 }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [visorOpen, setVisorOpen] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  // Mapeo de tipos a iconos y colores
  const TIPOS_CONFIG = {
    cv: { icon: '📄', color: 'blue', label: 'CV' },
    certificado_laboral: { icon: '💼', color: 'green', label: 'Certificado Laboral' },
    titulo_academico: { icon: '🎓', color: 'purple', label: 'Título Académico' },
    certificacion: { icon: '🏆', color: 'yellow', label: 'Certificación' },
    contrato: { icon: '📝', color: 'gray', label: 'Contrato' },
    carta_recomendacion: { icon: '✉️', color: 'pink', label: 'Carta de Recomendación' },
    otro: { icon: '📎', color: 'gray', label: 'Otro' }
  };

  // Cargar documentos
  useEffect(() => {
    cargarDocumentos();
  }, [refresh]);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      const response = await documentosAPI.getMisDocumentos();
      
      if (response.data.success) {
        setDocumentos(response.data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  // Handler ver documento
  const handleVer = (documento) => {
    setDocumentoSeleccionado(documento);
    setVisorOpen(true);
  };

  // Handler eliminar documento
  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      const response = await documentosAPI.eliminarDocumento(id);

      if (response.data.success) {
        toast.success('✅ Documento eliminado');
        setDocumentos(prev => prev.filter(doc => doc.id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      toast.error('Error al eliminar documento');
    } finally {
      setDeleting(null);
    }
  };

  // Handler descargar
  const handleDescargar = (documento) => {
  const url = documentosAPI.getDocumentoUrl(documento.path_cifrado);
  if (url) {
    // Abrir en nueva pestaña
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = documento.nombre_original; // Sugerir nombre original
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('📥 Descargando documento...');
  } else {
    toast.error('❌ No se pudo obtener la URL del documento');
  }
};

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear tamaño
  const formatearTamano = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (documentos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin documentos</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza subiendo tu CV o certificados
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentos.map((doc) => {
          const config = TIPOS_CONFIG[doc.tipo] || TIPOS_CONFIG.otro;
          
          return (
            <div
              key={doc.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{config.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {doc.nombre_original}
                    </h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {doc.descripcion && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {doc.descripcion}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span>📅 {formatearFecha(doc.fecha_subida)}</span>
                <span>💾 {formatearTamano(doc.tamano_bytes)}</span>
              </div>

              {/* Hash SHA256 (verificación) */}
              <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">
                  🔐 Hash SHA256 (Verificación de Integridad):
                </p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {doc.hash_sha256}
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleVer(doc)}
                  variant="primary"
                  size="sm"
                  fullWidth
                >
                  👁️ Ver
                </Button>
                
                <Button
                  onClick={() => handleDescargar(doc)}
                  variant="secondary"
                  size="sm"
                >
                  📥
                </Button>

                <Button
                  onClick={() => handleEliminar(doc.id, doc.nombre_original)}
                  variant="outline"
                  size="sm"
                  loading={deleting === doc.id}
                  disabled={deleting === doc.id}
                >
                  🗑️
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visor PDF Modal */}
      {visorOpen && documentoSeleccionado && (
        <VisorPDF
          documento={documentoSeleccionado}
          onClose={() => {
            setVisorOpen(false);
            setDocumentoSeleccionado(null);
          }}
        />
      )}
    </>
  );
};

export default ListaDocumentos;