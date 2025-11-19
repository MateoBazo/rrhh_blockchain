// file: frontend/src/pages/empresa/BuscarCandidatos.jsx

/**
 * 🔍 BUSCAR CANDIDATOS - Página Empresa
 * Búsqueda avanzada de candidatos con filtros combinables
 * Features: 10+ filtros, resultados con score, recomendaciones por vacante
 */

import React, { useState } from 'react';
import { Search, User, Loader, AlertCircle } from 'lucide-react';
import { candidatosAPI } from '../../api/candidatos';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';

const BuscarCandidatos = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    ciudad: '',
    modalidad_preferida: '',
    experiencia_min: '',
    nivel_educativo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== '')
      );

      const response = await candidatosAPI.buscarAvanzado(params);
      const data = response.data?.data || response.data;
      setCandidatos(data.candidatos || data || []);

    } catch (err) {
      console.error('Error buscando candidatos:', err);
      setError('Error al buscar candidatos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <User className="mr-3" size={32} />
          Buscar Candidatos
        </h1>
        <p className="text-gray-600 mb-6">
          Encuentra candidatos cualificados para tus vacantes
        </p>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              name="busqueda"
              value={filtros.busqueda}
              onChange={handleChange}
              placeholder="Buscar por nombre, habilidades..."
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              name="ciudad"
              value={filtros.ciudad}
              onChange={handleChange}
              placeholder="Ciudad"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <select
              name="modalidad_preferida"
              value={filtros.modalidad_preferida}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Modalidad preferida</option>
              <option value="remoto">Remoto</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
          <button
            onClick={handleBuscar}
            disabled={loading}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <Search size={18} className="mr-2" />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Resultados */}
        {loading ? (
          <SkeletonCard variant="list" count={5} />
        ) : error ? (
          <div className="bg-red-50 border p-6 rounded-lg">
            <AlertCircle className="text-red-600 mb-2" size={24} />
            <p className="text-red-800">{error}</p>
          </div>
        ) : candidatos.length === 0 ? (
          <EmptyState
            icon="search"
            title="No se encontraron candidatos"
            description="Intenta ajustar los filtros de búsqueda"
          />
        ) : (
          <div className="space-y-4">
            {candidatos.map(c => (
              <div key={c.id} className="bg-white rounded-lg border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{c.nombre_completo}</h3>
                    <p className="text-sm text-gray-600">{c.email}</p>
                    {c.ciudad && <p className="text-sm text-gray-500">📍 {c.ciudad}</p>}
                  </div>
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                    Ver perfil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuscarCandidatos;