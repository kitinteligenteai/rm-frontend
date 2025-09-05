// Contenido COMPLETO Y FINAL para: src/pages/GuiaEsencial.jsx

import React from 'react';
import PrincipioMaestroCard from '../components/ui/PrincipioMaestroCard';
import PlantillaComidaCard from '../components/ui/PlantillaComidaCard';

const GuiaEsencial = () => {
  return (
    <div className="bg-[#FDFBF7] min-h-screen p-4 md:p-8 font-sans text-[#3a3a2e]">
      <div className="max-w-5xl mx-auto">
        
        <PrincipioMaestroCard />

        <div className="mt-12">
          <h2 className="text-3xl font-serif text-center text-gray-800 mb-8">Tus Plantillas de Comida</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <PlantillaComidaCard
              title="Desayuno y Cena: La Proteína Rápida"
              description="Elige una de estas opciones y acompáñala con todas las verduras que quieras. ¿Cuántos huevos? Los que te dejen satisfecho. La clave es la saciedad, no la restricción."
              items={['Huevos al gusto (3, 4... sin miedo)', 'Atún en aceite de oliva', 'Chorizo de cerdo de calidad', 'Tocino de cerdo sin azúcares']}
            />
            <PlantillaComidaCard
              title="Comida Principal: El Plato Fuerte"
              description="Elige un filete y sírvelo con una montaña de verduras y grasas buenas. ¿Te sientes con más hambre o vienes de entrenar? Un segundo filete es una opción válida. Prioriza la proteína."
              items={['Filete de Res', 'Pechuga de Pollo', 'Filete de Pescado', 'Lomo de Cerdo']}
            />
          </div>
        </div>

        <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center">
          <h3 className="text-2xl font-serif text-gray-800 mb-4">Tu Guía de Bebidas y Lista de Compras</h3>
          <p className="text-gray-600 mb-6">Completa tu guía con las bebidas que te hidratan sin inflamarte y descarga la lista de compras para tener siempre a la mano comida real.</p>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-2 bg-[#A0522D] text-white font-bold rounded-full hover:bg-[#8B4513] transition-colors">Ver Guía de Bebidas</button>
            <button className="px-6 py-2 bg-[#6B8E23] text-white font-bold rounded-full hover:bg-[#556B2F] transition-colors">Descargar Lista Esencial</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuiaEsencial;
