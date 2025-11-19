// file: frontend/src/components/vacantes/FiltrosVacantes.jsx

/**
 * 🔍 FILTROS VACANTES
 * Formulario de búsqueda avanzada con múltiples filtros combinables
 * Usado en página "Buscar Vacantes" (candidato)
 */

import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  MODALIDADES_TRABAJO,
  NIVELES_EDUCATIVOS,
  TIPOS_CONTRATO,
  JORNADAS_LABORALES
} from '../../utils/constants';

const FiltrosVacantes = ({ onFiltrar, onLimpiar, loading = false }) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Estado de filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    modalidad: '',
    ciudad: '',
    departamento: '',
    salario_min: '',
    salario_max: '',
    experiencia_max: '',
    tipo_contrato: '',
    nivel_educativo: '',
  });

  // Manejar cambio de input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Aplicar filtros
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Crear objeto solo con filtros que tienen valor
    const filtrosActivos = Object.entries(filtros).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    onFiltrar(filtrosActivos);
  };

  // Limpiar filtros
  const handleLimpiar = () => {
    const filtrosVacios = Object.keys(filtros).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    
    setFiltros(filtrosVacios);
    onLimpiar?.();
  };

  // Contar filtros activos
  const contarFiltrosActivos = () => {
    return Object.values(filtros).filter(v => v !== '' && v !== null).length;
  };

  const filtrosActivos = contarFiltrosActivos();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <form onSubmit={handleSubmit}>
        {/* Búsqueda principal */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              name="busqueda"
              value={filtros.busqueda}
              onChange={handleChange}
              placeholder="Buscar por título, descripción, empresa..."
              className="
                w-full pl-10 pr-4 py-2.5
                border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all
              "
            />
          </div>

          {/* Botón buscar */}
          <button
            type="submit"
            disabled={loading}
            className="
              px-6 py-2.5
              bg-blue-600 text-white font-medium rounded-lg
              hover:bg-blue-700 disabled:bg-blue-400
              transition-colors flex items-center
            "
          >
            <Search size={18} className="mr-2" />
            Buscar
          </button>
        </div>

        {/* Toggle filtros avanzados */}
        <button
          type="button"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="
            w-full flex items-center justify-between
            text-sm text-gray-700 font-medium
            py-2 px-3 rounded-lg
            hover:bg-gray-50 transition-colors
          "
        >
          <div className="flex items-center">
            <Filter size={16} className="mr-2" />
            <span>Filtros avanzados</span>
            {filtrosActivos > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {filtrosActivos}
              </span>
            )}
          </div>
          {mostrarFiltros ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* Filtros avanzados */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Modalidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modalidad
                </label>
                <select
                  name="modalidad"
                  value={filtros.modalidad}
                  onChange={handleChange}
                  className="
                    w-full px-3 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  "
                >
                  <option value="">Todas</option>
                  {Object.entries(MODALIDADES_TRABAJO).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Departamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  name="departamento"
                  value={filtros.departamento}
                  onChange={handleChange}
                  placeholder="Ej: Cochabamba"
                  className="
                    w-full px-3 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  "
                />
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={filtros.ciudad}
                  onChange={handleChange}
                  placeholder="Ej: Cochabamba"
                  className="
                    w-full px-3 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  "
                />
              </div>

              {/* Salario mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salario mínimo
                </label>
                <input
                  type="number"
                  name="salario_min"
                  value={filtros.salario_min}
                  onChange={handleChange}
                  placeholder="Ej: 3000"
                  min="0"
                  step="500"
                  className="
                    w-full px-3 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  "
                />
              </div>

              {/* Salario máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salario máximo
                </label>
                <input
                  type="number"
                  name="salario_max"
                  value={filtros.salario_max}
                  onChange={handleChange}
                  placeholder="Ej: 8000"
                  min="0"
                  step="500"
                  className="
                    w-full px-3 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  "
                />
              </div>

              {/* Experiencia máxima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experiencia máxima (años)
                </label>
                <input
                  type="number"
                  name="experiencia_max"
                  value={filtros.experiencia_max}
                  onChange={handleChange}
                  placeholder="Ej: 5"
                  min="0"
                  max="30"
                  className="
                    w-full px-3 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  "
                />
              </div>

              {/* Tipo de contrato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de contrato
                </label>
                <select
                  name="tipo_contrato"
                  value={filtros.tipo_contrato}
                  onChange={handleChange}
                  className="
                    w-full px-3 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  "
                >
                  <option value="">Todos</option>
                  {Object.entries(TIPOS_CONTRATO).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nivel educativo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel educativo
                </label>
                <select
                  name="nivel_educativo"
                  value={filtros.nivel_educativo}
                  onChange={handleChange}
                  className="
                    w-full px-3 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  "
                >
                  <option value="">Todos</option>
                  {Object.entries(NIVELES_EDUCATIVOS).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Acciones filtros */}
            <div className="mt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleLimpiar}
                className="
                  px-4 py-2 text-sm font-medium text-gray-700
                  border border-gray-300 rounded-lg
                  hover:bg-gray-50 transition-colors
                  flex items-center
                "
              >
                <X size={16} className="mr-1" />
                Limpiar filtros
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  px-4 py-2 text-sm font-medium text-white
                  bg-blue-600 rounded-lg
                  hover:bg-blue-700 disabled:bg-blue-400
                  transition-colors
                "
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FiltrosVacantes;