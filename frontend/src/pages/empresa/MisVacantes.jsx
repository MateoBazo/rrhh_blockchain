// file: frontend/src/pages/empresa/MisVacantes.jsx

/**
 * 💼 MIS VACANTES - Página Empresa
 * Lista y gestión de todas las vacantes de la empresa
 * Features: Filtros por estado, acciones (editar, pausar, cerrar, ver postulaciones), métricas
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Edit, Pause, X, Users, Eye, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { vacantesAPI } from '../../api/vacantes';
import { ESTADOS_VACANTE } from '../../utils/constants';
import VacanteCard from '../../components/vacantes/VacanteCard';
import BadgeEstado from '../../components/postulaciones/BadgeEstado';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';

const MisVacantes = () => {
  const navigate = useNavigate();

  // Estados
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  // Cargar vacantes
  const cargarVacantes = async (estado = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = estado ? { estado } : {};
      
      console.log('🔍 Cargando vacantes empresa con filtro:', params);

      const response = await vacantesAPI.listarPorEmpresa(params);
      
      console.log('✅ Respuesta API:', response.data);

      const data = response.data?.data || response.data;
      const vacantesData = data.vacantes || data.data?.vacantes || data || [];

      setVacantes(Array.isArray(vacantesData) ? vacantesData : []);

    } catch (err) {
      console.error('❌ Error cargando vacantes:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar vacantes');
      setVacantes([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarVacantes();
  }, []);

  // Handler filtro
  const handleFiltrarEstado = (estado) => {
    setFiltroEstado(estado);
    cargarVacantes(estado);
  };

  // Handler crear vacante
  const handleCrearVacante = () => {
    navigate('/empresa/vacantes/crear');
  };

  // Handler editar
  const handleEditar = (vacante) => {
    navigate(`/empresa/vacantes/editar/${vacante.id}`);
  };

  // Handler ver postulaciones
  const handleVerPostulaciones = (vacante) => {
    navigate(`/empresa/vacantes/${vacante.id}/postulaciones`);
  };

  // Handler cerrar vacante
  const handleCerrar = async (vacante) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de cerrar la vacante "${vacante.titulo}"?\n\nLa vacante dejará de estar visible para candidatos.`
    );

    if (!confirmacion) return;

    try {
      console.log('🔒 Cerrando vacante:', vacante.id);

      await vacantesAPI.cerrar(vacante.id);

      alert('Vacante cerrada exitosamente');

      // Recargar lista
      cargarVacantes(filtroEstado);

    } catch (err) {
      console.error('❌ Error cerrando vacante:', err);
      alert(err.response?.data?.mensaje || 'Error al cerrar vacante');
    }
  };

  // Handler pausar/reabrir (toggle)
  const handleTogglePausa = async (vacante) => {
    const accion = vacante.estado === 'pausada' ? 'reabrir' : 'pausar';

    const confirmacion = window.confirm(
      `¿Estás seguro de ${accion} la vacante "${vacante.titulo}"?`
    );

    if (!confirmacion) return;

    try {
      console.log(`${accion === 'pausar' ? '⏸️' : '▶️'} ${accion} vacante:`, vacante.id);

      // Usar los métodos específicos de la API
      if (accion === 'pausar') {
        await vacantesAPI.pausar(vacante.id);
      } else {
        await vacantesAPI.reabrir(vacante.id);
      }

      alert(`Vacante ${accion === 'pausar' ? 'pausada' : 'reabierta'} exitosamente`);

      // Recargar lista
      cargarVacantes(filtroEstado);

    } catch (err) {
      console.error(`❌ Error al ${accion} vacante:`, err);
      alert(err.response?.data?.mensaje || `Error al ${accion} vacante`);
    }
  };

  // Estadísticas
  const getEstadisticas = () => {
    const total = vacantes.length;
    const abiertas = vacantes.filter(v => v.estado === 'abierta').length;
    const pausadas = vacantes.filter(v => v.estado === 'pausada').length;
    const totalPostulaciones = vacantes.reduce((sum, v) => sum + (v.postulaciones_recibidas || 0), 0);

    return { total, abiertas, pausadas, totalPostulaciones };
  };

  const stats = getEstadisticas();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          {/* Botón volver */}
          <button
            onClick={() => navigate('/empresa/dashboard')}
            className="
              flex items-center text-gray-600 hover:text-gray-900 
              mb-4 transition-colors group
            "
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
            Volver al Dashboard
          </button>

          {/* Título y botón crear */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Briefcase className="mr-3" size={32} />
                Mis Vacantes
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona tus ofertas laborales y revisa las postulaciones
              </p>
            </div>

            {/* Botón crear vacante */}
            <button
              onClick={handleCrearVacante}
              className="
                px-6 py-3 bg-blue-600 text-white rounded-lg
                hover:bg-blue-700 transition-colors
                flex items-center font-medium shadow-md
              "
            >
              <Plus size={20} className="mr-2" />
              Crear Vacante
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {!loading && !error && vacantes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total vacantes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Abiertas</p>
              <p className="text-2xl font-bold text-green-600">{stats.abiertas}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Pausadas</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pausadas}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total postulaciones</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalPostulaciones}</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Filtrar por estado:
            </span>
            <button
              onClick={() => handleFiltrarEstado('')}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${filtroEstado === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              Todas ({vacantes.length})
            </button>
            {Object.entries(ESTADOS_VACANTE).map(([key, value]) => {
              const count = vacantes.filter(v => v.estado === value).length;
              return (
                <button
                  key={key}
                  onClick={() => handleFiltrarEstado(value)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${filtroEstado === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard variant="default" count={6} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
            <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error al cargar vacantes</h3>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => cargarVacantes(filtroEstado)}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && vacantes.length === 0 && (
          <EmptyState
            icon="vacantes"
            title={
              filtroEstado
                ? `No tienes vacantes con estado "${filtroEstado}"`
                : 'No tienes vacantes creadas'
            }
            description={
              filtroEstado
                ? 'Intenta cambiar el filtro para ver otras vacantes.'
                : 'Crea tu primera vacante para empezar a recibir postulaciones de candidatos.'
            }
            variant="info"
            action={
              filtroEstado
                ? {
                    label: 'Ver todas',
                    onClick: () => handleFiltrarEstado('')
                  }
                : {
                    label: 'Crear vacante',
                    icon: Plus,
                    onClick: handleCrearVacante
                  }
            }
          />
        )}

        {/* Lista de vacantes */}
        {!loading && !error && vacantes.length > 0 && (
          <div className="space-y-4">
            {vacantes.map((vacante) => (
              <div
                key={vacante.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {vacante.titulo}
                      </h3>
                      <BadgeEstado estado={vacante.estado} tipo="vacante" />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {vacante.descripcion}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users size={20} className="mx-auto mb-1 text-gray-400" />
                    <p className="text-lg font-bold text-gray-900">
                      {vacante.postulaciones_recibidas || 0}
                    </p>
                    <p className="text-xs text-gray-600">Postulaciones</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Briefcase size={20} className="mx-auto mb-1 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {vacante.modalidad}
                    </p>
                    <p className="text-xs text-gray-600">Modalidad</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">
                      {vacante.ciudad}
                    </p>
                    <p className="text-xs text-gray-600">Ubicación</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">
                      {vacante.fecha_publicacion ? new Date(vacante.fecha_publicacion).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short'
                      }) : 'Sin publicar'}
                    </p>
                    <p className="text-xs text-gray-600">Publicada</p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleVerPostulaciones(vacante)}
                    className="
                      px-4 py-2 text-sm font-medium text-blue-600
                      border border-blue-600 rounded-lg
                      hover:bg-blue-50 transition-colors
                      flex items-center
                    "
                  >
                    <Eye size={16} className="mr-2" />
                    Ver postulaciones
                  </button>

                  <button
                    onClick={() => handleEditar(vacante)}
                    disabled={vacante.estado === 'cerrada'}
                    className="
                      px-4 py-2 text-sm font-medium text-gray-700
                      border border-gray-300 rounded-lg
                      hover:bg-gray-50 transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center
                    "
                  >
                    <Edit size={16} className="mr-2" />
                    Editar
                  </button>

                  {vacante.estado !== 'cerrada' && (
                    <button
                      onClick={() => handleTogglePausa(vacante)}
                      className="
                        px-4 py-2 text-sm font-medium text-yellow-600
                        border border-yellow-600 rounded-lg
                        hover:bg-yellow-50 transition-colors
                        flex items-center
                      "
                    >
                      <Pause size={16} className="mr-2" />
                      {vacante.estado === 'pausada' ? 'Reabrir' : 'Pausar'}
                    </button>
                  )}

                  {vacante.estado !== 'cerrada' && (
                    <button
                      onClick={() => handleCerrar(vacante)}
                      className="
                        px-4 py-2 text-sm font-medium text-red-600
                        border border-red-600 rounded-lg
                        hover:bg-red-50 transition-colors
                        flex items-center
                      "
                    >
                      <X size={16} className="mr-2" />
                      Cerrar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisVacantes;