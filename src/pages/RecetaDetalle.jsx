// Contenido COMPLETO y VERIFICADO para: src/pages/RecetaDetalle.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // RUTA VERIFICADA
import { FiArrowLeft, FiClock, FiUsers } from 'react-icons/fi';
import LoadingSkeleton from '../components/common/LoadingSkeleton'; // RUTA VERIFICADA

const RecetaDetalle = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('No se pudo cargar la receta.');
        console.error('Error fetching recipe:', error);
      } else {
        setRecipe(data);
      }
      setLoading(false);
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return <div className="p-8"><LoadingSkeleton /></div>;
  }

  if (error || !recipe) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold">{error || 'Receta no encontrada'}</h1>
        <Link to="/plataforma/boveda-recetas" className="text-teal-600 hover:underline mt-4 inline-block">
          Volver a la Bóveda de Recetas
        </Link>
      </div>
    );
  }

  return (
    <div className="main-content p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/plataforma/boveda-recetas" 
          className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-800 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Volver a todas las recetas
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <img src={recipe.image_url} alt={recipe.name} className="w-full h-64 object-cover" />
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{recipe.name}</h1>
            <p className="text-gray-600 mt-2">{recipe.description}</p>

            <div className="flex items-center space-x-6 mt-6 text-gray-500">
              <div className="flex items-center">
                <FiClock className="mr-2" />
                <span>{recipe.time}</span>
              </div>
              <div className="flex items-center">
                <FiUsers className="mr-2" />
                <span>{recipe.servings}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <h2 className="text-xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2 mb-4">Ingredientes</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 border-b-2 border-teal-500 pb-2 mb-4">Instrucciones</h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  {recipe.instructions && recipe.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecetaDetalle;
