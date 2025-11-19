// file: frontend/src/components/postulaciones/ModalPostular.jsx

/**
 * 📝 MODAL POSTULAR
 * Modal para postular a una vacante
 * Incluye: información vacante, carta presentación, CV opcional
 */

import React, { useState } from 'react';
import {
  X,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Upload,
  AlertCircle,
  Send
} from 'lucide-react';

const ModalPostular = ({ vacante, isOpen, onClose, onPostular, loading = false }) => {
  const [formData, setFormData] = useState({
    carta_presentacion: '',
    cv_archivo: null
  });

  const [error, setError] = useState('');

  // Cerrar modal si no está abierto
  if (!isOpen || !vacante) return null;

  // Manejar cambio textarea
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Manejar archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tipo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Solo se permiten archivos PDF o Word');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, cv_archivo: file }));
      setError('');
    }
  };

  // Enviar postulación
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.carta_presentacion.trim()) {
      setError('La carta de presentación es obligatoria');
      return;
    }

    if (formData.carta_presentacion.length < 50) {
      setError('La carta de presentación debe tener al menos 50 caracteres');
      return;
    }

    try {
      await onPostular({
        vacante_id: vacante.id,
        carta_presentacion: formData.carta_presentacion.trim(),
        cv_postulacion: formData.cv_archivo
      });

      // Cerrar modal
      onClose();
      
      // Limpiar form
      setFormData({ carta_presentacion: '', cv_archivo: null });
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al postular');
    }
  };

  // Formatear salario
  const formatSalario = () => {
    if (!vacante.mostrar_salario) return 'No especificado';
    if (vacante.salario_min && vacante.salario_max) {
      return `$${vacante.salario_min.toLocaleString()} - $${vacante.salario_max.toLocaleString()}`;
    }
    return 'A convenir';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="
            bg-white rounded-lg shadow-xl
            max-w-2xl w-full max-h-[90vh] overflow-y-auto
            animate-fadeIn
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Postular a vacante
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Completa tu postulación para aumentar tus posibilidades
              </p>
            </div>
            <button
              onClick={onClose}
              className="
                p-2 hover:bg-gray-100 rounded-lg
                transition-colors
              "
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            {/* Información vacante */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                {vacante.titulo}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Briefcase size={16} className="mr-2" />
                  <span>{vacante.empresa?.nombre_comercial}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>{vacante.ciudad}, {vacante.departamento}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <DollarSign size={16} className="mr-2" />
                  <span>{formatSalario()}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>
                    {vacante.experiencia_requerida_anios === 0
                      ? 'Sin experiencia'
                      : `${vacante.experiencia_requerida_anios}+ años`}
                  </span>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-6">
              {/* Carta de presentación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carta de presentación *
                  <span className="text-gray-500 font-normal ml-2">
                    (mínimo 50 caracteres)
                  </span>
                </label>
                <textarea
                  name="carta_presentacion"
                  value={formData.carta_presentacion}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Explica por qué eres el candidato ideal para esta posición. Menciona tu experiencia relevante, habilidades clave y motivación para aplicar..."
                  className="
                    w-full px-4 py-3 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    resize-none
                  "
                  maxLength={2000}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.carta_presentacion.length}/2000 caracteres
                  </p>
                  {formData.carta_presentacion.length >= 50 && (
                    <p className="text-xs text-green-600 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      Longitud adecuada
                    </p>
                  )}
                </div>
              </div>

              {/* CV opcional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CV (opcional)
                  <span className="text-gray-500 font-normal ml-2">
                    - Adjunta un CV específico para esta vacante
                  </span>
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-upload"
                  />
                  
                  {formData.cv_archivo ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FileText size={20} className="text-green-600" />
                      <span className="text-sm text-gray-900">
                        {formData.cv_archivo.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, cv_archivo: null }))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="cv-upload"
                      className="cursor-pointer"
                    >
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Click para subir archivo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF o Word (máx. 5MB)
                      </p>
                    </label>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  💡 Si no adjuntas CV, se usará el de tu perfil
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle size={18} className="text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="
                  px-4 py-2 text-sm font-medium text-gray-700
                  border border-gray-300 rounded-lg
                  hover:bg-gray-100 transition-colors
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || formData.carta_presentacion.length < 50}
                className="
                  px-6 py-2 text-sm font-medium text-white
                  bg-blue-600 rounded-lg
                  hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed
                  transition-colors flex items-center
                "
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Postulando...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Enviar postulación
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ModalPostular;