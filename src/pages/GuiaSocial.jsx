// src/pages/GuiaSocial.jsx (Nuevo Módulo - Escudo Social)
import React, { useState } from 'react';
import { MapPin, CheckCircle2, XCircle, Utensils, Beer, PartyPopper, Fish } from 'lucide-react';

const SCENARIOS = [{"id": "tacos", "title": "Tacos y asados", "icon": Utensils, "color": "orange", "strategy": "Puedes organizar una comida satisfactoria sin prohibiciones universales.", "do": ["Elige una fuente de proteína y añade verduras o nopales.", "Incluye tortillas o legumbres según tus necesidades y tu plan.", "Prefiere agua simple y salsas en cantidades que toleres."], "dont": ["No necesitas sustituir siempre la tortilla por queso.", "Evita pedir porciones mayores solo por ser alimentos sin harina."]}, {"id": "sushi", "title": "Comida japonesa", "icon": Fish, "color": "indigo", "strategy": "El arroz puede formar parte de tu comida. Observa porciones y acompañamientos.", "do": ["Combina pescado bien cocido, verduras y una porción de arroz.", "Pide salsas aparte si deseas moderar azúcar o sodio.", "En embarazo o inmunosupresión evita pescado crudo y pide orientación."], "dont": ["No uses cantidades ilimitadas de sashimi como regla.", "No añadas sal para compensar carbohidratos."]}, {"id": "fiesta", "title": "Fiestas y bebidas", "icon": Beer, "color": "purple", "strategy": "Puedes disfrutar una reunión sin beber alcohol. Menos alcohol reduce riesgos.", "do": ["Elige bebidas sin alcohol y sin exceso de azúcar.", "Come normalmente; no llegues tras un ayuno para compensar.", "Retoma tu comida habitual después del evento."], "dont": ["No se recomienda empezar a beber por salud.", "Evita alcohol en embarazo, si vas a conducir o si tu tratamiento o enfermedad lo contraindica.", "No consideres seguros los destilados por no contener azúcar."]}];

export default function GuiaSocial() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);

  return (
    <div className="p-6 md:p-10 pb-24 min-h-screen bg-slate-950 text-white animate-in fade-in">

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <PartyPopper className="text-teal-400" /> Escudo Social
        </h1>
        <p className="text-slate-400">Opciones prácticas para comer fuera de casa.</p>
      </div>

      {/* Selector de Escenario */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {SCENARIOS.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => setActiveScenario(scenario)}
            className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeScenario.id === scenario.id
                ? 'bg-teal-700 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <scenario.icon size={18} /> {scenario.title}
          </button>
        ))}
      </div>

      {/* Tarjeta de Estrategia */}
      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className={"bg-teal-950 p-6 border-b border-slate-800"}>
          <h2 className="text-2xl font-bold text-white mb-2">{activeScenario.title}</h2>
          <p className="text-slate-300 italic">"{activeScenario.strategy}"</p>
        </div>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">
          {/* COLUMNA SÍ */}
          <div className="p-6 bg-emerald-900/10">
            <h3 className="flex items-center gap-2 text-emerald-400 font-bold mb-4 uppercase tracking-wider text-sm">
              <CheckCircle2 size={18} /> Opciones útiles
            </h3>
            <ul className="space-y-3">
              {activeScenario.do.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA NO */}
          <div className="p-6 bg-red-900/10">
            <h3 className="flex items-center gap-2 text-red-400 font-bold mb-4 uppercase tracking-wider text-sm">
              <XCircle size={18} /> Precauciones
            </h3>
            <ul className="space-y-3">
              {activeScenario.dont.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
