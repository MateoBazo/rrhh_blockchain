// file: frontend/src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} Contexto de autenticación con user, login, logout, etc.
 * @throws {Error} Si se usa fuera de AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};