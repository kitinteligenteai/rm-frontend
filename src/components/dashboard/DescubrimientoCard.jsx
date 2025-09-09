import React from "react";
import { BookOpen } from "lucide-react";

const DescubrimientoCard = ({ data }) => {
  return (
    <div className="bg-slate-800/70 border border-slate-700 rounded-2xl shadow-xl h-full flex flex-col overflow-hidden group">
      <div className="overflow-hidden"><img src={data.payload.image} alt={data.payload.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" /></div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="font-bold text-xl mb-2 text-white">{data.payload.title}</h3>
        <p className="text-slate-400 text-sm flex-grow">Una opción deliciosa y alineada con tus objetivos de hoy.</p>
        <button className="mt-4 w-full bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 font-semibold py-2.5 px-4 rounded-xl hover:bg-cyan-500/30 hover:text-cyan-200 transition-all flex items-center justify-center">
          <BookOpen className="w-4 h-4 mr-2" /> Ver Receta
        </button>
      </div>
    </div>
  );
};

export default DescubrimientoCard;
