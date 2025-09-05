// src/components/education/PhilosophyView.jsx
import React from 'react';
import { philosophyContent } from '../../data/educationalContent';

const PhilosophyView = () => {
  return (
    <div className="p-6">
      <h2 className="font-display text-display text-neutral-800 mb-2">Filosofía</h2>
      <p className="text-body text-neutral-600 mb-8">Los principios fundamentales de nuestro enfoque.</p>
      <div className="space-y-4">
        {philosophyContent.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-soft">
            <h3 className="font-display text-title text-neutral-800 mb-2">{item.icon} {item.title}</h3>
            <p className="text-body text-neutral-700 whitespace-pre-line">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PhilosophyView;
