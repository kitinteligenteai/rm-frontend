// Contenido COMPLETO Y FINAL para: src/components/ui/PlantillaComidaCard.jsx

import React from 'react';
import { CheckCircle } from 'lucide-react'; // Asegúrese de tener lucide-react instalado: npm install lucide-react

const PlantillaComidaCard = ({ title, description, items }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 h-full">
      <h3 className="text-xl font-serif text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="h-5 w-5 text-[#6B8E23] mr-3 flex-shrink-0" />
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlantillaComidaCard;
