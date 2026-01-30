// src/pages/Biblioteca.jsx
// v9.0 - Diseño NETFLIX (Filas Horizontales + Imágenes Variadas)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Zap, Brain, Compass, Volume2, StopCircle, 
  X, ChevronRight, GraduationCap, Clock, PlayCircle, Search
} from 'lucide-react';

// Datos
import { philosophyContent, survivalGuides, scienceReferences } from '../data/educationalContent';
import { principles } from '../data/principlesData';
import AsesorProteico from '../components/tools/AsesorProteico';

// --- BANCO DE IMÁGENES (Variedad para evitar repetición) ---
const getArticleImage = (category, index) => {
  // Bancos de imágenes por tema
  const scienceImages = [
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=600"
  ];

  const philosophyImages = [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1544367563-12123d815d19?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=600"
  ];

  const guideImages = [
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1543333995-a09abd19380b?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=600"
  ];

  if (category === 'ciencia') return scienceImages[index % scienceImages.length];
  if (category === 'filosofia') return philosophyImages[index % philosophyImages.length];
  return guideImages[index % guideImages.length];
};

// --- COMPONENTE DE AUDIO ---
const AudioBtn = ({ text, title }) => {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]+>/g, '');
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
      className={`p-2 rounded-full backdrop-blur-md transition-all ${
        speaking 
          ? 'bg-teal-500 text-white animate-pulse' 
          : 'bg-black/40 text-white hover:bg-black/60'
      }`}
    >
      {speaking ? <StopCircle size={16} /> : <PlayCircle size={16} />}
    </button>
  );
};

// --- COMPONENTE: ROW TIPO NETFLIX (Horizontal Scroll) ---
const NetflixRow = ({ title, icon: Icon, items, type, onSelect }) => (
  <div className="mb-10">
    <div className="flex items-center gap-2 mb-4 px-6 md:px-10">
      <Icon className="text-teal-500" size={24} />
      <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
    </div>
    
    <div className="flex overflow-x-auto gap-4 px-6 md:px-10 pb-6 scrollbar-hide snap-x">
      {items.map((item, idx) => {
        const image = getArticleImage(type, idx);
        const readTime = Math.ceil(item.content.length / 500);
        
        return (
          <div 
            key={idx}
            onClick={() => onSelect(item)}
            className="flex-shrink-0 w-72 md:w-80 snap-start bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer group hover:scale-105 hover:shadow-2xl hover:border-slate-600 transition-all duration-300 relative"
          >
            {/* Imagen Cover */}
            <div className="h-40 relative">
              <img src={image} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
              <div className="absolute bottom-3 right-3">
                 <AudioBtn text={item.content} title={item.title} />
              </div>
            </div>

            {/* Contenido Card */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{type}</span>
                 <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} /> {readTime} min</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2 leading-tight group-hover:text-teal-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                {item.subtitle || item.content.replace(/<[^>]+>/g, '').substring(0, 80) + "..."}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// --- MODAL DE LECTURA ---
const ArticleModal = ({ article, onClose }) => {
  if (!article) return null;
  const image = getArticleImage(article.type, 0); // Usa una imagen consistente

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 w-full max-w-3xl h-full md:h-[90vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 md:h-64 shrink-0">
          <img src={image} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          <button onClick={() => { window.speechSynthesis.cancel(); onClose(); }} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md z-20">
            <X size={24} />
          </button>
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
             <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight shadow-black drop-shadow-lg">
                {article.title}
             </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-slate-700">
          <div 
            className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed marker:text-teal-500"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </motion.div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
const Biblioteca = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Datos Organizados
  const manifesto = philosophyContent.find(i => i.id === 'manifesto');
  
  // Filtrar si hay búsqueda, si no, mostrar por filas
  const filterContent = (list) => {
    if (!searchTerm) return list;
    return list.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const filosofia = filterContent(philosophyContent.filter(i => i.id !== 'manifesto'));
  const ciencia = filterContent(principles);
  const guias = filterContent(survivalGuides);

  return (
    <div className="min-h-screen bg-slate-950 pb-24 animate-in fade-in duration-500">
      
      {/* HEADER + BUSCADOR */}
      <div className="px-6 md:px-10 pt-8 mb-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">Academia</h1>
          <p className="text-slate-400">Domina la ciencia de tu metabolismo.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HERO SECTION (EL MANIFIESTO) - Solo si no hay búsqueda activa */}
      {!searchTerm && manifesto && (
        <div className="px-6 md:px-10 mb-12">
          <div 
            onClick={() => setSelectedArticle({...manifesto, type: 'filosofia'})}
            className="relative h-[350px] rounded-3xl overflow-hidden cursor-pointer group border border-slate-800 shadow-2xl"
          >
            <img src="https://images.unsplash.com/photo-1544367563-12123d815d19?auto=format&fit=crop&q=80&w=1200" alt="Hero" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-xl">
              <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                Lectura Obligatoria
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                {manifesto.title}
              </h2>
              <p className="text-slate-300 text-lg mb-6 line-clamp-2">
                {manifesto.subtitle}
              </p>
              <div className="flex items-center gap-4 text-white font-bold group-hover:text-teal-400 transition-colors">
                 Leer Artículo <ChevronRight />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILAS ESTILO NETFLIX */}
      
      {/* 1. MENTALIDAD (Filosofía) */}
      {filosofia.length > 0 && (
        <NetflixRow 
          title="Mentalidad y Estrategia" 
          icon={Zap} 
          items={filosofia} 
          type="filosofia" 
          onSelect={(item) => setSelectedArticle({...item, type: 'filosofia'})} 
        />
      )}

      {/* 2. CIENCIA PROFUNDA */}
      {ciencia.length > 0 && (
        <NetflixRow 
          title="La Ciencia del Reinicio" 
          icon={Brain} 
          items={ciencia} 
          type="ciencia" 
          onSelect={(item) => setSelectedArticle({...item, type: 'ciencia'})} 
        />
      )}

      {/* 3. GUÍAS PRÁCTICAS */}
      {guias.length > 0 && (
        <NetflixRow 
          title="Guías de Supervivencia" 
          icon={Compass} 
          items={guias} 
          type="guias" 
          onSelect={(item) => setSelectedArticle({...item, type: 'guias'})} 
        />
      )}

      {/* FOOTER - REFERENCIAS */}
      <div className="px-6 md:px-10 mt-12 border-t border-slate-800 pt-10">
         <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
           <GraduationCap size={16} /> Fuentes Clínicas
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
            {scienceReferences.map((ref, i) => (
              <div key={i}>
                 <h5 className="text-teal-500 text-sm font-bold mb-1">{ref.title}</h5>
                 <div className="text-xs text-slate-400" dangerouslySetInnerHTML={{ __html: ref.content }} />
              </div>
            ))}
         </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
        )}
      </AnimatePresence>

    </div>
  );
};

export default Biblioteca;