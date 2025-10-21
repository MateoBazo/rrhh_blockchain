// file: frontend/src/context/AuthContext.jsx

import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error cargando usuario:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔄 Enviando login:', { email });
      const response = await authAPI.login(email, password);
      
      console.log('📥 Respuesta login completa:', response);
      console.log('📥 response.success:', response.success);
      console.log('📥 response.data:', response.data);
      
      // Backend devuelve { success: true, data: { usuario, token } }
      if (response.success && response.data) {
        const { token, usuario } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));
        
        // Actualizar estado
        setUser(usuario);
        setIsAuthenticated(true);
        
        const welcomeMsg = `¡Bienvenido de nuevo!`;
        toast.success(welcomeMsg);
        
        return { success: true, user: usuario };
      } else {
        const errorMsg = response.message || 'Error al iniciar sesión';
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      console.error('❌ error.response?.data:', error.response?.data);
      
      const message = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Error al conectar con el servidor';
      
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔄 Enviando registro:', userData);
      const response = await authAPI.register(userData);
      
      console.log('📥 Respuesta registro completa:', response);
      console.log('📥 response.success:', response.success);
      console.log('📥 response.message:', response.message);
      console.log('📥 response.data:', response.data);
      
      // Backend devuelve { success: true, message: '...', data: { usuario, token } }
      if (response.success) {
        const message = response.message || '¡Registro exitoso!';
        toast.success(message);
        
        // Si backend devuelve token, auto-login
        if (response.data?.token) {
          console.log('✅ Token recibido, haciendo auto-login...');
          const { token, usuario } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(usuario));
          
          setUser(usuario);
          setIsAuthenticated(true);
          
          return { success: true, autoLogin: true, user: usuario };
        }
        
        return { success: true };
      } else {
        const errorMsg = response.message || 'Error al registrarse';
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      console.error('❌ error.response:', error.response);
      console.error('❌ error.response?.data:', error.response?.data);
      
      const message = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Error al conectar con el servidor';
      
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Sesión cerrada correctamente');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };