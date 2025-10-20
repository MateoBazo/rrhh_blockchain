// file: src/components/common/Input.jsx
import clsx from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    error,
    placeholder,
    disabled = false,
    required = false,
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:border-transparent',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500',
          disabled && 'bg-gray-100 cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

export default Input;