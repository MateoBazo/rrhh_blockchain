// file: src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">
            🎯 Sistema RRHH Blockchain
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link to="/registro">
              <Button variant="primary">Registrarse</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gestión de Recursos Humanos
            <span className="block text-blue-600 mt-2">con Blockchain</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plataforma segura y transparente para conectar empresas con talento.
            Verificación de credenciales, historial laboral inmutable y proceso
            de contratación simplificado.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/registro">
              <Button variant="primary" className="text-lg px-8 py-3">
                Comenzar Gratis
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="text-lg px-8 py-3">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-2">Seguridad Blockchain</h3>
            <p className="text-gray-600">
              Datos verificables e inmutables almacenados en blockchain
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Para Candidatos</h3>
            <p className="text-gray-600">
              Perfil profesional verificado, CV digital y referencias validadas
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-bold mb-2">Para Empresas</h3>
            <p className="text-gray-600">
              Contratación rápida con verificación automática de antecedentes
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2025 Sistema RRHH Blockchain. Todos los derechos reservados.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/terminos" className="hover:text-blue-600">
              Términos de Servicio
            </Link>
            <Link to="/privacidad" className="hover:text-blue-600">
              Política de Privacidad
            </Link>
            <Link to="/contacto" className="hover:text-blue-600">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}