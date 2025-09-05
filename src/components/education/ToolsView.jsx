// src/components/education/ToolsView.jsx
import React from 'react';
import { toolsContent } from '../../data/educationalContent';
// Aquí iría la lógica de la calculadora si decidimos hacerla interactiva

const ToolsView = () => {
  return (
    <div className="p-6">
      <h2 className="font-display text-display text-neutral-800 mb-2">Herramientas</h2>
      <p className="text-body text-neutral-600 mb-8">Guías prácticas y recursos para tu día a día.</p>
      <div className="space-y-4">
        {toolsContent.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-soft">
            <h3 className="font-display text-title text-neutral-800 mb-2">{item.icon} {item.title}</h3>
            <p className="text-body text-neutral-700 whitespace-pre-line">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ToolsView;
