// file: src/utils/validators.js
import { z } from 'zod';

// Schema de login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Schema de registro
export const registroSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
  rol: z.enum(['CANDIDATO', 'EMPRESA'], {
    errorMap: () => ({ message: 'Debe seleccionar un rol válido' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Schema de perfil candidato
export const perfilCandidatoSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  apellido: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  resumen_profesional: z.string().optional(),
});

// Schema de perfil empresa
export const perfilEmpresaSchema = z.object({
  nombre_empresa: z.string().min(2, 'Nombre de empresa requerido'),
  razon_social: z.string().min(2, 'Razón social requerida'),
  rfc: z.string().min(12, 'RFC debe tener al menos 12 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  sitio_web: z.string().url('URL inválida').optional().or(z.literal('')),
});