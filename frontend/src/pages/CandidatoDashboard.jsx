// file: frontend/src/pages/CandidatoDashboard.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Avatar from '../components/common/Avatar';
import { candidatosAPI } from '../api/candidatos';
import { documentosAPI } from '../api/documentos';
import { referenciasAPI } from '../api/referencias'; // 🆕 IMPORT
import Button from '../components/common/Button';

const CandidatoDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [candidato, setCandidato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalDocumentos, setTotalDocumentos] = useState(0);
  const [totalReferencias, setTotalReferencias] = useState(0); // 🆕 ESTADO

  // CARGAR DATOS CANDIDATO AL MONTAR
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar perfil candidato
        const responsePerfil = await candidatosAPI.obtenerPerfil();
        if (responsePerfil.data.success) {
          const candidatoData = responsePerfil.data.data;
          setCandidato(candidatoData);

          // 🆕 Cargar referencias del candidato
          if (candidatoData?.id) {
            try {
              const responseRefs = await referenciasAPI.obtenerReferencias(candidatoData.id);
              if (responseRefs.data.success) {
                const referencias = responseRefs.data.data || [];
                setTotalReferencias(referencias.length);
              }
            } catch (error) {
              console.log('No se pudieron cargar referencias:', error);
              setTotalReferencias(0);
            }
          }
        }

        // Cargar total de documentos
        try {
          const responseDocs = await documentosAPI.getMisDocumentos();
          if (responseDocs.data.success) {
            setTotalDocumentos(responseDocs.data.data?.length || 0);
          }
        } catch (error) {
          console.log('No se pudieron cargar documentos:', error);
        }

      } catch (error) {
        console.error('Error al cargar candidato:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* NAVBAR CON AVATAR */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo / Título */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              Sistema RRHH Blockchain
            </h1>
          </div>

          {/* User Info + Avatar */}
          <div className="flex items-center gap-4">
            
            {/* Nombre usuario - Desktop */}
            {candidato && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {candidato.nombres} {candidato.apellido_paterno}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
            )}

            {/* Avatar clickable */}
            {candidato && (
              <Avatar
                fotoUrl={candidato.foto_perfil_url 
                  ? `${import.meta.env.VITE_API_URL}${candidato.foto_perfil_url}?t=${Date.now()}` 
                  : null
                }
                nombres={candidato.nombres || ''}
                apellidoPaterno={candidato.apellido_paterno || ''}
                size="md"
                clickable={true}
              />
            )}

            {/* Botón logout */}
            <Button
              variant="outline"
              onClick={handleLogout}
              size="sm"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO DASHBOARD */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido/a, {candidato?.nombres || 'Candidato'}! 👋
          </h2>
          <p className="text-gray-600">
            Este es tu panel de control. Aquí podrás gestionar tu perfil, documentos y postulaciones.
          </p>
        </div>

        {/* Cards de acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card: Editar Perfil */}
          <Link to="/perfil">
            <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer 
                         hover:shadow-lg transition-shadow duration-200 border-2 border-transparent
                         hover:border-blue-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Mi Perfil
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Completa y actualiza tu información personal, académica y profesional
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                Editar perfil
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Card: Mis Documentos */}
          <Link to="/mis-documentos">
            <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer 
                         hover:shadow-lg transition-shadow duration-200 border-2 border-transparent
                         hover:border-green-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Mis Documentos
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Sube y gestiona tus certificados, títulos y documentación
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {totalDocumentos} documento{totalDocumentos !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  Ver documentos
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* 🆕 Card: Mis Referencias */}
          <Link to="/mis-referencias">
            <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer 
                         hover:shadow-lg transition-shadow duration-200 border-2 border-transparent
                         hover:border-purple-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Mis Referencias
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Gestiona personas que pueden dar referencias profesionales o académicas
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${
                  totalReferencias >= 3 ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {totalReferencias}/3 referencias
                </span>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  Ver referencias
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Card: Postulaciones (próximamente) */}
          <div className="bg-white rounded-lg shadow-md p-6 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Mis Postulaciones
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Revisa el estado de tus postulaciones y ofertas de empleo
            </p>
            <div className="flex items-center text-gray-400 text-sm font-medium">
              Próximamente
            </div>
          </div>

        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Resumen Rápido
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {candidato?.foto_perfil_url ? '✅' : '❌'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Foto de Perfil</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {candidato?.completitud_perfil || 0}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Perfil Completo</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {totalDocumentos}
              </p>
              <p className="text-sm text-gray-600 mt-1">Documentos</p>
            </div>
            {/* 🆕 Estadística de Referencias */}
            <div className="text-center">
              <p className={`text-3xl font-bold ${
                totalReferencias >= 3 ? 'text-orange-600' : 'text-purple-600'
              }`}>
                {totalReferencias}/3
              </p>
              <p className="text-sm text-gray-600 mt-1">Referencias</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidatoDashboard;