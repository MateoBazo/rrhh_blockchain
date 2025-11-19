// file: frontend/src/pages/empresa/AnalyticsEmpresa.jsx

/**
 * 📊 ANALYTICS EMPRESA - Página Empresa
 * Dashboard con métricas y KPIs del proceso de reclutamiento
 * Features: Estadísticas generales, métricas por vacante, tendencias
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Briefcase, Users, Clock, Loader } from 'lucide-react';
import { analyticsAPI } from '../../api/analytics';

const AnalyticsEmpresa = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      const response = await analyticsAPI.obtenerEstadisticasGenerales();
      setStats(response.data?.data || response.data);
    } catch (err) {
      console.error('Error cargando analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <TrendingUp className="mr-3" size={32} />
          Analytics y Métricas
        </h1>
        <p className="text-gray-600 mb-8">
          Visualiza el rendimiento de tus procesos de reclutamiento
        </p>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Briefcase className="text-blue-600 mb-2" size={32} />
            <p className="text-3xl font-bold text-gray-900">
              {stats?.total_vacantes || 0}
            </p>
            <p className="text-sm text-gray-600">Vacantes Activas</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Users className="text-green-600 mb-2" size={32} />
            <p className="text-3xl font-bold text-gray-900">
              {stats?.total_postulaciones || 0}
            </p>
            <p className="text-sm text-gray-600">Postulaciones Totales</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Clock className="text-yellow-600 mb-2" size={32} />
            <p className="text-3xl font-bold text-gray-900">
              {stats?.promedio_postulaciones || 0}
            </p>
            <p className="text-sm text-gray-600">Promedio por Vacante</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <TrendingUp className="text-purple-600 mb-2" size={32} />
            <p className="text-3xl font-bold text-gray-900">
              {stats?.tasa_contratacion ? `${stats.tasa_contratacion}%` : '0%'}
            </p>
            <p className="text-sm text-gray-600">Tasa de Contratación</p>
          </div>
        </div>

        {/* Vacantes más activas */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Vacantes Más Activas</h2>
          {stats?.vacantes_top && stats.vacantes_top.length > 0 ? (
            <div className="space-y-3">
              {stats.vacantes_top.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{v.titulo}</p>
                    <p className="text-sm text-gray-600">{v.postulaciones_count} postulaciones</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{v.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsEmpresa;