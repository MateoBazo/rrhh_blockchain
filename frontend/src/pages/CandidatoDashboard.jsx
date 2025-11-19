// file: frontend/src/pages/CandidatoDashboard.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Send, User, FileText, Users } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import { candidatosAPI } from '../api/candidatos';
import { documentosAPI } from '../api/documentos';
import { referenciasAPI } from '../api/referencias';
import { postulacionesAPI } from '../api/postulaciones'; // 🆕 IMPORT S010.3
import Button from '../components/common/Button';

const CandidatoDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [candidato, setCandidato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalDocumentos, setTotalDocumentos] = useState(0);
  const [totalReferencias, setTotalReferencias] = useState(0);
  const [totalPostulaciones, setTotalPostulaciones] = useState(0); // 🆕 ESTADO S010.3
  const [postulacionesActivas, setPostulacionesActivas] = useState(0); // 🆕 ESTADO S010.3

  // CARGAR DATOS CANDIDATO AL MONTAR
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar perfil candidato
        const responsePerfil = await candidatosAPI.obtenerPerfil();
        if (responsePerfil.data.success) {
          const candidatoData = responsePerfil.data.data;
          setCandidato(candidatoData);

          // Cargar referencias del candidato
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

        // 🆕 Cargar postulaciones S010.3
        try {
          const responsePost = await postulacionesAPI.obtenerMisPostulaciones();
          if (responsePost.data.success || responsePost.data) {
            const postulaciones = responsePost.data.data?.postulaciones || 
                                 responsePost.data.postulaciones || [];
            setTotalPostulaciones(postulaciones.length);
            
            // Contar activas (no retiradas ni rechazadas)
            const activas = postulaciones.filter(p => 
              !['retirado', 'rechazado'].includes(p.estado)
            ).length;
            setPostulacionesActivas(activas);
          }
        } catch (error) {
          console.log('No se pudieron cargar postulaciones:', error);
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

        {/* 🆕 Cards de acciones rápidas S010.3 - DESTACADAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* 🆕 Card: Buscar Vacantes S010.3 */}
          <button
            onClick={() => navigate('/candidato/vacantes')}
            className="
              bg-gradient-to-br from-blue-500 to-blue-600 text-white
              rounded-lg shadow-lg p-6 
              hover:shadow-xl hover:from-blue-600 hover:to-blue-700
              transition-all text-left
            "
          >
            <Briefcase className="mb-3" size={32} />
            <h3 className="text-xl font-semibold mb-2">
              Buscar Vacantes
            </h3>
            <p className="text-blue-100 text-sm">
              Explora oportunidades laborales y encuentra tu próximo trabajo
            </p>
          </button>

          {/* 🆕 Card: Mis Postulaciones S010.3 */}
          <button
            onClick={() => navigate('/candidato/postulaciones')}
            className="
              bg-gradient-to-br from-green-500 to-green-600 text-white
              rounded-lg shadow-lg p-6 
              hover:shadow-xl hover:from-green-600 hover:to-green-700
              transition-all text-left
            "
          >
            <Send className="mb-3" size={32} />
            <h3 className="text-xl font-semibold mb-2">
              Mis Postulaciones
            </h3>
            <p className="text-green-100 text-sm mb-2">
              Sigue el progreso de tus aplicaciones
            </p>
            {totalPostulaciones > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-white bg-opacity-30 px-2 py-1 rounded">
                  {postulacionesActivas} activas
                </span>
                <span className="bg-white bg-opacity-30 px-2 py-1 rounded">
                  {totalPostulaciones} total
                </span>
              </div>
            )}
          </button>

          {/* Card: Mi Perfil */}
          <button
            onClick={() => navigate('/perfil')}
            className="
              bg-gradient-to-br from-purple-500 to-purple-600 text-white
              rounded-lg shadow-lg p-6 
              hover:shadow-xl hover:from-purple-600 hover:to-purple-700
              transition-all text-left
            "
          >
            <User className="mb-3" size={32} />
            <h3 className="text-xl font-semibold mb-2">
              Mi Perfil
            </h3>
            <p className="text-purple-100 text-sm">
              Actualiza tu información personal y profesional
            </p>
          </button>
        </div>

        {/* Cards secundarias - GRID 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card: Mis Documentos */}
          <Link to="/mis-documentos">
            <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer 
                         hover:shadow-lg transition-shadow duration-200 border-2 border-transparent
                         hover:border-green-500 h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <FileText className="text-green-600" size={24} />
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

          {/* Card: Mis Referencias */}
          <Link to="/mis-referencias">
            <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer 
                         hover:shadow-lg transition-shadow duration-200 border-2 border-transparent
                         hover:border-purple-500 h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="text-purple-600" size={24} />
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

          {/* Card: Placeholder futuro */}
          <div className="bg-white rounded-lg shadow-md p-6 opacity-60 cursor-not-allowed h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Verificaciones
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Verificación de antecedentes y documentos en blockchain
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <div className="text-center">
              <p className={`text-3xl font-bold ${
                totalReferencias >= 3 ? 'text-orange-600' : 'text-purple-600'
              }`}>
                {totalReferencias}/3
              </p>
              <p className="text-sm text-gray-600 mt-1">Referencias</p>
            </div>
            {/* 🆕 Estadística Postulaciones S010.3 */}
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">
                {postulacionesActivas}/{totalPostulaciones}
              </p>
              <p className="text-sm text-gray-600 mt-1">Postulaciones</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidatoDashboard;