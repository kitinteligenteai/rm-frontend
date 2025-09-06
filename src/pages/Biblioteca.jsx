// Contenido COMPLETO, CORREGIDO Y REDISEÑADO para: src/pages/Biblioteca.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

// 1. CORRECCIÓN: Importamos 'principles' que es el nombre correcto de la variable exportada.
import { principles } from '../data/principlesData.js'; 
import ProteinCalculator from '../components/Library/ProteinCalculator';

const Biblioteca = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-serif text-gray-800 mb-2">Biblioteca del Conocimiento</h1>
      <p className="text-lg text-gray-600 mb-10">
        Explora los pilares fundamentales del reinicio metabólico y utiliza nuestras herramientas para potenciar tu viaje.
      </p>

      <div className="flex flex-col md:flex-row gap-12">

        {/* --- COLUMNA PRINCIPAL (Contenido) --- */}
        <div className="w-full md:w-2/3">
          <h2 className="text-3xl font-serif text-gray-700 mb-6">Los 10 Principios Fundamentales</h2>
          <div className="w-full space-y-3">
            {principles.map((principio) => (
              <Disclosure as="div" key={principio.id}>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-white shadow-sm border border-gray-200 px-5 py-4 text-left text-lg font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-teal-500 focus-visible:ring-opacity-75 transition-all">
                      <span className="flex-1">{principio.title}</span>
                      <ChevronUpIcon
                        className={`${
                          open ? 'rotate-180 transform' : ''
                        } h-6 w-6 text-teal-600 transition-transform ml-4`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-5 pt-4 pb-5 text-base text-gray-700 bg-white rounded-b-lg -mt-1 border-x border-b border-gray-200">
                      <p className="mb-4 italic text-gray-500">{principio.subtitle}</p>
                      {/* 2. CORRECCIÓN: Usamos dangerouslySetInnerHTML para renderizar el HTML del contenido. */}
                      <div 
                        className="prose max-w-none" 
                        dangerouslySetInnerHTML={{ __html: principio.content }} 
                      />
                      {/* El Link a la página de detalle se puede reactivar en el futuro */}
                      {/* 
                      <Link 
                        to={`/plataforma/principios/${principio.id}`} 
                        className="font-semibold text-teal-600 hover:text-teal-800 transition-colors mt-4 inline-block"
                      >
                        Ver en página completa →
                      </Link>
                      */}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </div>

        {/* --- COLUMNA LATERAL (Herramientas) --- */}
        <div className="w-full md:w-1/3">
          <div className="sticky top-8">
            <h2 className="text-3xl font-serif text-gray-700 mb-6">Herramientas</h2>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-xl font-serif text-gray-800 mb-4">Asesor Proteico Personalizado</h3>
              <ProteinCalculator />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Biblioteca;
