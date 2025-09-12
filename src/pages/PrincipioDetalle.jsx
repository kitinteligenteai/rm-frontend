// Contenido COMPLETO para: src/pages/PrincipioDetalle.jsx

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { principles } from '../data/principlesData';
import { FiArrowLeft } from 'react-icons/fi';

const PrincipioDetalle = () => {
  // 1. Leer el 'id' de la URL (ej: si la URL es /principio/3, id será "3")
  const { id } = useParams();

  // 2. Encontrar el principio correspondiente en nuestros datos 
  // Usamos '==' porque el id de la URL es un string, y nuestro id en los datos es un número.
  const principle = principles.find(p => p.id == id);

  // 3. ¿Qué pasa si el usuario pone una URL inválida? (ej: /principio/99)
  if (!principle) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold">Principio no encontrado</h1>
        <Link to="/plataforma/principios" className="text-teal-600 hover:underline mt-4 inline-block">
          Volver a la lista de principios
        </Link>
      </div>
    );
  }

  // 4. Si encontramos el principio, lo mostramos
  return (
    <div className="main-content p-4 md:p-8 lg:p-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-10">
        
        {/* Botón para volver atrás */}
        <Link 
          to="/plataforma/principios" 
          className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-800 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Volver a todos los principios
        </Link>

        {/* Encabezado del Artículo */}
        <span className="text-sm font-bold text-orange-500">Principio #{principle.id}</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">{principle.title}</h1>
        <p className="text-lg text-gray-500 mt-3 mb-8 border-b pb-6">{principle.subtitle}</p>

        {/* Contenido del Artículo */}
        {/* 'dangerouslySetInnerHTML' es la forma en React de renderizar un string que contiene HTML.
            Es seguro en este caso porque el HTML lo hemos escrito nosotros mismos en principlesData.js */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: principle.content }} 
        />

      </div>
    </div>
  );
};

export default PrincipioDetalle;
