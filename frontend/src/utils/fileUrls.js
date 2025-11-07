// file: frontend/src/utils/fileUrls.js

// ❌ NO DEBE TENER ESTOS IMPORTS:
// import axios from '../api/axios';
// import axiosInstance from '../api/axios';

/**
 * Utilidades para manejar URLs de archivos estáticos
 * Este archivo es PURO JavaScript, sin axios
 */

/**
 * Construir URL completa para archivos estáticos (fotos, documentos)
 * NO incluye /api porque son archivos servidos directamente por Express
 */
export const getFileUrl = (relativePath) => {
  if (!relativePath) return null;
  
  // Si ya tiene el dominio completo, retornar tal cual
  if (relativePath.startsWith('http')) {
    return relativePath;
  }
  
  // Construir URL: http://localhost:5000/uploads/fotos/xxx.jpg
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Asegurar que relativePath empieza con /
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  // ✅ NO agregar /api porque los archivos están en /uploads directamente
  return `${baseUrl}${path}`;
};

/**
 * Agregar query string anti-cache a URL
 */
export const addCacheBuster = (url) => {
  if (!url) return null;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

/**
 * Obtener URL de foto de perfil con cache buster
 */
export const getFotoPerfilUrl = (fotoPath) => {
  if (!fotoPath) return null;
  const url = getFileUrl(fotoPath);
  return addCacheBuster(url);
};

/**
 * Obtener URL de documento (CV, certificado, etc)
 */
export const getDocumentoUrl = (documentoPath) => {
  if (!documentoPath) return null;
  return getFileUrl(documentoPath);
};