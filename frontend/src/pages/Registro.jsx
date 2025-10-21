// file: src/pages/Registro.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registroSchema } from '../utils/validators';
import useAuth from '../hooks/useAuth'; // ✅ Actualizar import
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Registro() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth(); // ✅ Actualizar aquí también
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('CANDIDATO');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // watch, // ❌ ELIMINAR esta línea (no se usa)
  } = useForm({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      rol: 'CANDIDATO',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log('📝 Datos del formulario:', data);
      const result = await registerUser(data);
      
      console.log('✅ Resultado registro:', result);
      
      if (result.success) {
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
          console.log('📝 Registro exitoso, redirigiendo a login...');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('❌ Error en formulario registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('rol', role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Registro de Usuario
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Selección de Rol */}
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

            {/* Campos del formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                type="text"
                placeholder="Juan"
                error={errors.nombre?.message}
                required
                {...register('nombre')}
              />

              <Input
                label="Apellido"
                type="text"
                placeholder="Pérez"
                error={errors.apellido?.message}
                required
                {...register('apellido')}
              />
            </div>

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

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

            {/* Términos y condiciones */}
            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Acepto los{' '}
                <Link to="/terminos" className="text-blue-600 hover:text-blue-700">
                  Términos de Servicio
                </Link>{' '}
                y la{' '}
                <Link to="/privacidad" className="text-blue-600 hover:text-blue-700">
                  Política de Privacidad
                </Link></label>
            </div>

            {/* Botón Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              Crear Cuenta
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                ¿Ya tienes cuenta?
              </span>
            </div>
          </div>

          {/* Link a Login */}
          <Link to="/login">
            <Button variant="outline" fullWidth>
              Iniciar Sesión
            </Button>
          </Link>
        </div>

        {/* Footer de seguridad */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Tus datos están protegidos con encriptación de grado bancario
          </p>
        </div>
      </div>
    </div>
  );
}