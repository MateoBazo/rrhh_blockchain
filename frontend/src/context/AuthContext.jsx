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

  // file: frontend/src/context/AuthContext.jsx

// Busca la función register (aproximadamente línea 75) y reemplázala con esto:

const register = async (userData) => {
  try {
    console.log('🔄 Enviando registro:', userData);
    
    // ✅ ELIMINAR confirmPassword antes de enviar (usando destructuring con rest)
    const { confirmPassword, ...dataParaBackend } = userData;
    
    // ✅ Evitar warning ESLint - usar la variable o indicar que no se usa
    void confirmPassword; // Esta línea evita el warning de ESLint
    
    console.log('🔄 Datos limpiados (sin confirmPassword):', dataParaBackend);
    
    const response = await authAPI.register(dataParaBackend);
    
    console.log('✅ Response.data:', response.data);
    
    if (response.data && response.data.success) {
      const { data } = response.data;
      
      // Auto-login: guardar usuario y token
      if (data.token && data.usuario) {
        setUser(data.usuario);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        
        toast.success(`¡Bienvenido ${data.usuario.email}!`);
        
        return { 
          success: true, 
          user: data.usuario, 
          autoLogin: true 
        };
      }
      
      // Registro exitoso sin auto-login
      toast.success('Registro exitoso. Por favor inicia sesión.');
      return { success: true, autoLogin: false };
    }
    
    return { success: false, message: response.data?.message || 'Error en registro' };
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    console.error('❌ error.response:', error.response);
    console.error('❌ error.response?.data:', error.response?.data);
    console.error('❌ error.response?.data.error:', error.response?.data.error); // ✅ VER DETALLE
    
    const errorMessage = error.response?.data?.message || 'Error al registrar usuario';
    
    // Mostrar errores específicos si existen
    if (error.response?.data?.error && Array.isArray(error.response.data.error)) {
      const errores = error.response.data.error.map(e => e.msg || e.message).join(', ');
      toast.error(`Error: ${errores}`);
    } else {
      toast.error(errorMessage);
    }
    
    return { success: false, message: errorMessage };
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