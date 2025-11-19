// file: frontend/src/pages/candidato/BuscarVacantes.jsx

/**
 * 🔍 BUSCAR VACANTES - Página Candidato
 * Marketplace de ofertas laborales con búsqueda avanzada
 * Features: Filtros combinables, paginación, ordenamiento, ver detalle
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Loader, AlertCircle } from 'lucide-react';
import { vacantesAPI } from '../../api/vacantes';
import VacanteCard from '../../components/vacantes/VacanteCard';
import FiltrosVacantes from '../../components/vacantes/FiltrosVacantes';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';

const BuscarVacantes = () => {
  const navigate = useNavigate();

  // Estados
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtrosActivos, setFiltrosActivos] = useState({});
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalVacantes, setTotalVacantes] = useState(0);
  const limite = 12;

  // Cargar vacantes
  const cargarVacantes = async (filtros = {}, pagina = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filtros,
        pagina,
        limite,
        estado: 'abierta' // Solo vacantes abiertas
      };

      console.log('🔍 Buscando vacantes con:', params);

      const response = await vacantesAPI.listar(params);
      
      console.log('✅ Respuesta API:', response.data);

      // Adaptarse a diferentes estructuras de respuesta
      const data = response.data?.data || response.data;
      const vacantesData = data.vacantes || data.data?.vacantes || [];
      const total = data.total || vacantesData.length;

      setVacantes(vacantesData);
      setTotalVacantes(total);
      setTotalPaginas(Math.ceil(total / limite));
      setPaginaActual(pagina);

    } catch (err) {
      console.error('❌ Error cargando vacantes:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar vacantes');
      setVacantes([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar componente
  useEffect(() => {
    cargarVacantes();
  }, []);

  // Handler filtros
  const handleFiltrar = (filtros) => {
    console.log('Aplicando filtros:', filtros);
    setFiltrosActivos(filtros);
    cargarVacantes(filtros, 1);
  };

  // Handler limpiar filtros
  const handleLimpiarFiltros = () => {
    console.log('Limpiando filtros');
    setFiltrosActivos({});
    cargarVacantes({}, 1);
  };

  // Handler ver detalle
  const handleVerDetalle = (vacante) => {
    navigate(`/candidato/vacantes/${vacante.id}`);
  };

  // Handler paginación
  const handleCambiarPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    cargarVacantes(filtrosActivos, nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Briefcase className="mr-3" size={32} />
            Buscar Vacantes
          </h1>
          <p className="text-gray-600 mt-2">
            Explora oportunidades laborales y encuentra tu próximo trabajo
          </p>
        </div>

        {/* Filtros */}
        <FiltrosVacantes
          onFiltrar={handleFiltrar}
          onLimpiar={handleLimpiarFiltros}
          loading={loading}
        />

        {/* Contador resultados */}
        {!loading && !error && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {totalVacantes === 0 ? (
                'No se encontraron vacantes'
              ) : (
                <>
                  Mostrando{' '}
                  <span className="font-semibold">
                    {(paginaActual - 1) * limite + 1}-
                    {Math.min(paginaActual * limite, totalVacantes)}
                  </span>{' '}
                  de <span className="font-semibold">{totalVacantes}</span> vacantes
                </>
              )}
            </p>

            {/* Ordenamiento futuro */}
            {/* <select className="text-sm border rounded-lg px-3 py-2">
              <option>Más recientes</option>
              <option>Mejor salario</option>
              <option>Más compatibles</option>
            </select> */}
          </div>
        )}

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
                onClick={() => cargarVacantes(filtrosActivos, paginaActual)}
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
            icon="search"
            title="No se encontraron vacantes"
            description={
              Object.keys(filtrosActivos).length > 0
                ? 'Intenta ajustar los filtros de búsqueda para ver más resultados.'
                : 'No hay vacantes disponibles en este momento. Vuelve pronto para ver nuevas oportunidades.'
            }
            variant="info"
            action={
              Object.keys(filtrosActivos).length > 0
                ? {
                    label: 'Limpiar filtros',
                    onClick: handleLimpiarFiltros
                  }
                : null
            }
          />
        )}

        {/* Grid de vacantes */}
        {!loading && !error && vacantes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {vacantes.map((vacante) => (
                <VacanteCard
                  key={vacante.id}
                  vacante={vacante}
                  onClick={handleVerDetalle}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center space-x-2">
                {/* Anterior */}
                <button
                  onClick={() => handleCambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="
                    px-4 py-2 text-sm font-medium
                    border border-gray-300 rounded-lg
                    hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  Anterior
                </button>

                {/* Números de página */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter((pagina) => {
                      // Mostrar primera, última, actual y +/- 2
                      return (
                        pagina === 1 ||
                        pagina === totalPaginas ||
                        Math.abs(pagina - paginaActual) <= 2
                      );
                    })
                    .map((pagina, index, array) => {
                      // Agregar "..." si hay salto
                      const showEllipsis = index > 0 && pagina - array[index - 1] > 1;

                      return (
                        <React.Fragment key={pagina}>
                          {showEllipsis && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handleCambiarPagina(pagina)}
                            className={`
                              px-3 py-2 text-sm font-medium rounded-lg
                              transition-colors
                              ${
                                pagina === paginaActual
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }
                            `}
                          >
                            {pagina}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                {/* Siguiente */}
                <button
                  onClick={() => handleCambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="
                    px-4 py-2 text-sm font-medium
                    border border-gray-300 rounded-lg
                    hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BuscarVacantes;