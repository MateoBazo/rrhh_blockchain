// file: frontend/src/pages/candidato/MisPostulaciones.jsx

/**
 * 📬 MIS POSTULACIONES - Página Candidato
 * Lista de todas las postulaciones del candidato con tracking
 * Features: Filtros por estado, scores, timeline, retirar postulación
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader, AlertCircle, Filter } from 'lucide-react';
import { postulacionesAPI } from '../../api/postulaciones';
import { ESTADOS_POSTULACION, LABELS_ESTADO_POSTULACION } from '../../utils/constants';
import PostulacionCard from '../../components/postulaciones/PostulacionCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';

const MisPostulaciones = () => {
  const navigate = useNavigate();

  // Estados
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Cargar postulaciones
  const cargarPostulaciones = async (estado = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = estado ? { estado } : {};
      
      console.log('🔍 Cargando postulaciones con filtro:', params);

      const response = await postulacionesAPI.obtenerMisPostulaciones(null, params);
      
      console.log('✅ Respuesta API:', response.data);

      const data = response.data?.data || response.data;
      const postulacionesData = data.postulaciones || data.data?.postulaciones || [];

      setPostulaciones(postulacionesData);

    } catch (err) {
      console.error('❌ Error cargando postulaciones:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar postulaciones');
      setPostulaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarPostulaciones();
  }, []);

  // Handler filtro
  const handleFiltrarEstado = (estado) => {
    setFiltroEstado(estado);
    cargarPostulaciones(estado);
  };

  // Handler ver detalle
  const handleVerDetalle = (postulacion) => {
    // Por ahora solo navegar a la vacante
    navigate(`/candidato/vacantes/${postulacion.vacante_id}`);
  };

  // Handler retirar
  const handleRetirar = async (postulacion) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas retirar tu postulación a "${postulacion.vacante?.titulo}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    try {
      console.log('🗑️ Retirando postulación:', postulacion.id);

      await postulacionesAPI.retirar(postulacion.id);

      alert('Postulación retirada exitosamente');

      // Recargar lista
      cargarPostulaciones(filtroEstado);

    } catch (err) {
      console.error('❌ Error retirando postulación:', err);
      alert(err.response?.data?.mensaje || 'Error al retirar postulación');
    }
  };

  // Estadísticas rápidas
  const getEstadisticas = () => {
    const total = postulaciones.length;
    const activas = postulaciones.filter(p => 
      ['postulado', 'revisado', 'preseleccionado', 'entrevista'].includes(p.estado)
    ).length;
    const contratados = postulaciones.filter(p => p.estado === 'contratado').length;
    const scorePromedio = total > 0
      ? Math.round(
          postulaciones.reduce((sum, p) => sum + (p.score_compatibilidad || 0), 0) / total
        )
      : 0;

    return { total, activas, contratados, scorePromedio };
  };

  const stats = getEstadisticas();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Send className="mr-3" size={32} />
            Mis Postulaciones
          </h1>
          <p className="text-gray-600 mt-2">
            Sigue el progreso de tus postulaciones y gestiona tus aplicaciones
          </p>
        </div>

        {/* Estadísticas */}
        {!loading && !error && postulaciones.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total postulaciones</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activas}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Contrataciones</p>
              <p className="text-2xl font-bold text-green-600">{stats.contratados}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Score promedio</p>
              <p className="text-2xl font-bold text-purple-600">{stats.scorePromedio}%</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="
              flex items-center text-gray-700 hover:text-gray-900
              font-medium transition-colors
            "
          >
            <Filter size={18} className="mr-2" />
            Filtrar por estado
            {filtroEstado && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {LABELS_ESTADO_POSTULACION[filtroEstado]}
              </span>
            )}
          </button>

          {mostrarFiltros && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleFiltrarEstado('')}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg
                  transition-colors
                  ${
                    filtroEstado === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                Todas
              </button>
              {Object.entries(ESTADOS_POSTULACION).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleFiltrarEstado(value)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg
                    transition-colors
                    ${
                      filtroEstado === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {LABELS_ESTADO_POSTULACION[value]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <SkeletonCard variant="default" count={3} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
            <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Error al cargar postulaciones
              </h3>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => cargarPostulaciones(filtroEstado)}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && postulaciones.length === 0 && (
          <EmptyState
            icon="postulaciones"
            title={
              filtroEstado
                ? `No tienes postulaciones con estado "${LABELS_ESTADO_POSTULACION[filtroEstado]}"`
                : 'No tienes postulaciones'
            }
            description={
              filtroEstado
                ? 'Intenta cambiar el filtro para ver otras postulaciones.'
                : 'Aún no has postulado a ninguna vacante. Explora las oportunidades disponibles y aplica a las que te interesen.'
            }
            variant="info"
            action={
              filtroEstado
                ? {
                    label: 'Ver todas',
                    onClick: () => handleFiltrarEstado('')
                  }
                : {
                    label: 'Buscar vacantes',
                    onClick: () => navigate('/candidato/vacantes')
                  }
            }
          />
        )}

        {/* Lista de postulaciones */}
        {!loading && !error && postulaciones.length > 0 && (
          <div className="space-y-4">
            {postulaciones.map((postulacion) => (
              <PostulacionCard
                key={postulacion.id}
                postulacion={postulacion}
                vistaEmpresa={false}
                onVerDetalle={handleVerDetalle}
                onRetirar={handleRetirar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPostulaciones;