import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email requerido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

export const registroSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(['CANDIDATO', 'EMPRESA'], {
    errorMap: () => ({ message: 'Debe elegir un rol válido' }),
  }),
});

export const perfilCandidatoSchema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  apellido: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  resumen_profesional: z.string().optional(),
});

export const perfilEmpresaSchema = z.object({
  nombre_empresa: z.string().min(2, 'Nombre de empresa requerido'),
  razon_social: z.string().min(2, 'Razón social requerida'),
  rfc: z.string().min(12, 'RFC debe tener al menos 12 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  sitio_web: z.string().url('URL inválida').optional().or(z.literal('')),
});