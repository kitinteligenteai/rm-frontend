// Contenido COMPLETO y CORRECTO para: src/App.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Página de Inicio (Landing)</h1>
      <p className="text-lg text-gray-600 mb-8">
        Esta es la página principal de la aplicación.
      </p>
      <Link 
        to="/plataforma" 
        className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 transition-colors"
      >
        Ir a la Plataforma
      </Link>
    </div>
  );
}

export default App; // <-- LA LÍNEA CLAVE QUE FALTABA
