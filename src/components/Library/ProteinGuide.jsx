// Contenido COMPLETO para: src/components/library/ProteinGuide.jsx

import React from 'react';

// Usamos la misma base de datos que la calculadora para mantener la consistencia.
const proteinSources = [
  { name: 'Pechuga de Pollo (100g cocida)', protein: 30 },
  { name: 'Bistec de Res (100g cocido)', protein: 29 },
  { name: 'Filete de Salmón (100g cocido)', protein: 25 },
  { name: 'Lata de Atún en agua (drenada)', protein: 28 },
  { name: 'Huevo grande', protein: 7 },
  { name: 'Queso Manchego/Cheddar (30g)', protein: 7 },
  { name: 'Yogur Griego natural (100g)', protein: 10 },
  { name: 'Lentejas cocidas (1 taza)', protein: 18 },
  { name: 'Puñado de Almendras (30g)', protein: 6 },
];

const ProteinGuide = () => {
  return (
    <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg">
      <h3 className="text-2xl font-bold mb-4">Guía Rápida de Proteína</h3>
      <p className="text-gray-300 mb-6">
        Usa esta tabla como referencia rápida para estimar tu ingesta diaria. Los valores son aproximados.
      </p>
      <div className="flow-root">
        <ul className="-my-4 divide-y divide-gray-700">
          {proteinSources.map((source, index) => (
            <li key={index} className="flex items-center justify-between py-4">
              <p className="text-base font-medium text-gray-100">{source.name}</p>
              <p className="text-lg font-semibold text-teal-400">{source.protein}g</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProteinGuide;
