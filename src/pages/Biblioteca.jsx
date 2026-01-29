// src/pages/Biblioteca.jsx
// v7.0 - Diseño Revista Digital "Masterclass"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Zap, Brain, Compass, Volume2, StopCircle, 
  X, ChevronRight, GraduationCap, FileText, Search 
} from 'lucide-react';

// Importamos tus datos existentes
import { philosophyContent, survivalGuides, scienceReferences } from '../data/educationalContent';
import { principles } from '../data/principlesData';
import AsesorProteico from '../components/tools/AsesorProteico';

// --- COMPONENTE DE AUDIO (Integrado y Elegante) ---
const AudioBtn = ({ text, title }) => {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation(); // Evita abrir el artículo al dar click en audio
    
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      window.speechSynthesis.cancel(); // Cancelar previos
      const cleanText = text.replace(/<[^>]+>/g, ''); // Quitar HTML
      const utterance = new SpeechSynthesisUtterance(`${title}. ${cleanText}`);
      utterance.lang = 'es-MX';
      utterance.rate = 1.0;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  return (
    <button 
      onClick={handleSpeak}
      className={`p-2 rounded-full transition-all ${
        speaking 
          ? 'bg-teal-500 text-white animate-pulse' 
          : 'bg-slate-800 text-slate-400 hover:bg-teal-500/20 hover:text-teal-400'
      }`}
      title={speaking ? "Detener audio" : "Escuchar artículo"}
    >
      {speaking ? <StopCircle size={18} /> : <Volume2 size={18} />}
    </button>
  );
};

// --- MODAL DE LECTURA (Tipo Medium/Kindle) ---
const ArticleModal = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl h-full md:h-[85vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Barra Superior */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <BookOpen size={20} />
             </div>
             <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Lectura</span>
          </div>
          <button onClick={() => { window.speechSynthesis.cancel(); onClose(); }} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            {article.title}
          </h2>
          
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-800">
            <AudioBtn text={article.content} title={article.title} />
            <span className="text-slate-500 text-sm">Escuchar narración</span>
          </div>

          <div 
            className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

      </div>
    </div>
  );
};

// --- TARJETA DE ARTÍCULO ---
const ArticleCard = ({ item, onClick, categoryColor = "indigo" }) => {
  // Extraer un resumen corto del contenido HTML
  const summary = item.content.replace(/<[^>]+>/g, '').substring(0, 100) + "...";

  return (
    <div 
      onClick={() => onClick(item)}
      className="group bg-slate-900 border border-slate-800 hover:border-slate-600 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-${categoryColor}-500/10 text-${categoryColor}-400 text-2xl`}>
          {item.icon || <FileText size={24} />}
        </div>
        <AudioBtn text={item.content} title={item.title} />
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-teal-400 transition-colors">
        {item.title}
      </h3>
      
      <p className="text-sm text-slate-400 mb-4 flex-1">
        {item.subtitle || summary}
      </p>

      <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-white transition-colors mt-auto pt-4 border-t border-slate-800">
        Leer Artículo <ChevronRight size={14} className="ml-1" />
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
const Biblioteca = () => {
  const [activeTab, setActiveTab] = useState('todo');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Unificar todo el contenido en una sola lista maestra con categorías
  const allContent = [
    ...principles.map(i => ({ ...i, type: 'ciencia', icon: <Brain /> })),
    ...philosophyContent.map(i => ({ ...i, type: 'filosofia', icon: <Zap /> })),
    ...survivalGuides.map(i => ({ ...i, type: 'guias', icon: <Compass /> })),
    ...scienceReferences.map(i => ({ ...i, type: 'referencias', icon: <GraduationCap /> }))
  ];

  // Filtrado
  const filteredContent = allContent.filter(item => {
    const matchesTab = activeTab === 'todo' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'todo', label: 'Todo' },
    { id: 'filosofia', label: 'Mentalidad' },
    { id: 'ciencia', label: 'Ciencia' },
    { id: 'guias', label: 'Guías Prácticas' },
  ];

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-950 pb-24 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <BookOpen className="text-teal-500" size={36} /> Academia
          </h1>
          <p className="text-slate-400 text-lg">Tu centro de conocimiento metabólico.</p>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar tema..." 
            className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none placeholder:text-slate-600"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex overflow-x-auto gap-2 pb-6 mb-4 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40' 
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRID DE ARTÍCULOS (2 Columnas en Desktop) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContent.length > 0 ? (
            filteredContent.map((item, idx) => (
              <ArticleCard 
                key={idx} 
                item={item} 
                onClick={setSelectedArticle}
                categoryColor={item.type === 'ciencia' ? 'indigo' : item.type === 'guias' ? 'orange' : 'teal'} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-slate-500">
              <p>No encontramos artículos sobre ese tema.</p>
            </div>
          )}
        </div>

        {/* SIDEBAR DE HERRAMIENTAS (1 Columna derecha) */}
        <div className="space-y-6">
          <div className="sticky top-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl mb-6">
              <div className="bg-teal-600/20 p-4 border-b border-teal-500/20 flex items-center gap-2">
                <Zap size={18} className="text-teal-400" />
                <h3 className="font-bold text-teal-100 text-sm uppercase tracking-wide">Herramienta Exclusiva</h3>
              </div>
              <div className="p-4 bg-white"> {/* AsesorProteico necesita fondo claro o adaptar su CSS */}
                 <AsesorProteico />
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <GraduationCap size={16} className="text-indigo-400"/> Referencias Médicas
                </h4>
                <div className="space-y-4 text-xs text-slate-400">
                  <p>Basado en los protocolos clínicos del Dr. Jason Fung y Virta Health.</p>
                  <p>Toda la información es educativa. Consulta a tu médico antes de cambios drásticos.</p>
                </div>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL DE LECTURA */}
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

    </div>
  );
};

export default Biblioteca;