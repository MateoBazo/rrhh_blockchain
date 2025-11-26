// file: frontend/src/pages/Registro.jsx (PARTE 1/2)

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registroCandidatoSchema, registroEmpresaSchema } from '../utils/validators';
import { useAuth } from '../hooks/useAuth'; 
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { SECTOR_OPTIONS, DEPARTAMENTOS_BOLIVIA } from '../utils/constants';

export default function Registro() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth(); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('CANDIDATO');

  // ✅ SCHEMA DINÁMICO según rol seleccionado
  const currentSchema = selectedRole === 'CANDIDATO' 
    ? registroCandidatoSchema 
    : registroEmpresaSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      rol: 'CANDIDATO',
    },
  });

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('rol', role);
    
    // ✅ Limpiar formulario al cambiar de rol
    reset({
      email: '',
      password: '',
      confirmPassword: '',
      rol: role
    });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log('📝 Datos del formulario:', data);
      const result = await registerUser(data);
      
      console.log('✅ Resultado registro:', result);
      
      // ✅ VERIFICACIÓN CORRECTA:
      if (result && result.success) {
        console.log('🎉 Registro exitoso');
        
        // Si hay auto-login, redirigir al dashboard
        if (result.autoLogin && result.user) {
          console.log('🚀 Auto-login exitoso, redirigiendo a dashboard...');
          const userRole = result.user.rol;
          
          if (userRole === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (userRole === 'EMPRESA') {
            navigate('/empresa/dashboard');
          } else if (userRole === 'CANDIDATO') {
            navigate('/candidato/dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          // Sin auto-login, ir a login
          console.log('📝 Registro exitoso sin auto-login, redirigiendo a login...');
          navigate('/login');
        }
      } else {
        // ✅ CASO DE ERROR
        console.error('❌ Registro falló:', result?.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('❌ Error en formulario registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Crear Cuenta
          </h1>
          <p className="text-gray-600">
            Únete a nuestro sistema de gestión de RRHH
          </p>
        </div>

        {/* Card de Registro */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* ===== SELECCIÓN DE ROL ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ¿Cómo deseas registrarte? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Opción Candidato */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('CANDIDATO')}
                  className={clsx(
                    'flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all',
                    selectedRole === 'CANDIDATO'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                >
                  <UserIcon className="h-12 w-12 mb-2 text-blue-600" />
                  <span className="font-semibold text-gray-900">Candidato</span>
                  <span className="text-sm text-gray-500 mt-1">Busco empleo</span>
                </button>

                {/* Opción Empresa */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('EMPRESA')}
                  className={clsx(
                    'flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all',
                    selectedRole === 'EMPRESA'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                >
                  <BuildingOfficeIcon className="h-12 w-12 mb-2 text-blue-600" />
                  <span className="font-semibold text-gray-900">Empresa</span>
                  <span className="text-sm text-gray-500 mt-1">Busco talento</span>
                </button>
              </div>
              {errors.rol && (
                <p className="mt-1 text-sm text-red-600">{errors.rol.message}</p>
              )}
            </div>

            {/* ===== CAMPOS COMUNES ===== */}
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                required
                {...register('password')}
              />

              <Input
                label="Confirmar Contraseña"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                required
                {...register('confirmPassword')}
              />
            </div>{/* ===== CAMPOS ESPECÍFICOS CANDIDATO ===== */}
            {selectedRole === 'CANDIDATO' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Cédula de Identidad (CI)"
                    type="text"
                    placeholder="123456"
                    error={errors.ci?.message}
                    required
                    {...register('ci')}
                  />

                  <Input
                    label="Fecha de Nacimiento"
                    type="date"
                    error={errors.fecha_nacimiento?.message}
                    required
                    {...register('fecha_nacimiento')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Nombres"
                    type="text"
                    placeholder="Juan Carlos"
                    error={errors.nombres?.message}
                    required
                    {...register('nombres')}
                  />

                  <Input
                    label="Apellido Paterno"
                    type="text"
                    placeholder="Pérez"
                    error={errors.apellido_paterno?.message}
                    required
                    {...register('apellido_paterno')}
                  />

                  <Input
                    label="Apellido Materno"
                    type="text"
                    placeholder="López (opcional)"
                    error={errors.apellido_materno?.message}
                    {...register('apellido_materno')}
                  />
                </div>

                {/* ✅ SECTOR DE INTERÉS CANDIDATO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sector de Interés <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('sector')}
                    className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecciona un sector...</option>
                    {SECTOR_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.sector && (
                    <p className="mt-1 text-sm text-red-600">{errors.sector.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Recibirás vacantes relacionadas con este sector
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('departamento')}
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecciona...</option>
                      {DEPARTAMENTOS_BOLIVIA.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.departamento && (
                      <p className="mt-1 text-sm text-red-600">{errors.departamento.message}</p>
                    )}
                  </div>

                  <Input
                    label="Ciudad"
                    type="text"
                    placeholder="Cochabamba"
                    error={errors.ciudad?.message}
                    required
                    {...register('ciudad')}
                  />

                  <Input
                    label="Teléfono"
                    type="tel"
                    placeholder="70123456 (opcional)"
                    error={errors.telefono?.message}
                    {...register('telefono')}
                  />
                </div>
              </>
            )}

            {/* ===== CAMPOS ESPECÍFICOS EMPRESA ===== */}
            {selectedRole === 'EMPRESA' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="NIT"
                    type="text"
                    placeholder="123456789"
                    error={errors.nit?.message}
                    required
                    {...register('nit')}
                  />

                  <Input
                    label="Teléfono"
                    type="tel"
                    placeholder="44123456 (opcional)"
                    error={errors.telefono?.message}
                    {...register('telefono')}
                  />
                </div>

                <Input
                  label="Razón Social"
                  type="text"
                  placeholder="Tech Solutions S.R.L."
                  error={errors.razon_social?.message}
                  required
                  {...register('razon_social')}
                />

                <Input
                  label="Nombre Comercial"
                  type="text"
                  placeholder="TechSol (opcional)"
                  error={errors.nombre_comercial?.message}
                  {...register('nombre_comercial')}
                />

                {/* ✅ SECTOR EMPRESA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sector de la Empresa <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('sector')}
                    className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecciona un sector...</option>
                    {SECTOR_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.sector && (
                    <p className="mt-1 text-sm text-red-600">{errors.sector.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Define el sector principal de tu empresa
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('departamento')}
                      className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecciona...</option>
                      {DEPARTAMENTOS_BOLIVIA.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.departamento && (
                      <p className="mt-1 text-sm text-red-600">{errors.departamento.message}</p>
                    )}
                  </div>

                  <Input
                    label="Ciudad"
                    type="text"
                    placeholder="La Paz"
                    error={errors.ciudad?.message}
                    required
                    {...register('ciudad')}
                  />
                </div>
              </>
            )}

            {/* ===== TÉRMINOS Y CONDICIONES ===== */}
            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-600">
                Acepto los{' '}
                <Link to="/terminos" className="text-blue-600 hover:underline">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/privacidad" className="text-blue-600 hover:underline">
                  política de privacidad
                </Link>
              </label>
            </div>

            {/* ===== BOTÓN SUBMIT ===== */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>

            {/* ===== LINK LOGIN ===== */}
            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}