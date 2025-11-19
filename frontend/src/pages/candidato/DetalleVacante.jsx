// file: frontend/src/pages/candidato/DetalleVacante.jsx

/**
 * 📄 DETALLE VACANTE - Página Candidato
 * Vista completa de una vacante con opción de postular
 * Features: Info completa, habilidades, requisitos, modal postular, validación ya postulado
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Briefcase,
  GraduationCap,
  Users,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { vacantesAPI } from '../../api/vacantes';
import { postulacionesAPI } from '../../api/postulaciones';
import BadgeEstado from '../../components/postulaciones/BadgeEstado';
import ModalPostular from '../../components/postulaciones/ModalPostular';

const DetalleVacante = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [vacante, setVacante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yaPostulado, setYaPostulado] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [postulando, setPostulando] = useState(false);

  // Cargar vacante
  useEffect(() => {
    cargarVacante();
    verificarPostulacion();
  }, [id]);

  const cargarVacante = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await vacantesAPI.obtenerPorId(id);
      const data = response.data?.data || response.data;
      
      console.log('✅ Vacante cargada:', data);
      setVacante(data);

    } catch (err) {
      console.error('❌ Error cargando vacante:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar vacante');
    } finally {
      setLoading(false);
    }
  };

  const verificarPostulacion = async () => {
    try {
      const response = await postulacionesAPI.obtenerMisPostulaciones();
      const misPostulaciones = response.data?.data?.postulaciones || response.data?.postulaciones || [];
      
      const yaPostulo = misPostulaciones.some(
        (p) => p.vacante_id === parseInt(id) && p.estado !== 'retirado'
      );

      setYaPostulado(yaPostulo);
    } catch (err) {
      console.error('Error verificando postulación:', err);
    }
  };

  // Handler postular
  const handlePostular = async (formData) => {
    try {
      setPostulando(true);

      const response = await postulacionesAPI.postular(formData);
      
      console.log('✅ Postulación exitosa:', response.data);

      // Actualizar estado
      setYaPostulado(true);
      setModalOpen(false);

      // Mostrar mensaje éxito
      alert('¡Postulación enviada exitosamente! Puedes ver su estado en "Mis Postulaciones"');

    } catch (err) {
      console.error('❌ Error al postular:', err);
      throw err; // Modal mostrará el error
    } finally {
      setPostulando(false);
    }
  };

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatear salario
  const formatSalario = () => {
    if (!vacante.mostrar_salario) return 'No especificado';
    if (vacante.salario_min && vacante.salario_max) {
      return `$${vacante.salario_min.toLocaleString()} - $${vacante.salario_max.toLocaleString()}`;
    }
    if (vacante.salario_min) {
      return `Desde $${vacante.salario_min.toLocaleString()}`;
    }
    return 'A convenir';
  };

  // Loading
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

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/candidato/vacantes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a búsqueda
          </button>
        </div>
      </div>
    );
  }

  if (!vacante) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="
            flex items-center text-gray-600 hover:text-gray-900
            mb-6 transition-colors
          "
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {vacante.titulo}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building2 size={20} className="mr-2" />
                    <span className="text-lg">
                      {vacante.empresa?.nombre_comercial || 'Empresa confidencial'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-2" />
                    <span>{vacante.ciudad}, {vacante.departamento}</span>
                  </div>
                </div>
                <BadgeEstado estado={vacante.estado} tipo="vacante" size="md" />
              </div>

              {/* Stats rápidos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <DollarSign size={24} className="mx-auto mb-1 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">{formatSalario()}</p>
                  <p className="text-xs text-gray-500">Salario</p>
                </div>
                <div className="text-center">
                  <Briefcase size={24} className="mx-auto mb-1 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {vacante.modalidad}
                  </p>
                  <p className="text-xs text-gray-500">Modalidad</p>
                </div>
                <div className="text-center">
                  <Clock size={24} className="mx-auto mb-1 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">
                    {vacante.experiencia_requerida_anios === 0
                      ? 'Sin experiencia'
                      : `${vacante.experiencia_requerida_anios}+ años`}
                  </p>
                  <p className="text-xs text-gray-500">Experiencia</p>
                </div>
                <div className="text-center">
                  <GraduationCap size={24} className="mx-auto mb-1 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">
                    {vacante.nivel_educativo_minimo || 'No especificado'}
                  </p>
                  <p className="text-xs text-gray-500">Educación</p>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Descripción del puesto
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {vacante.descripcion}
              </div>
            </div>

            {/* Requisitos */}
            {vacante.requisitos && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Requisitos
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {vacante.requisitos}
                </div>
              </div>
            )}

            {/* Habilidades requeridas */}
            {vacante.habilidades_requeridas && vacante.habilidades_requeridas.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Habilidades requeridas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {vacante.habilidades_requeridas.map((hab, index) => (
                    <span
                      key={index}
                      className="
                        px-3 py-1.5 bg-blue-100 text-blue-800
                        rounded-full text-sm font-medium
                      "
                    >
                      {hab.habilidad?.nombre || hab.nombre}
                      {hab.nivel_requerido && (
                        <span className="ml-1 text-blue-600">
                          ({hab.nivel_requerido})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Beneficios (si los hay) */}
            {vacante.beneficios && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Beneficios
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {vacante.beneficios}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* CTA Postular */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {yaPostulado ? (
                  <div className="text-center">
                    <CheckCircle className="mx-auto mb-3 text-green-600" size={48} />
                    <h3 className="font-bold text-gray-900 mb-2">
                      Ya postulaste a esta vacante
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Puedes ver el estado de tu postulación en "Mis Postulaciones"
                    </p>
                    <button
                      onClick={() => navigate('/candidato/postulaciones')}
                      className="
                        w-full px-4 py-2.5 bg-blue-600 text-white
                        rounded-lg hover:bg-blue-700 transition-colors
                        font-medium
                      "
                    >
                      Ver mis postulaciones
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-gray-900 mb-4">
                      ¿Interesado en esta oportunidad?
                    </h3>
                    <button
                      onClick={() => setModalOpen(true)}
                      disabled={vacante.estado !== 'abierta'}
                      className="
                        w-full px-4 py-3 bg-blue-600 text-white
                        rounded-lg hover:bg-blue-700 transition-colors
                        font-medium flex items-center justify-center
                        disabled:bg-gray-400 disabled:cursor-not-allowed
                      "
                    >
                      <Send size={20} className="mr-2" />
                      Postular ahora
                    </button>
                    {vacante.estado !== 'abierta' && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Esta vacante ya no está abierta
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Información adicional */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Información adicional
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <Calendar size={18} className="mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Publicada</p>
                      <p className="text-gray-600">{formatFecha(vacante.fecha_publicacion)}</p>
                    </div>
                  </div>

                  {vacante.fecha_cierre && (
                    <div className="flex items-start">
                      <Clock size={18} className="mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Cierra</p>
                        <p className="text-gray-600">{formatFecha(vacante.fecha_cierre)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <FileText size={18} className="mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Tipo de contrato</p>
                      <p className="text-gray-600 capitalize">
                        {vacante.tipo_contrato?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Briefcase size={18} className="mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Jornada</p>
                      <p className="text-gray-600 capitalize">
                        {vacante.jornada_laboral}
                      </p>
                    </div>
                  </div>

                  {vacante.vacantes_disponibles && (
                    <div className="flex items-start">
                      <Users size={18} className="mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Vacantes disponibles</p>
                        <p className="text-gray-600">{vacante.vacantes_disponibles}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Postular */}
      <ModalPostular
        vacante={vacante}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPostular={handlePostular}
        loading={postulando}
      />
    </div>
  );
};

export default DetalleVacante;