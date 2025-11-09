// file: frontend/src/schemas/referenciaSchema.js

/**
 * VALIDACIÓN: Schema Zod para Referencias
 * 
 * Adaptado a estructura BD: referencias (no referencias_laborales)
 * Campos: nombre_completo, cargo, empresa, email, telefono, relacion, anos_conocidos, notas
 */

import { z } from 'zod';

// Opciones de relación (según ENUM de BD)
export const TIPOS_RELACION = [
  { value: 'JEFE_DIRECTO', label: 'Jefe Directo' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'COLEGA', label: 'Colega' },
  { value: 'PROFESOR', label: 'Profesor/Instructor' },
  { value: 'CLIENTE', label: 'Cliente' },
  { value: 'OTRO', label: 'Otro' }
];

export const referenciaSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  cargo: z
    .string()
    .min(2, 'El cargo debe tener al menos 2 caracteres')
    .max(100, 'El cargo no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  empresa: z
    .string()
    .min(2, 'El nombre de la empresa/institución debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .optional()
    .or(z.literal('')),
  
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'El email es obligatorio'),
  
  telefono: z
    .string()
    .regex(/^[\d\s+()-]+$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  
  relacion: z
    .enum(['JEFE_DIRECTO', 'SUPERVISOR', 'COLEGA', 'PROFESOR', 'CLIENTE', 'OTRO'], {
      errorMap: () => ({ message: 'Seleccione un tipo de relación válido' })
    }),
  
  anos_conocidos: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativo')
    .max(50, 'No puede superar 50 años')
    .optional()
    .or(z.literal('')),
  
  notas: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal(''))
});
