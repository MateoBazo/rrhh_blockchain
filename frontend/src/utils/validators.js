// file: frontend/src/utils/validators.js

import { z } from 'zod';
import { SECTORES_INDUSTRIALES, DEPARTAMENTOS_BOLIVIA } from './constants';

// ============================================
// 🔐 AUTENTICACIÓN
// ============================================

/**
 * Schema Login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// ============================================
// 📝 REGISTRO - SCHEMAS INDEPENDIENTES
// ============================================

/**
 * Schema Registro Candidato
 * ✅ Schema completo sin extensión (evita error Zod refinements)
 */
export const registroCandidatoSchema = z.object({
  // Campos comunes
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
  rol: z.enum(['CANDIDATO', 'EMPRESA'], {
    errorMap: () => ({ message: 'Debe seleccionar un rol válido' }),
  }),
  
  // Campos específicos candidato
  ci: z
    .string()
    .min(5, 'CI debe tener mínimo 5 caracteres')
    .max(20, 'CI muy largo'),
  nombres: z
    .string()
    .min(2, 'Nombre muy corto')
    .max(100, 'Nombre muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras permitidas'),
  apellido_paterno: z
    .string()
    .min(2, 'Apellido muy corto')
    .max(100, 'Apellido muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras permitidas'),
  apellido_materno: z
    .string()
    .max(100, 'Apellido muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, 'Solo letras permitidas')
    .optional()
    .or(z.literal('')),
  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD')
    .refine((fecha) => {
      const nacimiento = new Date(fecha);
      const hoy = new Date();
      const edad = Math.floor((hoy - nacimiento) / (365.25 * 24 * 60 * 60 * 1000));
      return edad >= 18;
    }, 'Debes ser mayor de 18 años'),
  sector: z
    .string()
    .min(1, 'Selecciona un sector')
    .refine((val) => SECTORES_INDUSTRIALES.includes(val), 'Sector inválido'),
  telefono: z
    .string()
    .regex(/^[0-9]{7,20}$/, 'Teléfono inválido (7-20 dígitos)')
    .optional()
    .or(z.literal('')),
  departamento: z
    .string()
    .min(1, 'Selecciona un departamento')
    .refine((val) => DEPARTAMENTOS_BOLIVIA.includes(val), 'Departamento inválido'),
  ciudad: z
    .string()
    .min(2, 'Ciudad muy corta')
    .max(100, 'Ciudad muy larga'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/**
 * Schema Registro Empresa
 * ✅ Schema completo independiente
 */
export const registroEmpresaSchema = z.object({
  // Campos comunes
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
  rol: z.enum(['CANDIDATO', 'EMPRESA'], {
    errorMap: () => ({ message: 'Debe seleccionar un rol válido' }),
  }),
  
  // Campos específicos empresa
  nit: z
    .string()
    .min(5, 'NIT debe tener mínimo 5 caracteres')
    .max(20, 'NIT muy largo'),
  razon_social: z
    .string()
    .min(3, 'Razón social muy corta')
    .max(255, 'Razón social muy larga'),
  nombre_comercial: z
    .string()
    .max(255, 'Nombre comercial muy largo')
    .optional()
    .or(z.literal('')),
  sector: z
    .string()
    .min(1, 'Selecciona un sector')
    .refine((val) => SECTORES_INDUSTRIALES.includes(val), 'Sector inválido'),
  telefono: z
    .string()
    .regex(/^[0-9]{7,20}$/, 'Teléfono inválido (7-20 dígitos)')
    .optional()
    .or(z.literal('')),
  departamento: z
    .string()
    .min(1, 'Selecciona un departamento')
    .refine((val) => DEPARTAMENTOS_BOLIVIA.includes(val), 'Departamento inválido'),
  ciudad: z
    .string()
    .min(2, 'Ciudad muy corta')
    .max(100, 'Ciudad muy larga'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// ============================================
// 👤 PERFIL CANDIDATO
// ============================================

/**
 * Schema Perfil Candidato
 */
export const perfilCandidatoSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  apellido: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  resumen_profesional: z.string().optional(),
});

// ============================================
// 🏢 PERFIL EMPRESA
// ============================================

/**
 * Schema Perfil Empresa
 */
export const perfilEmpresaSchema = z.object({
  nombre_empresa: z.string().min(2, 'Nombre de empresa requerido'),
  razon_social: z.string().min(2, 'Razón social requerida'),
  rfc: z.string().min(12, 'RFC debe tener al menos 12 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  sitio_web: z.string().url('URL inválida').optional().or(z.literal('')),
});