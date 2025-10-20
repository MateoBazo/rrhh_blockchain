import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="card max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            🎯 Sistema RRHH Blockchain
          </h1>
          <p className="text-gray-600 mb-6">
            Frontend configurado exitosamente con Vite + React + TailwindCSS
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="btn-primary">
              Botón Primario
            </button>
            <button className="btn-secondary">
              Botón Secundario
            </button>
            <button className="btn-danger">
              Botón Peligro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;