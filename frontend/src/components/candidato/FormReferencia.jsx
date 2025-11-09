// file: frontend/src/components/candidato/FormReferencia.jsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { referenciaSchema, TIPOS_RELACION } from '../../schemas/referenciaSchema';
import { useState } from 'react';
import { referenciasAPI } from '../../api/referencias'; // ✅ CAMBIO

export default function FormReferencia({ 
  referenciaEditar = null, 
  candidato_id,
  onSuccess, 
  onCancel 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(referenciaSchema),
    defaultValues: referenciaEditar || {
      nombre_completo: '',
      cargo: '',
      empresa: '',
      email: '',
      telefono: '',
      relacion: '',
      anos_conocidos: '',
      notas: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        candidato_id,
        nombre_completo: data.nombre_completo,
        cargo: data.cargo || null,
        empresa: data.empresa || null,
        email: data.email,
        telefono: data.telefono || null,
        relacion: data.relacion,
        anos_conocidos: data.anos_conocidos ? Number(data.anos_conocidos) : null,
        notas: data.notas || null
      };

      if (referenciaEditar) {
        // ✅ CAMBIO: Usar API service
        await referenciasAPI.actualizar(referenciaEditar.id, payload);
        console.log('✅ Referencia actualizada');
      } else {
        // ✅ CAMBIO: Usar API service
        await referenciasAPI.crear(payload);
        console.log('✅ Referencia creada');
      }

      reset();
      onSuccess();

    } catch (err) {
      console.error('❌ Error al guardar referencia:', err);
      
      if (err.response?.status === 400) {
        const mensaje = err.response.data.mensaje || err.response.data.error;
        
        if (mensaje.includes('máximo de 3 referencias')) {
          setError('⚠️ Ya tienes el máximo de 3 referencias permitidas. Elimina una para agregar otra.');
        } else if (mensaje.includes('email')) {
          setError('⚠️ Ya existe una referencia con este email.');
        } else {
          setError(mensaje);
        }
      } else {
        setError('Error al guardar referencia. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {referenciaEditar ? 'Editar Referencia' : 'Nueva Referencia'}
        </h2>
        <p className="text-gray-600 mt-2">
          Agrega información de personas que pueden dar referencias sobre tu experiencia profesional o académica
        </p>
        <p className="text-sm text-orange-600 mt-1">
          ⚠️ Máximo 3 referencias permitidas
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Nombre completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('nombre_completo')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.nombre_completo ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Dr. Juan Pérez López"
          />
          {errors.nombre_completo && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre_completo.message}</p>
          )}
        </div>

        {/* Cargo y Empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cargo
            </label>
            <input
              type="text"
              {...register('cargo')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cargo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Gerente de RRHH"
            />
            {errors.cargo && (
              <p className="mt-1 text-sm text-red-600">{errors.cargo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa/Institución
            </label>
            <input
              type="text"
              {...register('empresa')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.empresa ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Universidad Mayor de San Simón"
            />
            {errors.empresa && (
              <p className="mt-1 text-sm text-red-600">{errors.empresa.message}</p>
            )}
          </div>
        </div>

        {/* Relación y Años conocidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relación <span className="text-red-500">*</span>
            </label>
            <select
              {...register('relacion')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.relacion ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione...</option>
              {TIPOS_RELACION.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {errors.relacion && (
              <p className="mt-1 text-sm text-red-600">{errors.relacion.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Años de Conocimiento
            </label>
            <input
              type="number"
              {...register('anos_conocidos', { valueAsNumber: true })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.anos_conocidos ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 3"
              min="0"
              max="50"
            />
            {errors.anos_conocidos && (
              <p className="mt-1 text-sm text-red-600">{errors.anos_conocidos.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              ¿Cuántos años hace que conoces a esta persona?
            </p>
          </div>
        </div>

        {/* Email y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: juan.perez@empresa.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              {...register('telefono')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: +591 70123456"
            />
            {errors.telefono && (
              <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
            )}
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            {...register('notas')}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.notas ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Trabajé bajo su supervisión en el proyecto de migración de sistemas durante 2 años. Puede dar referencias sobre mis habilidades técnicas y trabajo en equipo."
          />
          {errors.notas && (
            <p className="mt-1 text-sm text-red-600">{errors.notas.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Contexto adicional que ayude a entender tu relación profesional
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : referenciaEditar ? 'Actualizar Referencia' : 'Guardar Referencia'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Nota informativa */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Consejos Importantes</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Obtén el consentimiento de la persona antes de agregarla como referencia</li>
          <li>Verifica que el email sea correcto para que empresas puedan contactarla</li>
          <li>Solo puedes tener un máximo de 3 referencias activas</li>
          <li>Las referencias pueden ser laborales, académicas o de clientes</li>
        </ul>
      </div>
    </div>
  );
}