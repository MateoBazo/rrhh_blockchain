// file: src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../utils/validators';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        // Redirigir según rol
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
      }
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Sistema RRHH
          </h1>
          <p className="text-gray-600">
            Gestión de Recursos Humanos con Blockchain
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            {/* Password */}
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              required
              {...register('password')}
            />

            {/* Olvidé contraseña */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          {/* Link a Registro */}
          <Link to="/registro">
            <Button variant="outline" fullWidth>
              Crear Cuenta Nueva
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Al continuar, aceptas nuestros{' '}
          <Link to="/terminos" className="text-blue-600 hover:text-blue-700">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link to="/privacidad" className="text-blue-600 hover:text-blue-700">
            Política de Privacidad
          </Link>
        </p>
      </div>
    </div>
  );
}