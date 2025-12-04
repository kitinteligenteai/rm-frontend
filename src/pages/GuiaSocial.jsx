// src/pages/GuiaSocial.jsx (Nuevo Módulo - Escudo Social)
import React, { useState } from 'react';
import { MapPin, CheckCircle2, XCircle, Utensils, Beer, PartyPopper, Fish } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'tacos',
    title: 'Tacos y Asados',
    icon: Utensils,
    color: 'orange',
    strategy: "La taquería es tu amiga si sabes pedir. La grasa es energía, la harina es el enemigo.",
    do: [
      "Pide tacos de Bistec, Costilla, Sirloin o Chicharrón.",
      "Pídelos con costra de queso (si tienen) o en hoja de lechuga.",
      "Usa mucha salsa, limón y cebolla.",
      "Si comes tortilla: Máximo 2, y mejor si son de maíz (no harina)."
    ],
    dont: [
      "Tacos al Pastor (la carne suele tener azúcar en el adobo).",
      "Gringas con tortilla de harina.",
      "Agua de Horchata (bomba de azúcar).",
      "Papas asadas o frijoles charros (moderación)."
    ]
  },
  {
    id: 'sushi',
    title: 'Sushi / Japonés',
    icon: Fish,
    color: 'indigo',
    strategy: "El arroz es puro azúcar para tu sangre. Enfócate en el pescado y los vegetales.",
    do: [
      "Sashimi (cortes de pescado) sin límite.",
      "Rollos envueltos en pepino (sin arroz).",
      "Edamames (frijol de soya) con sal.",
      "Tepanyaki de carne/pollo/verduras (pide poca salsa dulce).",
      "Lleva tus propios aminos de coco o pide soya baja en sodio."
    ],
    dont: [
      "Rollos empanizados (Tempura).",
      "Salsa de Anguila (es pura azúcar).",
      "Aderezo Tampico (mayonesa barata con azúcar).",
      "Arroz frito (Gohan/Yakimeshi)."
    ]
  },
  {
    id: 'fiesta',
    title: 'Fiestas y Alcohol',
    icon: Beer,
    color: 'purple',
    strategy: "El alcohol pausa la quema de grasa. Bebe inteligentemente y no mezcles con azúcar.",
    do: [
      "Tequila, Mezcal, Vodka o Whisky (Derechos o en las rocas).",
      "Mezclador: Solo Agua Mineral y mucho limón.",
      "Vino Tinto Seco (1-2 copas).",
      "Intercala cada copa de alcohol con un vaso de agua."
    ],
    dont: [
      "Cerveza (es pan líquido).",
      "Cubas (refresco de cola).",
      "Coctelería dulce (Margaritas, Piñas Coladas).",
      "Comer pizza o pastel 'porque ya rompí la dieta'."
    ]
  }
];

export default function GuiaSocial() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);

  return (
    <div className="p-6 md:p-10 pb-24 min-h-screen bg-slate-950 text-white animate-in fade-in">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <PartyPopper className="text-teal-400" /> Escudo Social
        </h1>
        <p className="text-slate-400">Sobrevive al fin de semana sin romper tu metabolismo.</p>
      </div>

      {/* Selector de Escenario */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {SCENARIOS.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => setActiveScenario(scenario)}
            className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeScenario.id === scenario.id 
                ? `bg-${scenario.color}-600 text-white shadow-lg scale-105` 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <scenario.icon size={18} /> {scenario.title}
          </button>
        ))}
      </div>

      {/* Tarjeta de Estrategia */}
      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className={`bg-${activeScenario.color}-900/30 p-6 border-b border-slate-800`}>
          <h2 className="text-2xl font-bold text-white mb-2">{activeScenario.title}</h2>
          <p className="text-slate-300 italic">"{activeScenario.strategy}"</p>
        </div>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">
          {/* COLUMNA SÍ */}
          <div className="p-6 bg-emerald-900/10">
            <h3 className="flex items-center gap-2 text-emerald-400 font-bold mb-4 uppercase tracking-wider text-sm">
              <CheckCircle2 size={18} /> Pide Esto
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
              <XCircle size={18} /> Evita Esto
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