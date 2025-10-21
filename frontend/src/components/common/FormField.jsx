// file: frontend/src/components/common/FormField.jsx
import React from 'react';

/**
 * FormField - Componente reutilizable para campos de formulario
 * Incluye label, input/textarea, mensaje de error y asterisco para required
 */
const FormField = React.forwardRef(({ 
  label, 
  name, 
  type = 'text', 
  error, 
  required = false,
  placeholder,
  disabled = false,
  as = 'input', // 'input' o 'textarea'
  rows = 4,
  ...props 
}, ref) => {
  const baseInputClasses = `
    mt-1 block w-full px-4 py-2.5 
    border rounded-lg shadow-sm
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    transition duration-150 ease-in-out
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300'
    }
  `;

  const Component = as;

  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Component
        id={name}
        name={name}
        type={type}
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        rows={as === 'textarea' ? rows : undefined}
        className={baseInputClasses}
        {...props}
      />
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;