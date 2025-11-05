// file: frontend/src/schemas/perfilSchema.js
import { z } from 'zod';
import { subYears, isAfter } from 'date-fns';

/**
 * Schema de validación para editar perfil de candidato
 */
export const perfilCandidatoSchema = z.object({
  nombres: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),

  apellido_paterno: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),
    
  apellido_materno: z
    .string()
    .max(100, 'El apellido materno no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, 'El apellido solo puede contener letras')
    .optional()
    .or(z.literal('')),

  telefono: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .regex(/^[\d\s\-+()\]]+$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),

  direccion: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),

  fecha_nacimiento: z
    .string()
    .refine((date) => {
      if (!date) return true; // Opcional
      const birthDate = new Date(date);
      const minAge = subYears(new Date(), 18);
      return isAfter(minAge, birthDate);
    }, 'Debes ser mayor de 18 años')
    .optional()
    .or(z.literal('')),

  resumen_profesional: z
    .string()
    .max(1000, 'El resumen no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),

  perfil_publico: z
    .boolean()
    .optional(),

  // === NUEVOS CAMPOS ===
  ci: z
    .string()
    .min(6, 'El CI debe tener al menos 6 caracteres')
    .max(20, 'El CI no puede exceder 20 caracteres')
    .regex(/^[0-9A-Za-z-]+$/, 'El CI solo puede contener números, letras y guiones')
    .optional()
    .or(z.literal('')),

  profesion: z
    .string()
    .min(2, 'La profesión debe tener al menos 2 caracteres')
    .max(100, 'La profesión no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'La profesión solo puede contener letras')
    .optional()
    .or(z.literal('')),

  nivel_educativo: z
    .enum([
      'Secundaria',
      'Técnico',
      'Licenciatura',
      'Maestría',
      'Doctorado'
    ])
    .optional()
    .or(z.literal('')),

  estado_laboral: z
    .enum([
      'Empleado',
      'Desempleado',
      'Busqueda_activa',
      'Busqueda_pasiva'
    ])
    .optional()
    .or(z.literal('')),

  disponibilidad: z
    .enum([
      'inmediata',
      '2_semanas',
      '1_mes',
      'mas_1_mes'
    ])
    .optional()
    .or(z.literal('')),

  modalidad_preferida: z
    .enum([
      'Presencial',
      'Remoto',
      'Híbrido',
      'Indiferente'
    ])
    .optional()
    .or(z.literal('')),
});