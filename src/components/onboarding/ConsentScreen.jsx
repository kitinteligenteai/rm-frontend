// src/components/onboarding/ConsentScreen.jsx (VERSIÓN FINAL CORREGIDA)
import React, { useState } from 'react';
import { Shield, Leaf, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const ConsentScreen = ({ onComplete }) => {
  const [hasConsented, setHasConsented] = useState(false);

  const conditions = [
    'Diabetes (Tipo 1 o 2)',
    'Enfermedad del riñón, hígado o páncreas',
    'Enfermedades cardiovasculares (ej. hipertensión, insuficiencia cardíaca)',
    'Estás embarazada o en período de lactancia',
    'Tienes un historial de trastornos alimentarios'
  ];

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="max-w-3xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-medium flex items-center justify-center">
              <div className="relative">
                <Shield className="w-10 h-10 text-primary-600" />
                <Leaf className="w-5 h-5 text-secondary-500 absolute -bottom-1 -right-1" />
              </div>
            </div>
          </div>
          <h1 className="font-display text-display text-neutral-800 mb-4">
            Consulta Médica: Cuándo es Indispensable
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-soft mb-8">
          <p className="text-body text-neutral-700 leading-relaxed mb-6">
            Nuestra filosofía ha demostrado ser muy beneficiosa para condiciones como la Prediabetes y la Resistencia a la Insulina. Sin embargo, realizar un cambio en tu alimentación cuando tienes una condición de salud preexistente siempre debe hacerse con responsabilidad.
          </p>

          <div className="bg-secondary-50 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-secondary-600 mr-2" />
              <h3 className="font-medium text-neutral-800">Condiciones que requieren supervisión médica:</h3>
            </div>
            <ul className="space-y-2">
              {conditions.map((condition, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-neutral-700">{condition}</span>
                </li>
              ))}
            </ul>
          </div>

          <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-lg transition-colors hover:bg-primary-50">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-1 w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            />
            <span className="text-body text-neutral-700 leading-relaxed">
              Confirmo que estoy en buen estado de salud o, si tengo alguna de las condiciones mencionadas, me comprometo a realizar este plan bajo la estricta supervisión de mi médico. Acepto usar esta aplicación bajo mi propia responsabilidad.
            </span>
          </label>
        </div>

        <div className="text-center">
          <Button
            onClick={onComplete}
            variant={hasConsented ? "primary" : "disabled"}
            size="large"
            className="px-12 py-4"
            disabled={!hasConsented}
          >
            Empezar mi Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentScreen;
