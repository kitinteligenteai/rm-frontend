import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Check } from "lucide-react";

const PlanHoyCard = ({ data }) => {
  const [checklist, setChecklist] = useState(data.checklist);

  const handleCheck = (id) => {
    setChecklist(checklist.map((item) => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800/70 border border-slate-700 p-6 rounded-2xl shadow-2xl shadow-cyan-500/5 hover:shadow-cyan-500/10 transition-shadow duration-300">
      <h3 className="font-bold text-xl mb-4 text-white">Tu Plan de Hoy</h3>
      <div className="bg-slate-800/80 p-4 rounded-lg mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-cyan-300 flex items-center"><Dumbbell className="w-4 h-4 mr-2" />{data.entrenamiento.title}</p>
            <p className="text-sm text-slate-400">Duración estimada: {data.entrenamiento.duration} min</p>
          </div>
          <button className="bg-cyan-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-cyan-500 transition-all hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95">Comenzar</button>
        </div>
      </div>
      <ul className="space-y-3">
        {checklist.map((item) => (
          <li key={item.id} onClick={() => handleCheck(item.id)} className="flex items-center cursor-pointer group p-1 -m-1 rounded-md hover:bg-slate-800/50 transition-colors">
            <motion.div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-3 transition-colors ${item.done ? "bg-cyan-500 border-cyan-500" : "border-slate-600 group-hover:border-cyan-500"}`}>
              {item.done && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-4 h-4 text-white" /></motion.div>}
            </motion.div>
            <span className={`transition-colors ${item.done ? "line-through text-slate-500" : "text-slate-300 group-hover:text-white"}`}>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanHoyCard;
