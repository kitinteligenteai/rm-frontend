// Contenido COMPLETO para: src/pages/Principios.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { principles } from '../data/principlesData'; // <-- Importamos nuestros datos
import { FiArrowRight } from 'react-icons/fi';

// Este es el componente para cada tarjeta individual
const PrincipioCard = ({ id, title, subtitle }) => {
  // NOTA: Por ahora, el Link no lleva a una página de detalle funcional.
  // Lo implementaremos en el siguiente paso.
  return (
    <Link 
      to={`/plataforma/principio/${id}`} // <-- Enlace dinámico futuro
      className="block bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 group"
    >
      <span className="text-sm font-bold text-teal-600">Principio #{id}</span>
      <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{subtitle}</p>
      <div className="flex items-center text-orange-500 font-semibold text-sm">
        Leer más
        <FiArrowRight className="ml-2 transform transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};


const Principios = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-full">
      <div className="text-left mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Los 10 Principios Fundamentales</h1>
        <p className="text-lg text-gray-500 mt-2 max-w-3xl">
          Estos son los pilares de nuestra filosofía. Comprenderlos no solo te dará el 'qué', sino el 'porqué' de cada paso que darás en tu transformación.
        </p>
      </div>

      {/* La cuadrícula que muestra todos los principios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {principles.map(principle => (
          <PrincipioCard 
            key={principle.id}
            id={principle.id}
            title={principle.title}
            subtitle={principle.subtitle}
          />
        ))}
      </div>
    </div>
  );
};

export default Principios;
