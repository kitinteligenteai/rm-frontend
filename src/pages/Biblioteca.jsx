// src/pages/Biblioteca.jsx (v4.0 - Audio Integrado)
import React, { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUp, BookOpen, Zap, Brain, Compass, Volume2, StopCircle } from 'lucide-react';

import { philosophyContent, survivalGuides, scienceReferences } from '../data/educationalContent';
import { principles } from '../data/principlesData';
import AsesorProteico from '../components/tools/AsesorProteico';

// --- COMPONENTE REPRODUCTOR DE VOZ ---
const AudioPlayer = ({ text }) => {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation(); // Evita que se cierre el acordeón al dar click
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      // Limpiamos HTML tags para leer solo texto
      const cleanText = text.replace(/<[^>]+>/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-MX'; // Español Latino
      utterance.rate = 1.0;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  return (
    <button 
      onClick={handleSpeak}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${speaking ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white'}`}
    >
      {speaking ? <StopCircle size={14} /> : <Volume2 size={14} />}
      {speaking ? 'Detener' : 'Escuchar'}
    </button>
  );
};

const Biblioteca = () => {
  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500 pb-24">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Centro de Conocimiento
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          La ciencia y las herramientas prácticas para dominar tu metabolismo.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 space-y-12">
          
          {/* FILOSOFÍA */}
          <section>
            <div className="flex items-center gap-2 mb-6"><Zap className="w-6 h-6 text-teal-400" /><h2 className="text-2xl font-bold text-white">Filosofía del Reinicio</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {philosophyContent.map((item) => (
                <div key={item.id} className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl">{item.icon}</div>
                    <AudioPlayer text={item.content} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </section>

          {/* GUÍAS DE SUPERVIVENCIA */}
          <section>
            <div className="flex items-center gap-2 mb-6"><Compass className="w-6 h-6 text-orange-400" /><h2 className="text-2xl font-bold text-white">Guías de Supervivencia</h2></div>
            <div className="grid grid-cols-1 gap-4">
              {survivalGuides.map((guide) => (
                <Disclosure as="div" key={guide.id} className="bg-slate-800/80 border border-slate-600 rounded-xl overflow-hidden">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full justify-between items-center p-5 text-left hover:bg-slate-700 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{guide.icon}</span>
                          <div>
                            <h3 className="font-bold text-white text-lg">{guide.title}</h3>
                            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider bg-teal-900/30 px-2 py-1 rounded">{guide.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <AudioPlayer text={guide.content} />
                            <ChevronUp className={`${open ? 'rotate-180' : ''} h-6 w-6 text-slate-400 transition-transform`} />
                        </div>
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-6 pb-6 pt-2 bg-slate-900/50 border-t border-slate-600">
                        <div className="prose prose-invert prose-p:text-slate-300 prose-strong:text-white max-w-none mt-4" dangerouslySetInnerHTML={{ __html: guide.content }} />
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))}
            </div>
          </section>

          {/* PRINCIPIOS CIENTÍFICOS */}
          <section>
            <div className="flex items-center gap-2 mb-6"><Brain className="w-6 h-6 text-indigo-400" /><h2 className="text-2xl font-bold text-white">Ciencia Profunda</h2></div>
            <div className="space-y-3">
              {principles.map((principio) => (
                <Disclosure as="div" key={principio.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full justify-between items-center px-6 py-4 text-left hover:bg-slate-700 transition-colors">
                        <span className="text-slate-200 font-medium">{principio.title}</span>
                        <div className="flex items-center gap-4">
                             <AudioPlayer text={principio.content} />
                             <ChevronUp className={`${open ? 'rotate-180' : ''} h-5 w-5 text-slate-500`} />
                        </div>
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-6 pb-6 pt-4 bg-slate-800 border-t border-slate-700">
                        <p className="text-indigo-300 italic mb-4 text-sm">{principio.subtitle}</p>
                        <div className="prose prose-invert prose-sm max-w-none text-slate-400" dangerouslySetInnerHTML={{ __html: principio.content }} />
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-6 space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-teal-600 p-3 text-center font-bold text-white">Herramienta Exclusiva</div>
              <div className="bg-white"><AsesorProteico /></div>
            </div>
            {/* CIENCIA */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">🧬 Referencias Médicas</h4>
                {scienceReferences?.map((ref) => (
                    <div key={ref.id} className="mb-6 last:mb-0">
                        <h5 className="text-teal-400 text-sm font-bold mb-1">{ref.title}</h5>
                        <div className="text-xs text-slate-400" dangerouslySetInnerHTML={{ __html: ref.content }} />
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Biblioteca;