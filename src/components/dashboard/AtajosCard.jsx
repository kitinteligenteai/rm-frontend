import React from "react";
import { Calendar, UtensilsCrossed, Dumbbell, BookHeart } from "lucide-react";

const atajos = [
  { name: "Planeador", icon: Calendar, path: "/plataforma/planeador" },
  { name: "Bóveda", icon: UtensilsCrossed, path: "/plataforma/boveda-recetas" },
  { name: "Gimnasio", icon: Dumbbell, path: "/plataforma/gimnasio" },
  { name: "Bitácora", icon: BookHeart, path: "/plataforma/bitacora" },
];

const AtajosCard = () => {
  return (
    <div className="bg-slate-800/70 border border-slate-700 p-6 rounded-2xl shadow-xl">
      <h3 className="font-bold text-xl mb-4 text-white">Atajos</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {atajos.map((atajo) => (
          <a key={atajo.name} href={atajo.path} className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 hover:shadow-lg hover:shadow-emerald-400/10 transition-all group transform hover:-translate-y-1">
            <atajo.icon className="w-8 h-8 text-emerald-400 mb-2 transition-transform group-hover:scale-110" />
            <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{atajo.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default AtajosCard;
