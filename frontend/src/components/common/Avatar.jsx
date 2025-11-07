// file: frontend/src/components/common/Avatar.jsx
import { useNavigate } from 'react-router-dom';

/**
 * Componente Avatar reutilizable
 * @param {string} fotoUrl - URL de la foto de perfil
 * @param {string} nombres - Nombres del usuario (para iniciales)
 * @param {string} apellidoPaterno - Apellido paterno (para iniciales)
 * @param {string} size - Tamaño: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} clickable - Si es clickable para ir a /perfil
 * @param {string} className - Clases adicionales
 */
const Avatar = ({ 
  fotoUrl, 
  nombres = '', 
  apellidoPaterno = '', 
  size = 'md', 
  clickable = true,
  className = ''
}) => {
  const navigate = useNavigate();

  // Mapeo de tamaños
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  // Generar iniciales
  const getIniciales = () => {
    const inicial1 = nombres?.charAt(0)?.toUpperCase() || '';
    const inicial2 = apellidoPaterno?.charAt(0)?.toUpperCase() || '';
    return `${inicial1}${inicial2}` || '?';
  };

  // Handler click
  const handleClick = () => {
    if (clickable) {
      navigate('/perfil');
    }
  };

  const baseClasses = `
    ${sizeClasses[size]} 
    rounded-full 
    object-cover 
    ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''}
    transition-all duration-200
    ${className}
  `;

  return (
    <div 
      onClick={handleClick}
      className="inline-block"
      title={clickable ? 'Ver perfil' : ''}
    >
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={`Avatar de ${nombres} ${apellidoPaterno}`}
          className={`${baseClasses} border-2 border-white shadow-md`}
          onError={(e) => {
            console.error('Error al cargar imagen:', fotoUrl);
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div 
          className={`
            ${baseClasses} 
            bg-gradient-to-br from-blue-500 to-purple-600 
            text-white font-bold 
            flex items-center justify-center 
            border-2 border-white shadow-md
          `}
        >
          {getIniciales()}
        </div>
      )}
    </div>
  );
};

export default Avatar;