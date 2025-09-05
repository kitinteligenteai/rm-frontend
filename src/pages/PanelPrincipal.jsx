// Contenido COMPLETO Y ACTUALIZADO para: src/pages/PanelPrincipal.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const PanelPrincipal = () => {
  const { user } = useUser();
  // Se mantiene la lógica para obtener el nombre, pero se capitaliza para un toque más limpio.
  const getFirstName = () => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) {
      const name = fullName.split(' ')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    const emailName = user?.email?.split('@')[0];
    if (emailName) {
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Hola'; // Un saludo neutral si no hay nombre
  };

  const userName = getFirstName();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-serif text-gray-800 mb-2">
        ¡Hola, {userName}! Bienvenido de nuevo.
      </h1>
      <p className="text-lg text-gray-600 mb-10">
        Tu viaje de transformación continúa. Elige cómo quieres avanzar hoy.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Camino A: Guía Esencial */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 flex flex-col">
          <h2 className="text-2xl font-serif text-gray-800 mb-3">La Guía Esencial</h2>
          <p className="text-gray-600 mb-6 flex-grow">
            Para cuando necesitas velocidad y no quieres pensar. Sigue plantillas simples, come comida real y obtén resultados sin complicaciones. Es tu camino directo al éxito.
          </p>
          <Link to="/plataforma/guia-esencial" className="text-center bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors">
            Empezar Ahora
          </Link>
        </div>

        {/* Camino B: Planeador Inteligente */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 flex flex-col">
          <h2 className="text-2xl font-serif text-gray-800 mb-3">El Planeador Inteligente</h2>
          <p className="text-gray-600 mb-6 flex-grow">
            Para cuando buscas inspiración y quieres explorar. Descubre nuevas recetas, personaliza tu menú semanal y genera tu lista de súper a medida con un solo clic.
          </p>
          <Link to="/plataforma/planeador" className="text-center bg-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors">
            Explorar Recetas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PanelPrincipal;
