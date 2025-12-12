// src/components/tools/AsesorProteico.jsx (v6.0 - Connected to Planner)
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Activity, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const AsesorProteico = () => {
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState('sedentary'); 
  const [showResult, setShowResult] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const proteinTarget = useMemo(() => {
    const heightInMeters = height / 100;
    let idealWeight = (gender === 'male') ? (height - 100) * 0.9 : (height - 100) * 0.85;
    
    let multiplier = 1.6; 
    if (activity === 'light') multiplier = 1.8;
    if (activity === 'moderate') multiplier = 2.0;
    if (activity === 'intense') multiplier = 2.2;
    
    return Math.round(idealWeight * multiplier);
  }, [gender, height, activity]);

  const handleSubmit = (e) => { 
      e.preventDefault(); 
      setShowResult(true);
      
      // ✅ MAGIA: Guardamos la meta para que el Planeador la use
      localStorage.setItem('user_protein_goal', proteinTarget);
      setSavedMsg('Meta actualizada en tu Planeador');
      setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Asesor Proteico</h3>
      <p className="text-slate-500 text-sm mb-6">Calcula tu requerimiento exacto.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">1. Género</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg text-sm border ${gender === 'male' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600'}`}>Hombre</button>
            <button type="button" onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg text-sm border ${gender === 'female' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600'}`}>Mujer</button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">2. Altura: <span className="text-teal-600">{height} cm</span></label>
          <input type="range" min="140" max="200" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg accent-teal-600" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase flex items-center gap-1">
             <Activity size={14}/> 3. Actividad Física
          </label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none">
            <option value="sedentary">Sedentario (Oficina/Casa)</option>
            <option value="light">Ligera (Caminar 2-3 días)</option>
            <option value="moderate">Moderada (Gym 3-4 días)</option>
            <option value="intense">Intensa (Atleta/Trabajo físico)</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-md">
          Calcular Mi Objetivo
        </button>
      </form>

      {showResult && (
        <div className="mt-6 pt-6 border-t border-dashed animate-in fade-in">
          <p className="text-center text-slate-500 text-xs uppercase font-bold">Tu Meta Personalizada</p>
          <p className="text-5xl font-black text-teal-600 text-center my-2">{proteinTarget}g</p>
          
          {savedMsg && (
              <p className="text-center text-xs text-green-600 font-bold flex items-center justify-center gap-1 animate-pulse">
                  <Save size={12}/> {savedMsg}
              </p>
          )}

          <div className="mt-4 bg-slate-100 rounded-xl p-3">
             <button onClick={() => setShowGuide(!showGuide)} className="flex items-center justify-center w-full text-slate-600 font-bold text-xs hover:text-teal-600 transition-colors">
                <span>{showGuide ? 'Ocultar' : 'Ver'} Equivalencias</span>
                {showGuide ? <ChevronUp size={14} className="ml-1"/> : <ChevronDown size={14} className="ml-1"/>}
             </button>
             
             {showGuide && (
                <ul className="mt-3 space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-2 animate-in fade-in">
                    <li className="flex justify-between"><span>🥚 1 Huevo</span> <span>7g</span></li>
                    <li className="flex justify-between"><span>🍗 100g Pollo/Res</span> <span>~25-30g</span></li>
                    <li className="flex justify-between"><span>🐟 1 Lata Atún</span> <span>24g</span></li>
                    <li className="flex justify-between"><span>🥤 1 Scoop Whey</span> <span>20-25g</span></li>
                </ul>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AsesorProteico;