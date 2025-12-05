// src/components/tools/AsesorProteico.jsx (v4.0 - Guía Integrada)
import React, { useState, useMemo } from 'react';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';

const AsesorProteico = () => {
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState('sedentary');
  const [showResult, setShowResult] = useState(false);
  const [showGuide, setShowGuide] = useState(false); // Toggle para la guía

  const proteinTarget = useMemo(() => {
    const heightInMeters = height / 100;
    let idealWeight = (gender === 'male') ? (height - 100) * 0.9 : (height - 100) * 0.85;
    let multiplier = 1.8; // Base
    if (activity === 'moderate') multiplier = 2.2;
    if (activity === 'intense') multiplier = 2.4;
    return Math.round(idealWeight * multiplier);
  }, [gender, height, activity]);

  const handleSubmit = (e) => { e.preventDefault(); setShowResult(true); };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Asesor Proteico</h3>
      <p className="text-slate-500 text-sm mb-6">Calcula tu requerimiento diario.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">1. Género</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg border ${gender === 'male' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600'}`}>Hombre</button>
            <button type="button" onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg border ${gender === 'female' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600'}`}>Mujer</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">2. Altura: <span className="text-teal-600">{height} cm</span></label>
          <input type="range" min="140" max="200" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg accent-teal-600" />
        </div>
        <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600">Calcular</button>
      </form>

      {showResult && (
        <div className="mt-8 pt-6 border-t border-dashed">
          <p className="text-center text-slate-500 text-sm">Tu objetivo diario:</p>
          <p className="text-5xl font-black text-teal-600 text-center my-2">{proteinTarget}g</p>
          
          <div className="mt-4 bg-slate-100 rounded-xl p-4">
             <button onClick={() => setShowGuide(!showGuide)} className="flex items-center justify-between w-full text-slate-700 font-bold text-sm">
                <span>{showGuide ? 'Ocultar' : 'Ver'} Equivalencias</span>
                {showGuide ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
             </button>
             
             {/* GUÍA VISUAL DESPLEGABLE */}
             {showGuide && (
                <ul className="mt-3 space-y-2 text-sm text-slate-600 border-t border-slate-200 pt-2">
                    <li className="flex justify-between"><span>🥚 1 Huevo</span> <span>7g</span></li>
                    <li className="flex justify-between"><span>🍗 100g Pollo</span> <span>30g</span></li>
                    <li className="flex justify-between"><span>🥩 100g Res</span> <span>26g</span></li>
                    <li className="flex justify-between"><span>🐟 1 Lata Atún</span> <span>24g</span></li>
                    <li className="flex justify-between"><span>🥜 30g Nueces</span> <span>6g</span></li>
                </ul>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AsesorProteico;