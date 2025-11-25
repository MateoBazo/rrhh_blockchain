// file: frontend/src/pages/EmpresaDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Briefcase, Users, TrendingUp, Search, Plus, Eye } from 'lucide-react';
import { vacantesAPI } from '../api/vacantes';
import { candidatosAPI } from '../api/candidatos';
import Button from '../components/common/Button';

export default function EmpresaDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados principales S010.4
  const [statsVacantes, setStatsVacantes] = useState({
    total: 0,
    abiertas: 0,
    postulaciones: 0
  });
  
  // Estados búsqueda candidatos (funcionalidad existente)
  const [candidatos, setCandidatos] = useState([]);
  const [loadingCandidatos, setLoadingCandidatos] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);

      // 🆕 Cargar estadísticas vacantes S010.4
      try {
        const responseVacantes = await vacantesAPI.listarPorEmpresa();
        const vacantes = responseVacantes.data?.data?.vacantes || 
                        responseVacantes.data?.vacantes || 
                        responseVacantes.data || [];
        
        const abiertas = vacantes.filter(v => v.estado === 'abierta').length;
        const totalPostulaciones = vacantes.reduce((sum, v) => 
          sum + (v.postulaciones_recibidas || 0), 0
        );

        setStatsVacantes({
          total: vacantes.length,
          abiertas,
          postulaciones: totalPostulaciones
        });
      } catch (err) {
        console.log('Error cargando estadísticas vacantes:', err);
      }

    } catch (err) {
      console.error('Error cargando datos dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarCandidatos = async () => {
    try {
      setLoadingCandidatos(true);
      const response = await candidatosAPI.getCandidatosConReferenciasVerificadas();
      setCandidatos(response.data);
    } catch (err) {
      console.error('Error cargando candidatos:', err);
    } finally {
      setLoadingCandidatos(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const verReferencias = (candidatoId) => {
    navigate(`/empresa/candidatos/${candidatoId}/referencias`);
  };

  const handleToggleBusqueda = () => {
    if (!mostrarBusqueda && candidatos.length === 0) {
      cargarCandidatos();
    }
    setMostrarBusqueda(!mostrarBusqueda);
  };

  // Filtrar candidatos por búsqueda
  const candidatosFiltrados = candidatos.filter(candidato => 
    candidato.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    candidato.profesion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    candidato.nivel_educativo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">
            Dashboard Empresa
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              {user?.nombre} {user?.apellido}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.nombre}! 🏢
          </h1>
          <p className="text-gray-600">
            Gestiona tus vacantes, revisa postulaciones y analiza métricas
          </p>
        </div>

        {/* 🆕 Cards principales S010.4 - DESTACADAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card: Mis Vacantes */}
          <button
            onClick={() => navigate('/empresa/vacantes')}
            className="
              bg-gradient-to-br from-blue-500 to-blue-600 text-white
              rounded-lg shadow-lg p-6 
              hover:shadow-xl hover:from-blue-600 hover:to-blue-700
              transition-all text-left
            "
          >
            <Briefcase className="mb-3" size={32} />
            <h3 className="text-xl font-semibold mb-2">
              Mis Vacantes
            </h3>
            <p className="text-blue-100 text-sm mb-2">
              Gestiona tus ofertas laborales
            </p>
            {statsVacantes.total > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-white bg-opacity-30 px-2 py-1 rounded">
                  {statsVacantes.abiertas} abiertas
                </span>
                <span className="bg-white bg-opacity-30 px-2 py-1 rounded">
                  {statsVacantes.total} total
                </span>
              </div>
            )}
          </button>

          {/* Card: Buscar Candidatos */}
          <button
            onClick={() => navigate('/empresa/candidatos')}
            className="
              bg-gradient-to-br from-green-500 to-green-600 text-white
              rounded-lg shadow-lg p-6 
              hover:shadow-xl hover:from-green-600 hover:to-green-700
              transition-all text-left
            "
          >
            <Search className="mb-3" size={32} />
            <h3 className="text-xl font-semibold mb-2">
              Buscar Candidatos
            </h3>
            <p className="text-green-100 text-sm">
              Búsqueda avanzada de talentos
            </p>
          </button>

          {/* Card: Analytics */}
          <button
            onClick={() => navigate('/empresa/analytics')}
            className="
              bg-gradient-to-br from-purple-500 to-purple-600 text-white
              rounded-lg shadow-lg p-6 
              hover:shadow-xl hover:from-purple-600 hover:to-purple-700
              transition-all text-left
            "
          >
            <TrendingUp className="mb-3" size={32} />
            <h3 className="text-xl font-semibold mb-2">
              Analytics
            </h3>
            <p className="text-purple-100 text-sm mb-2">
              Métricas y KPIs de reclutamiento
            </p>
            {statsVacantes.postulaciones > 0 && (
              <div className="text-sm">
                <span className="bg-white bg-opacity-30 px-2 py-1 rounded">
                  {statsVacantes.postulaciones} postulaciones
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Card: Crear Vacante */}
          <button
            onClick={() => navigate('/empresa/vacantes/crear')}
            className="
              bg-white rounded-lg shadow-md p-6
              hover:shadow-lg hover:border-blue-300
              transition-all text-left border-2 border-transparent
            "
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Plus className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Crear Nueva Vacante
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              Publica una nueva oferta laboral para recibir postulaciones
            </p>
          </button>

          {/* Card: Ver Referencias (funcionalidad existente) */}
          <button
            onClick={handleToggleBusqueda}
            className="
              bg-white rounded-lg shadow-md p-6
              hover:shadow-lg hover:border-green-300
              transition-all text-left border-2 border-transparent
            "
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Eye className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Referencias Verificadas
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              Consulta candidatos con referencias profesionales verificadas
            </p>
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Resumen Rápido
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {statsVacantes.total}
              </p>
              <p className="text-sm text-gray-600 mt-1">Vacantes Totales</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {statsVacantes.abiertas}
              </p>
              <p className="text-sm text-gray-600 mt-1">Vacantes Abiertas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {statsVacantes.postulaciones}
              </p>
              <p className="text-sm text-gray-600 mt-1">Postulaciones</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {statsVacantes.postulaciones > 0 && statsVacantes.abiertas > 0
                  ? Math.round(statsVacantes.postulaciones / statsVacantes.abiertas)
                  : 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Promedio/Vacante</p>
            </div>
          </div>
        </div>

        {/* 🔄 Sección búsqueda candidatos (funcionalidad existente, colapsable) */}
        {mostrarBusqueda && (
          <>
            {/* Barra de búsqueda */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre, profesión o nivel educativo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="flex-1 border-0 focus:ring-0 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Stats candidatos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-sm text-gray-600">Total Candidatos</p>
                <p className="text-2xl font-bold text-gray-900">{candidatos.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-sm text-gray-600">Referencias Verificadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {candidatos.reduce((sum, c) => sum + c.referencias_verificadas, 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-sm text-gray-600">Resultados Búsqueda</p>
                <p className="text-2xl font-bold text-gray-900">{candidatosFiltrados.length}</p>
              </div>
            </div>

            {/* Lista de candidatos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Candidatos con Referencias Verificadas
                </h2>
                <button
                  onClick={() => setMostrarBusqueda(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Ocultar
                </button>
              </div>
              
              {loadingCandidatos ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando candidatos...</p>
                </div>
              ) : candidatosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-600">
                    {busqueda 
                      ? 'No se encontraron candidatos con esos criterios'
                      : 'No hay candidatos con referencias verificadas disponibles'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {candidatosFiltrados.map((candidato) => (
                    <div
                      key={candidato.id}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {candidato.nombre_completo}
                          </h3>
                          {candidato.profesion && (
                            <p className="text-sm text-gray-600 mb-1">{candidato.profesion}</p>
                          )}
                          {candidato.nivel_educativo && (
                            <p className="text-xs text-gray-500">
                              📚 {candidato.nivel_educativo}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {candidato.referencias_verificadas}
                        </span>
                      </div>

                      {candidato.estado_laboral && (
                        <div className="mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            candidato.estado_laboral === 'Buscando' ? 'bg-yellow-100 text-yellow-800' :
                            candidato.estado_laboral === 'Empleado' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {candidato.estado_laboral}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => verReferencias(candidato.id)}
                        className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ver Referencias
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}