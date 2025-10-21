// file: frontend/src/pages/PerfilUsuario.jsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { candidatosAPI } from '../api/candidatos';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { perfilCandidatoSchema } from '../schemas/perfilSchema';

/**
 * Página para editar el perfil del candidato
 * Carga datos existentes y permite actualizarlos
 */
const PerfilUsuario = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [candidatoData, setCandidatoData] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(perfilCandidatoSchema),
    defaultValues: {
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      ci: '',
      telefono: '',
      direccion: '',
      fecha_nacimiento: '',
      profesion: '',
      nivel_educativo: '',
      estado_laboral: '',
      disponibilidad: '',
      modalidad_preferida: '',
      perfil_publico: true,
    },
  });



  // Cargar datos del candidato al montar componente
  const cargarDatosCandidato = useCallback(async () => {
    try {
      setLoading(true);

      const response = await candidatosAPI.obtenerPerfil();

      if (response.data.success) {
        const datos = response.data.data;
        console.log('🔍 DEBUG - datos completos:', datos);

        setCandidatoData(datos);

        // Mapear con nombres correctos de la BD
        setValue('nombres', datos.nombres || '');
        setValue('apellido_paterno', datos.apellido_paterno || '');
        setValue('apellido_materno', datos.apellido_materno || '');
        setValue('ci', datos.ci || '');
        setValue('telefono', datos.telefono || '');
        setValue('direccion', datos.direccion || '');
        setValue('profesion', datos.profesion || '');
        setValue('nivel_educativo', datos.nivel_educativo || '');
        setValue('estado_laboral', datos.estado_laboral || '');
        setValue('disponibilidad', datos.disponibilidad || '');
        setValue('modalidad_preferida', datos.modalidad_preferida || '');
        setValue('perfil_publico', datos.perfil_publico ?? true);

        if (datos.fecha_nacimiento) {
          const fechaFormateada = format(new Date(datos.fecha_nacimiento), 'yyyy-MM-dd');
          setValue('fecha_nacimiento', fechaFormateada);
        }
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error(error.response?.data?.message || 'Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    cargarDatosCandidato();
  }, [cargarDatosCandidato]);

  const onSubmit = async (data) => {
    console.log('🔍 DEBUG FRONTEND - data ORIGINAL:', data);

    try {
      setSaving(true);
      const datosLimpios = { ...data };

      console.log('🔍 DEBUG FRONTEND - datosLimpios:', datosLimpios);
      console.log('🔍 DEBUG FRONTEND - candidatoData.id:', candidatoData?.id);

      const response = await candidatosAPI.actualizarPerfil(candidatoData.id, datosLimpios);

      console.log('🔍 DEBUG FRONTEND - response:', response);

      if (response.data.success) {
        toast.success('✅ Perfil actualizado correctamente');
        await cargarDatosCandidato();

        setTimeout(() => {
          navigate('/candidato/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="large" text="Cargando perfil..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="mt-2 text-sm text-gray-600">
            Completa tu información personal para que las empresas puedan conocerte mejor
          </p>
        </div>

        {/* 🔧 Corrección: Mostrar errores sin romper el render */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-bold text-red-800">Errores de validación:</h3>
            <ul className="text-sm text-red-600 list-disc list-inside mt-2 space-y-1">
              {Object.entries(errors).map(([campo, error]) => (
                <li key={campo}>
                  <strong>{campo}:</strong> {error?.message || 'Error desconocido'}
                </li>
              ))}
            </ul>
            {/* Si quieres seguir viendo el objeto completo sin romper: */}
            {/* <pre className="text-xs text-red-600 mt-2 overflow-auto">
              {JSON.stringify(errors, getCircularReplacer(), 2)}
            </pre> */}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
          {/* Datos Personales */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
              📝 Datos Personales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Nombres"
                name="nombres"
                required
                placeholder="Ej: Juan Carlos"
                error={errors.nombres?.message}
                {...register('nombres')}
              />

              <FormField
                label="Apellido Paterno"
                name="apellido_paterno"
                required
                placeholder="Ej: Pérez"
                error={errors.apellido_paterno?.message}
                {...register('apellido_paterno')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Apellido Materno"
                name="apellido_materno"
                placeholder="Ej: García"
                error={errors.apellido_materno?.message}
                {...register('apellido_materno')}
              />

              <FormField
                label="CI"
                name="ci"
                placeholder="Ej: 1234567 CB"
                error={errors.ci?.message}
                {...register('ci')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Teléfono"
                name="telefono"
                type="tel"
                placeholder="Ej: +591 70123456"
                error={errors.telefono?.message}
                {...register('telefono')}
              />

              <FormField
                label="Fecha de Nacimiento"
                name="fecha_nacimiento"
                type="date"
                error={errors.fecha_nacimiento?.message}
                {...register('fecha_nacimiento')}
              />
            </div>

            <FormField
              label="Dirección"
              name="direccion"
              placeholder="Ej: Av. Heroínas #1234, Cochabamba"
              error={errors.direccion?.message}
              {...register('direccion')}
            />
          </div>

          {/* Información Profesional */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
              💼 Información Profesional
            </h2>

            <FormField
              label="Profesión"
              name="profesion"
              placeholder="Ej: Ingeniero de Software"
              error={errors.profesion?.message}
              {...register('profesion')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel Educativo
                </label>
                <select
                  className="mt-1 block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  {...register('nivel_educativo')}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Secundaria">Secundaria</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Universitario">Universitario</option>
                  <option value="Postgrado">Postgrado</option>
                  <option value="Maestría">Maestría</option>
                  <option value="Doctorado">Doctorado</option>
                </select>
                {errors.nivel_educativo && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.nivel_educativo.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Laboral
                </label>
                <select
                  className="mt-1 block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  {...register('estado_laboral')}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Desempleado">Desempleado</option>
                  <option value="Buscando">Buscando</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Estudiante">Estudiante</option>
                </select>
                {errors.estado_laboral && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.estado_laboral.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponibilidad
                </label>
                <select
                  className="mt-1 block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  {...register('disponibilidad')}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Inmediata">Inmediata</option>
                  <option value="15 días">15 días</option>
                  <option value="1 mes">1 mes</option>
                  <option value="2 meses">2 meses</option>
                  <option value="No disponible">No disponible</option>
                </select>
                {errors.disponibilidad && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.disponibilidad.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modalidad Preferida
                </label>
                <select
                  className="mt-1 block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  {...register('modalidad_preferida')}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Indiferente">Indiferente</option>
                </select>
                {errors.modalidad_preferida && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.modalidad_preferida.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Privacidad */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
              🔒 Privacidad
            </h2>

            <div className="flex items-center">
              <input
                id="perfil_publico"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...register('perfil_publico')}
              />
              <label htmlFor="perfil_publico" className="ml-3 text-sm text-gray-700">
                Hacer mi perfil visible para empresas
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500 ml-7">
              Si desactivas esta opción, las empresas no podrán ver tu perfil en búsquedas
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>

        {/* Info adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Próximos pasos
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Una vez completado tu perfil básico, podrás:
              </p>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                <li>Subir tu CV y foto de perfil</li>
                <li>Agregar idiomas y certificaciones</li>
                <li>Añadir referencias laborales</li>
                <li>Aplicar a ofertas de trabajo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
