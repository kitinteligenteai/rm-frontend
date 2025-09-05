// RUTA: src/components/evaluation/MetabolicImpactAssessor.jsx
// ESTADO: HOTFIX v1 - Contador de Preguntas Corregido

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  { id: 'energy', text: '¿Cómo describirías tus niveles de energía durante la tarde (2-5 PM)?', options: [ { text: 'Bajos, casi siempre necesito un café o siesta', value: 1 }, { text: 'Siento un bajón notable, pero sigo funcionando', value: 2 }, { text: 'Son estables, pero no particularmente altos', value: 3 }, { text: 'Generalmente altos y estables', value: 4 } ] },
  { id: 'cravings', text: '¿Con qué frecuencia sientes antojos intensos por alimentos dulces o harinas?', options: [ { text: 'Varias veces al día', value: 1 }, { text: 'Una vez al día, usualmente después de comer', value: 2 }, { text: 'Algunas veces por semana', value: 3 }, { text: 'Rara vez o nunca', value: 4 } ] },
  { id: 'inflammation', text: '¿Con qué frecuencia experimentas hinchazón abdominal, gases o digestión pesada?', options: [ { text: 'Casi todos los días', value: 1 }, { text: 'Varias veces por semana', value: 2 }, { text: 'Ocasionalmente, después de ciertas comidas', value: 3 }, { text: 'Casi nunca', value: 4 } ] },
];

const MetabolicImpactAssessor = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        const totalScore = Object.values(newAnswers).reduce((sum, val) => sum + val, 0);
        setScore(totalScore);
        onComplete();
      }
    }, 300);
  };

  const getResultContent = () => {
    if (score === null) return null;
    if (score <= 5) {
      return { title: 'Motor Metabólico: En Modo Ahorro de Energía', icon: '🔋', description: "Tus respuestas sugieren que tu sistema está operando en un modo de 'ahorro de energía'. Esto explica la fatiga y los antojos. Estás en el lugar perfecto para iniciar el reinicio y recargar tu motor." };
    }
    if (score <= 9) {
      return { title: 'Motor Metabólico: Con Frenos Activos', icon: '🚗💨', description: "Tienes una base funcional, pero es como si estuvieras conduciendo con el freno de mano puesto. Hay procesos que probablemente te impiden alcanzar tu verdadero potencial. Quitar esos frenos es el siguiente paso lógico." };
    }
    return { title: 'Motor Metabólico: Listo para la Optimización', icon: '🚀', description: "Tus hábitos son sólidos. Tu motor funciona bien, pero aún no está en su máxima potencia. Estás en la posición ideal para aplicar protocolos de optimización para llevar tu energía y rendimiento al siguiente nivel." };
  };

  const result = getResultContent();

  return (
    <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
      <AnimatePresence mode="wait">
        {score === null ? (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Paso 1: Evaluador de Impacto Metabólico</h3>
              <p className="text-sm text-gray-500 mt-1">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
            </div>
            <p className="text-lg font-semibold mb-6 text-center">{questions[currentQuestionIndex].text}</p>
            <div className="space-y-3">
              {questions[currentQuestionIndex].options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(questions[currentQuestionIndex].id, option.value)}
                  className="w-full text-left p-4 bg-gray-100 rounded-lg hover:bg-[#e0f2fe] hover:border-[#00838F] border-2 border-transparent transition-all"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <span className="text-5xl" role="img">{result.icon}</span>
            <h3 className="text-2xl font-bold text-[#00838F] mt-4">{result.title}</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">{result.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MetabolicImpactAssessor;
