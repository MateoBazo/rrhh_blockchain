// file: src/context/AuthContext.jsx
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
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { token, usuario } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));
        
        setUser(usuario);
        setIsAuthenticated(true);
        
        toast.success(`¡Bienvenido ${usuario.nombre}!`);
        return { success: true, user: usuario };
      } else {
        toast.error(response.message || 'Error al iniciar sesión');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al conectar con el servidor';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        toast.success('¡Registro exitoso! Por favor inicia sesión');
        return { success: true };
      } else {
        toast.error(response.message || 'Error al registrarse');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al conectar con el servidor';
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

// ✅ Solo exportar el contexto (NO la función useAuth)
export { AuthContext };