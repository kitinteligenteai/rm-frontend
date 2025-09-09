import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const mockChartData = [
  { name: "D-6", pv: 86.5 }, { name: "D-5", pv: 86.2 }, { name: "D-4", pv: 86.0 },
  { name: "D-3", pv: 85.9 }, { name: "D-2", pv: 85.8 }, { name: "D-1", pv: 85.9 }, { name: "Hoy", pv: 85.8 },
];

const ProgresoCard = ({ data }) => {
  return (
    <div className="bg-slate-800/70 border border-slate-700 p-6 rounded-2xl shadow-xl h-full flex flex-col">
      <h3 className="font-bold text-xl mb-4 text-white">Tu Progreso</h3>
      <div className="flex-grow h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} domain={["dataMin - 0.5", "dataMax + 0.5"]} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "rgba(30,41,59,0.9)", backdropFilter: "blur(4px)", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.3)", color: "#e2e8f0" }} />
            <Line type="monotone" dataKey="pv" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 4, fill: "#22d3ee", stroke: "#0f172a" }} activeDot={{ r: 6, fill: "#22d3ee" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-white">{data.currentValue} kg</p>
        <p className={`text-sm font-semibold flex items-center justify-center ${data.delta7d < 0 ? "text-emerald-400" : "text-red-400"}`}>
          <TrendingUp className="w-4 h-4 mr-1" /> {Math.abs(data.delta7d)} kg en los últimos 7 días
        </p>
      </div>
    </div>
  );
};

export default ProgresoCard;
