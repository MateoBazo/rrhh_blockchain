// file: frontend/src/pages/empresa/CrearVacante.jsx

/**
 * ✏️ CREAR/EDITAR VACANTE - Página Empresa
 * Formulario completo para publicar ofertas laborales
 * Features: Validación, guardado borrador, publicación, modo edición
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, Loader, AlertCircle } from 'lucide-react';
import { vacantesAPI } from '../../api/vacantes';
import {
  MODALIDADES_TRABAJO,
  TIPOS_CONTRATO,
  JORNADAS_LABORALES,
  NIVELES_EDUCATIVOS
} from '../../utils/constants';

const CrearVacante = () => {
  const { id } = useParams(); // Si existe ID, estamos editando
  const navigate = useNavigate();
  const modoEdicion = !!id;

  // Estados
  const [loading, setLoading] = useState(modoEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    ciudad: 'Cochabamba',
    departamento: 'Cochabamba',
    modalidad: 'presencial',
    tipo_contrato: 'indefinido',
    jornada_laboral: 'completa',
    salario_min: '',
    salario_max: '',
    mostrar_salario: true,
    experiencia_requerida_anios: 0,
    nivel_educativo_minimo: 'secundaria',
    beneficios: '',
    vacantes_disponibles: 1,
    fecha_cierre: '',
    estado: 'borrador'
  });

  // Cargar vacante si estamos editando
  useEffect(() => {
    if (modoEdicion) {
      cargarVacante();
    }
  }, [id]);

  const cargarVacante = async () => {
    try {
      const response = await vacantesAPI.obtenerPorId(id);
      const vacante = response.data?.data || response.data;

      // Mapear datos al form
      setFormData({
        titulo: vacante.titulo || '',
        descripcion: vacante.descripcion || '',
        requisitos: vacante.requisitos || '',
        ciudad: vacante.ciudad || 'Cochabamba',
        departamento: vacante.departamento || 'Cochabamba',
        modalidad: vacante.modalidad || 'presencial',
        tipo_contrato: vacante.tipo_contrato || 'indefinido',
        jornada_laboral: vacante.jornada_laboral || 'completa',
        salario_min: vacante.salario_min || '',
        salario_max: vacante.salario_max || '',
        mostrar_salario: vacante.mostrar_salario !== false,
        experiencia_requerida_anios: vacante.experiencia_requerida_anios || 0,
        nivel_educativo_minimo: vacante.nivel_educativo_minimo || 'secundaria',
        beneficios: vacante.beneficios || '',
        vacantes_disponibles: vacante.vacantes_disponibles || 1,
        fecha_cierre: vacante.fecha_cierre ? vacante.fecha_cierre.split('T')[0] : '',
        estado: vacante.estado || 'borrador'
      });

    } catch (err) {
      console.error('Error cargando vacante:', err);
      setError('Error al cargar la vacante');
    } finally {
      setLoading(false);
    }
  };

  // Handler cambios
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validar form
  const validarForm = () => {
    const errores = [];

    if (!formData.titulo.trim()) errores.push('El título es obligatorio');
    if (formData.titulo.length < 5) errores.push('El título debe tener al menos 5 caracteres');
    if (!formData.descripcion.trim()) errores.push('La descripción es obligatoria');
    if (formData.descripcion.length < 50) errores.push('La descripción debe tener al menos 50 caracteres');
    if (!formData.ciudad.trim()) errores.push('La ciudad es obligatoria');
    if (!formData.departamento.trim()) errores.push('El departamento es obligatorio');
    
    if (formData.salario_min && formData.salario_max) {
      if (parseInt(formData.salario_max) < parseInt(formData.salario_min)) {
        errores.push('El salario máximo debe ser mayor al mínimo');
      }
    }

    if (formData.vacantes_disponibles < 1) {
      errores.push('Debe haber al menos 1 vacante disponible');
    }

    return errores;
  };

  // Guardar (borrador o publicar)
  const handleSubmit = async (publicar = false) => {
    try {
      // Validar
      const errores = validarForm();
      if (errores.length > 0) {
        alert('Errores de validación:\n\n' + errores.join('\n'));
        return;
      }

      setGuardando(true);
      setError(null);

      // Preparar datos
      const datos = {
        ...formData,
        estado: publicar ? 'abierta' : formData.estado,
        salario_min: formData.salario_min ? parseInt(formData.salario_min) : null,
        salario_max: formData.salario_max ? parseInt(formData.salario_max) : null,
        experiencia_requerida_anios: parseInt(formData.experiencia_requerida_anios),
        vacantes_disponibles: parseInt(formData.vacantes_disponibles),
        fecha_cierre: formData.fecha_cierre || null
      };

      console.log('💾 Guardando vacante:', datos);

      let response;
      if (modoEdicion) {
        response = await vacantesAPI.actualizar(id, datos);
      } else {
        response = await vacantesAPI.crear(datos);
      }

      console.log('✅ Vacante guardada:', response.data);

      alert(
        modoEdicion
          ? 'Vacante actualizada exitosamente'
          : `Vacante ${publicar ? 'publicada' : 'guardada como borrador'} exitosamente`
      );

      navigate('/empresa/vacantes');

    } catch (err) {
      console.error('❌ Error guardando vacante:', err);
      setError(err.response?.data?.mensaje || 'Error al guardar vacante');
    } finally {
      setGuardando(false);
    }
  };

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Cargando vacante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/empresa/vacantes')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a mis vacantes
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {modoEdicion ? 'Editar Vacante' : 'Crear Nueva Vacante'}
          </h1>
          <p className="text-gray-600 mt-2">
            {modoEdicion
              ? 'Actualiza la información de tu oferta laboral'
              : 'Completa el formulario para publicar una nueva oferta laboral'}
          </p>
        </div>

        {/* Error global */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Sección 1: Información básica */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información Básica
            </h2>

            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del puesto *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Desarrollador Full Stack Senior"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.titulo.length}/200 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del puesto *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe las responsabilidades, tareas principales y objetivos del puesto..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.descripcion.length} caracteres (mínimo 50)
                </p>
              </div>

              {/* Requisitos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requisitos y calificaciones
                </label>
                <textarea
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Lista los requisitos técnicos, experiencia y habilidades necesarias..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Ubicación y modalidad */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ubicación y Modalidad
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Departamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento *
                </label>
                <input
                  type="text"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Modalidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modalidad de trabajo *
                </label>
                <select
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(MODALIDADES_TRABAJO).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de contrato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de contrato
                </label>
                <select
                  name="tipo_contrato"
                  value={formData.tipo_contrato}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(TIPOS_CONTRATO).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jornada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jornada laboral
                </label>
                <select
                  name="jornada_laboral"
                  value={formData.jornada_laboral}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(JORNADAS_LABORALES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vacantes disponibles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vacantes disponibles
                </label>
                <input
                  type="number"
                  name="vacantes_disponibles"
                  value={formData.vacantes_disponibles}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Salario */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Compensación
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="mostrar_salario"
                  checked={formData.mostrar_salario}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Mostrar rango salarial en la publicación
                </label>
              </div>

              {formData.mostrar_salario && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salario mínimo (Bs)
                    </label>
                    <input
                      type="number"
                      name="salario_min"
                      value={formData.salario_min}
                      onChange={handleChange}
                      placeholder="3000"
                      min="0"
                      step="500"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salario máximo (Bs)
                    </label>
                    <input
                      type="number"
                      name="salario_max"
                      value={formData.salario_max}
                      onChange={handleChange}
                      placeholder="8000"
                      min="0"
                      step="500"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección 4: Requisitos */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Requisitos del Candidato
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experiencia requerida (años)
                </label>
                <input
                  type="number"
                  name="experiencia_requerida_anios"
                  value={formData.experiencia_requerida_anios}
                  onChange={handleChange}
                  min="0"
                  max="30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  0 = Sin experiencia requerida
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel educativo mínimo
                </label>
                <select
                  name="nivel_educativo_minimo"
                  value={formData.nivel_educativo_minimo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(NIVELES_EDUCATIVOS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección 5: Beneficios */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Beneficios (Opcional)
            </h2>

            <textarea
              name="beneficios"
              value={formData.beneficios}
              onChange={handleChange}
              rows={4}
              placeholder="Seguro médico, bonos, flexibilidad horaria, capacitaciones..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Sección 6: Fecha de cierre */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Fecha de Cierre (Opcional)
            </h2>

            <div className="max-w-md">
              <input
                type="date"
                name="fecha_cierre"
                value={formData.fecha_cierre}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                La vacante se cerrará automáticamente en esta fecha
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => navigate('/empresa/vacantes')}
            disabled={guardando}
            className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            onClick={() => handleSubmit(false)}
            disabled={guardando}
            className="px-6 py-2.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center"
          >
            <Save size={18} className="mr-2" />
            {guardando ? 'Guardando...' : 'Guardar borrador'}
          </button>

          <button
            onClick={() => handleSubmit(true)}
            disabled={guardando}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {guardando ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Guardando...
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" />
                {modoEdicion ? 'Actualizar y publicar' : 'Publicar vacante'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearVacante;