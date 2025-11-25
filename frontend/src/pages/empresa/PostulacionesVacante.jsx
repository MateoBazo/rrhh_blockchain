// file: frontend/src/pages/empresa/PostulacionesVacante.jsx

/**
 * 👥 POSTULACIONES POR VACANTE - Página Empresa
 * Ver y gestionar candidatos que postularon a una vacante específica
 * Features: Lista PostulacionCards, filtros por estado, cambiar estado FSM, ver perfil candidato
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Loader, AlertCircle, Filter } from 'lucide-react';
import { vacantesAPI } from '../../api/vacantes';
import { postulacionesAPI } from '../../api/postulaciones';
import { ESTADOS_POSTULACION, LABELS_ESTADO_POSTULACION } from '../../utils/constants';
import PostulacionCard from '../../components/postulaciones/PostulacionCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';

const PostulacionesVacante = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vacante, setVacante] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id, filtroEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [responseVacante, responsePostulaciones] = await Promise.all([
        vacantesAPI.obtenerPorId(id),
        postulacionesAPI.obtenerPorVacante(id, filtroEstado ? { estado: filtroEstado } : {})
      ]);

      setVacante(responseVacante.data?.data || responseVacante.data);
      
      const postData = responsePostulaciones.data?.data || responsePostulaciones.data;
      setPostulaciones(postData.postulaciones || postData || []);

    } catch (err) {
      console.error('Error cargando postulaciones:', err);
      setError('Error al cargar postulaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (postulacion) => {
    const estadosDisponibles = {
      postulado: ['revisado', 'rechazado'],
      revisado: ['preseleccionado', 'rechazado'],
      preseleccionado: ['entrevista', 'rechazado'],
      entrevista: ['contratado', 'rechazado'],
    };

    const opciones = estadosDisponibles[postulacion.estado] || [];
    
    if (opciones.length === 0) {
      alert('No se puede cambiar el estado desde el estado actual');
      return;
    }

    const seleccion = window.prompt(
      `Cambiar estado de ${postulacion.candidato?.nombre_completo || 'candidato'}:\n\n` +
      opciones.map((e, i) => `${i + 1}. ${LABELS_ESTADO_POSTULACION[e]}`).join('\n') +
      '\n\nIngresa el número:'
    );

    if (!seleccion) return;

    const indice = parseInt(seleccion) - 1;
    if (indice < 0 || indice >= opciones.length) {
      alert('Opción inválida');
      return;
    }

    const nuevoEstado = opciones[indice];

    try {
      await postulacionesAPI.cambiarEstado(postulacion.id, { nuevo_estado: nuevoEstado });
      alert('Estado actualizado exitosamente');
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al cambiar estado');
    }
  };

  const handleVerDetalle = (postulacion) => {
    alert(`Ver perfil de ${postulacion.candidato?.nombre_completo}`);
  };

  const getEstadisticas = () => {
    const total = postulaciones.length;
    const por_estado = {};
    Object.values(ESTADOS_POSTULACION).forEach(e => {
      por_estado[e] = postulaciones.filter(p => p.estado === e).length;
    });
    return { total, por_estado };
  };

  const stats = getEstadisticas();

  if (loading && !vacante) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/empresa/vacantes')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a mis vacantes
        </button>

        {/* Header vacante */}
        {vacante && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{vacante.titulo}</h1>
            <p className="text-gray-600 mb-4">{vacante.descripcion}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>📍 {vacante.ciudad}, {vacante.departamento}</span>
              <span>💼 {vacante.modalidad}</span>
              <span>👥 {stats.total} postulaciones</span>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={18} className="text-gray-600" />
            <span className="text-sm font-medium">Filtrar:</span>
            <button
              onClick={() => setFiltroEstado('')}
              className={`px-3 py-1 text-sm rounded-lg ${!filtroEstado ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Todas ({stats.total})
            </button>
            {Object.entries(ESTADOS_POSTULACION).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setFiltroEstado(value)}
                className={`px-3 py-1 text-sm rounded-lg ${filtroEstado === value ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                {LABELS_ESTADO_POSTULACION[value]} ({stats.por_estado[value] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Lista postulaciones */}
        {loading ? (
          <SkeletonCard count={3} />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <AlertCircle className="text-red-600 mb-2" size={24} />
            <p className="text-red-800">{error}</p>
          </div>
        ) : postulaciones.length === 0 ? (
          <EmptyState
            icon="postulaciones"
            title="No hay postulaciones"
            description={filtroEstado ? 'No hay postulaciones con ese estado' : 'Aún no has recibido postulaciones para esta vacante'}
          />
        ) : (
          <div className="space-y-4">
            {postulaciones.map(p => (
              <PostulacionCard
                key={p.id}
                postulacion={p}
                vistaEmpresa={true}
                onVerDetalle={handleVerDetalle}
                onCambiarEstado={handleCambiarEstado}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostulacionesVacante;