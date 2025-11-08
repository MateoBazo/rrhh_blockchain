// file: frontend/src/components/upload/UploadDocumento.jsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { documentosAPI } from '../../api/documentos';
import Button from '../common/Button';

const UploadDocumento = ({ onDocumentoSubido }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState('cv');
  const [descripcion, setDescripcion] = useState('');

  // ✅ Tipos de documento según TU backend
  const TIPOS_DOCUMENTO = [
    { value: 'cv', label: '📄 Currículum Vitae (CV)' },
    { value: 'certificado_laboral', label: '💼 Certificado Laboral' },
    { value: 'titulo_academico', label: '🎓 Título Académico' },
    { value: 'certificacion', label: '🏆 Certificación' },
    { value: 'contrato', label: '📝 Contrato' },
    { value: 'carta_recomendacion', label: '✉️ Carta de Recomendación' },
    { value: 'otro', label: '📎 Otro' }
  ];

  // Validación archivo
  const validateFile = (file) => {
    // ✅ Tu backend acepta: PDF, DOC, DOCX, JPG, PNG
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('❌ Tipo no permitido. Solo: PDF, DOC, DOCX, JPG, PNG');
      return false;
    }

    // ✅ Máximo 15MB según tu backend
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`❌ El archivo pesa ${sizeMB}MB. Máximo permitido: 15MB`);
      return false;
    }

    return true;
  };

  // Handler dropzone
  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('❌ Archivo rechazado');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (!validateFile(file)) {
        return;
      }

      setSelectedFile(file);
      toast.success(`✅ Archivo seleccionado: ${file.name}`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    multiple: false
  });

  // Handler upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('❌ Selecciona un archivo primero');
      return;
    }

    if (!tipoDocumento) {
      toast.error('❌ Selecciona el tipo de documento');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('documento', selectedFile); // ✅ Campo 'documento' según tu multer
      formData.append('tipo_documento', tipoDocumento);
      formData.append('nombre_documento', selectedFile.name);
      
      if (descripcion.trim()) {
        formData.append('descripcion', descripcion.trim());
      }

      console.log('📤 Subiendo documento:', {
        tipo: tipoDocumento,
        nombre: selectedFile.name,
        tamaño: `${(selectedFile.size / 1024).toFixed(2)} KB`
      });

      const response = await documentosAPI.uploadDocumento(formData);

      console.log('✅ Respuesta upload:', response.data);

      if (response.data.success) {
        toast.success('✅ Documento subido exitosamente');
        
        // Reset form
        setSelectedFile(null);
        setDescripcion('');
        
        // Callback al padre
        if (onDocumentoSubido) {
          onDocumentoSubido(response.data.data);
        }
      }
    } catch (error) {
      console.error('❌ Error al subir documento:', error);
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.mensaje || 
                       'Error al subir documento';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  // Handler cancelar
  const handleCancelar = () => {
    setSelectedFile(null);
    setDescripcion('');
    toast('Selección cancelada 🔄', { icon: '🔄' });
  };

  // Icono según tipo de archivo
  const getFileIcon = () => {
    if (!selectedFile) return null;
    
    if (selectedFile.type === 'application/pdf') return '📕';
    if (selectedFile.type.includes('word')) return '📘';
    if (selectedFile.type.includes('image')) return '🖼️';
    return '📄';
  };

  return (
    <div className="space-y-4">
      
      {/* Select Tipo Documento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Documento *
        </label>
        <select
          value={tipoDocumento}
          onChange={(e) => setTipoDocumento(e.target.value)}
          className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={uploading}
        >
          {TIPOS_DOCUMENTO.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        <div className="space-y-2">
          {selectedFile ? (
            <>
              <div className="text-5xl">{getFileIcon()}</div>
              <div className="text-sm text-gray-700">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-xs text-gray-400">
                  {selectedFile.type}
                </p>
              </div>
              <p className="text-xs text-green-600 font-medium">
                ✅ Archivo listo para subir
              </p>
            </>
          ) : (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-sm text-gray-600">
                {isDragActive ? (
                  <p className="font-medium text-blue-600">
                    📂 Suelta el archivo aquí...
                  </p>
                ) : (
                  <>
                    <p className="font-medium">
                      Haz clic para seleccionar o arrastra un archivo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, JPG, PNG • Máximo 15MB
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Descripción opcional */}
      {selectedFile && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Título de Ingeniero en Sistemas - Universidad XYZ, 2020"
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            disabled={uploading}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {descripcion.length}/500 caracteres
          </p>
        </div>
      )}

      {/* Botones */}
      {selectedFile && (
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            variant="primary"
            loading={uploading}
            disabled={uploading}
            fullWidth
          >
            {uploading ? '📤 Subiendo...' : '📤 Subir Documento'}
          </Button>
          
          <Button
            onClick={handleCancelar}
            variant="secondary"
            disabled={uploading}
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Info adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">ℹ️ Información importante:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Formatos permitidos: PDF, DOC, DOCX, JPG, PNG</li>
              <li>Tamaño máximo: 15MB por archivo</li>
              <li>Se calculará un hash SHA256 para verificar integridad</li>
              <li>Tus documentos son privados y solo tú puedes verlos</li>
              <li>No se permite subir duplicados (mismo contenido)</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UploadDocumento;