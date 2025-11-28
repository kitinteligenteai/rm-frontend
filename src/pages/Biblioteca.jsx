// src/pages/Biblioteca.jsx (v2.0 - Híbrida: Filosofía + Ciencia + Herramientas)
import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUp, BookOpen, Zap, Brain } from 'lucide-react';

// 1. Importamos AMBAS fuentes de datos (Filosofía y Ciencia)
import { philosophyContent } from '../data/educationalContent';
import { principles } from '../data/principlesData';

// 2. Importamos la Herramienta Premium
import AsesorProteico from '../components/tools/AsesorProteico'; // Asegúrate que la ruta coincida con donde tienes el nuevo asesor

const Biblioteca = () => {
  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 pb-24">
      
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Centro de Conocimiento
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          No solo te decimos qué comer. Te enseñamos cómo funciona tu cuerpo para que nunca más necesites otra dieta.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* --- COLUMNA IZQUIERDA: CONTENIDO (2/3) --- */}
        <div className="w-full lg:w-2/3 space-y-12">
          
          {/* SECCIÓN 1: NUESTRA FILOSOFÍA (Lectura Rápida) */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-teal-400" />
              <h2 className="text-2xl font-bold text-white">Filosofía del Reinicio</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {philosophyContent.map((item) => (
                <div key={item.id} className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl hover:border-teal-500/30 transition-colors">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-4 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 2: PRINCIPIOS CIENTÍFICOS (Lectura Profunda) */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Los 10 Pilares Científicos</h2>
            </div>
            <div className="space-y-3">
              {principles.map((principio) => (
                <Disclosure as="div" key={principio.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full justify-between items-center px-6 py-4 text-left hover:bg-slate-700/50 transition-colors focus:outline-none">
                        <div>
                          <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">Principio #{principio.id}</span>
                          <h3 className="text-lg font-medium text-slate-200 mt-1">{principio.title}</h3>
                        </div>
                        <ChevronUp className={`${open ? 'rotate-180' : ''} h-5 w-5 text-slate-400 transition-transform`} />
                      </Disclosure.Button>
                      
                      <Disclosure.Panel className="px-6 pb-6 pt-2 bg-slate-800/80 border-t border-slate-700/50">
                        <p className="text-indigo-300 font-medium mb-4 italic text-sm">{principio.subtitle}</p>
                        <div 
                          className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed" 
                          dangerouslySetInnerHTML={{ __html: principio.content }} 
                        />
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))}
            </div>
          </section>

        </div>

        {/* --- COLUMNA DERECHA: HERRAMIENTAS (1/3) --- */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-6 space-y-6">
            
            {/* Widget: Calculadora de Proteína */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-1 overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 rounded-t-xl">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-lg"><BookOpen className="w-4 h-4" /></div>
                  Herramienta Exclusiva
                </h3>
              </div>
              {/* Aquí renderizamos el componente AsesorProteico que ya tienes */}
              <div className="bg-white rounded-b-xl">
                 <AsesorProteico />
              </div>
            </div>

            {/* Widget: Guía Rápida (Texto estático para rellenar) */}
            <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl">
              <h4 className="text-indigo-300 font-bold mb-2">💡 Tip de Estudio</h4>
              <p className="text-slate-400 text-sm">
                No intentes leer todo en un día. Lee un principio cada mañana y trata de aplicarlo durante el día. La educación es la base del cambio sostenible.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Biblioteca;