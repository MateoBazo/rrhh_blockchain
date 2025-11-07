// file: frontend/src/components/upload/UploadFoto.jsx
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { candidatosAPI } from '../../api/candidatos';

const UploadFoto = ({ fotoActual, onFotoActualizada }) => {
  // ==========================================
  // ESTADOS
  // ==========================================
  const [preview, setPreview] = useState(fotoActual);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ==========================================
  // CONSTANTES DE VALIDACIÓN
  // ==========================================
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
  };

  // ==========================================
  // VALIDACIÓN DE ARCHIVO
  // ==========================================
  const validateFile = (file) => {
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('❌ Solo se permiten imágenes JPG o PNG');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`❌ La imagen pesa ${sizeMB}MB. Máximo permitido: 5MB`);
      return false;
    }
    
    return true;
  };

  // ==========================================
  // HANDLER: DRAG & DROP / SELECT FILE
  // ==========================================
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Manejar archivos rechazados
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('❌ Archivo demasiado grande (máx. 5MB)');
      } else if (error.code === 'file-invalid-type') {
        toast.error('❌ Tipo de archivo no permitido');
      }
      return;
    }

    const file = acceptedFiles[0];
    
    if (validateFile(file)) {
      setSelectedFile(file);
      
      // Crear preview usando FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      toast.success('Imagen seleccionada. Haz clic en "Subir Foto" para confirmar.');
    }
  }, []);

  // ==========================================
  // CONFIGURACIÓN DROPZONE
  // ==========================================
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
    maxSize: MAX_FILE_SIZE,
    disabled: uploading || deleting
  });

  // ==========================================
  // HANDLER: SUBIR FOTO
  // ==========================================
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('❌ No has seleccionado ninguna imagen');
      return;
    }

    setUploading(true);
    
    try {
      // Crear FormData
      const formData = new FormData();
      formData.append('foto', selectedFile);

      // Enviar al backend
      const response = await candidatosAPI.uploadFoto(formData);

      if (response.data.success) {
        const nuevaFotoUrl = response.data.data.foto_url;
        
        toast.success('✅ Foto actualizada correctamente');
        
        // Notificar al componente padre
        if (onFotoActualizada) {
          onFotoActualizada(nuevaFotoUrl);
        }
        
        // Limpiar estado
        setSelectedFile(null);
        setPreview(`${import.meta.env.VITE_API_URL}${nuevaFotoUrl}?t=${Date.now()}`);
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      const mensaje = error.response?.data?.message || 'Error al subir la foto';
      toast.error(`❌ ${mensaje}`);
      
      // Revertir preview
      if (fotoActual) {
        setPreview(fotoActual);
      } else {
        setPreview(null);
      }
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // HANDLER: ELIMINAR FOTO
  // ==========================================
  const handleEliminar = async () => {
    if (!window.confirm('¿Estás seguro de eliminar tu foto de perfil?')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await candidatosAPI.eliminarFoto();

      if (response.data.success) {
        toast.success('✅ Foto eliminada correctamente');
        
        setPreview(null);
        setSelectedFile(null);
        
        if (onFotoActualizada) {
          onFotoActualizada(null);
        }
      }
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      const mensaje = error.response?.data?.message || 'Error al eliminar la foto';
      toast.error(`❌ ${mensaje}`);
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // HANDLER: CANCELAR SELECCIÓN
  // ==========================================
  const handleCancelar = () => {
    setSelectedFile(null);
    if (fotoActual) {
      setPreview(fotoActual);
    } else {
      setPreview(null);
    }
    toast('Selección cancelada', { icon: '🔄' });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-4">
      {/* PREVIEW FOTO ACTUAL/SELECCIONADA */}
      <div className="flex justify-center">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Foto de perfil"
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
            {selectedFile && (
              <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                NUEVA
              </div>
            )}
          </div>
        ) : (
          <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* DROPZONE */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${(uploading || deleting) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-3"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {isDragActive ? (
          <p className="text-blue-600 font-medium">
            ¡Suelta la imagen aquí!
          </p>
        ) : (
          <div>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold text-blue-600">Haz clic para seleccionar</span> o arrastra una imagen
            </p>
            <p className="text-sm text-gray-500">
              JPG o PNG (máx. 5MB)
            </p>
          </div>
        )}
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-3">
        {/* Botón SUBIR (visible solo si hay archivo seleccionado) */}
        {selectedFile && (
          <>
            <button
              onClick={handleUpload}
              disabled={uploading || deleting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium
                       hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                       transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Subiendo...
                </>
              ) : (
                <>
                  📸 Subir Foto
                </>
              )}
            </button>

            <button
              onClick={handleCancelar}
              disabled={uploading || deleting}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200"
            >
              Cancelar
            </button>
          </>
        )}

        {/* Botón ELIMINAR (visible solo si hay foto actual y NO hay selección nueva) */}
        {preview && !selectedFile && fotoActual && (
          <button
            onClick={handleEliminar}
            disabled={uploading || deleting}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium
                     hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                     transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Eliminando...
              </>
            ) : (
              <>
                🗑️ Eliminar Foto
              </>
            )}
          </button>
        )}
      </div>

      {/* INFO ADICIONAL */}
      <div className="text-sm text-gray-500 text-center">
        <p>💡 Recomendación: usa una foto cuadrada para mejor visualización</p>
      </div>
    </div>
  );
};

export default UploadFoto;