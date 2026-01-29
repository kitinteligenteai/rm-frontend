import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Zap, Brain, Compass, Volume2, StopCircle, 
  X, ChevronRight, GraduationCap, Clock, PlayCircle
} from 'lucide-react';

// Datos
import { philosophyContent, survivalGuides, scienceReferences } from '../data/educationalContent';
import { principles } from '../data/principlesData';
import AsesorProteico from '../components/tools/AsesorProteico';

// --- BANCO DE IMÁGENES AUTOMÁTICO (Para efecto Revista) ---
const getArticleImage = (category, id) => {
  // Mapeo de imágenes premium de Unsplash según el tema
  const images = {
    manifesto: "https://images.unsplash.com/photo-1544367563-12123d815d19?auto=format&fit=crop&q=80&w=1200", // Mentalidad/Libro
    sustainability: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&q=80&w=600", // Planta/Crecimiento
    listening: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600", // Meditación/Yoga
    ciencia: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600", // Ciencia/Laboratorio
    guias: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600", // Comida saludable
    default: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=600" // Abstracto oscuro
  };

  if (id === 'manifesto') return images.manifesto;
  if (category === 'filosofia') return images.listening;
  if (category === 'ciencia') return images.ciencia;
  if (category === 'guias') return images.guias;
  return images.default;
};

// --- COMPONENTE DE AUDIO ---
const AudioBtn = ({ text, title, minimal = false }) => {
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

  if (minimal) {
    return (
      <button onClick={handleSpeak} className="text-white/80 hover:text-teal-400 transition-colors">
        {speaking ? <StopCircle size={24} className="animate-pulse text-teal-400" /> : <PlayCircle size={24} />}
      </button>
    );
  }

  return (
    <button 
      onClick={handleSpeak}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all ${
        speaking 
          ? 'bg-teal-500/90 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)]' 
          : 'bg-black/40 text-white border border-white/20 hover:bg-black/60'
      }`}
    >
      {speaking ? <StopCircle size={14} /> : <Volume2 size={14} />}
      {speaking ? 'Escuchando...' : 'Escuchar'}
    </button>
  );
};

// --- MODAL DE LECTURA ---
const ArticleModal = ({ article, onClose }) => {
  if (!article) return null;
  const image = getArticleImage(article.type, article.id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 w-full max-w-3xl h-full md:h-[90vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Imagen */}
        <div className="relative h-64 shrink-0">
          <img src={image} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          <button onClick={() => { window.speechSynthesis.cancel(); onClose(); }} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md z-20">
            <X size={24} />
          </button>

          <div className="absolute bottom-0 left-0 p-8 w-full">
             <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                  {article.type}
                </span>
                <span className="text-slate-300 text-xs flex items-center gap-1">
                  <Clock size={12} /> {Math.ceil(article.content.length / 500)} min lectura
                </span>
             </div>
             <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight shadow-black drop-shadow-lg">
                {article.title}
             </h2>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
             <p className="text-indigo-300 text-lg font-medium italic">
                "{article.subtitle || 'Domina tu metabolismo con ciencia y estrategia.'}"
             </p>
             <div className="shrink-0 ml-4">
                <AudioBtn text={article.content} title={article.title} />
             </div>
          </div>

          <div 
            className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed marker:text-teal-500"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </motion.div>
    </div>
  );
};

// --- COMPONENTES VISUALES ---

// 1. HERO CARD (El Artículo Principal - Estilo Portada)
const HeroArticle = ({ article, onClick }) => {
  const image = getArticleImage(article.type, article.id);
  
  return (
    <div 
      onClick={() => onClick(article)}
      className="col-span-1 lg:col-span-2 relative h-[400px] rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-slate-800"
    >
      <img src={image} alt="Cover" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
      
      <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-3">
           <Zap className="text-yellow-400 fill-yellow-400" size={20} />
           <span className="text-yellow-400 font-bold tracking-widest text-xs uppercase">Lectura Fundamental</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight group-hover:text-teal-400 transition-colors">
          {article.title}
        </h2>
        <p className="text-slate-300 text-lg mb-6 line-clamp-2 max-w-xl">
          {article.subtitle}
        </p>
        
        <div className="flex items-center gap-4">
           <button className="bg-white text-slate-950 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-teal-50 text-sm transition-colors">
             Leer Ahora <ChevronRight size={16} />
           </button>
           <AudioBtn text={article.content} title={article.title} />
        </div>
      </div>
    </div>
  );
};

// 2. STANDARD CARD (Tarjetas Verticales)
const StandardCard = ({ article, onClick }) => {
  const image = getArticleImage(article.type, article.id);
  const readTime = Math.ceil(article.content.length / 500);

  return (
    <div 
      onClick={() => onClick(article)}
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer group hover:border-slate-600 hover:shadow-xl transition-all flex flex-col h-full"
    >
      <div className="h-48 relative overflow-hidden">
        <img src={image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
        <div className="absolute bottom-3 right-3">
           <AudioBtn text={article.content} title={article.title} />
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
           <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{article.type}</span>
           <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} /> {readTime} min</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-teal-400 transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-3">
          {article.subtitle || article.content.replace(/<[^>]+>/g, '').substring(0, 100) + "..."}
        </p>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
const Biblioteca = () => {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // 1. Preparar la Data
  const allContent = [
    // El Manifiesto siempre primero
    ...philosophyContent.map(i => ({ ...i, type: 'filosofia', featured: i.id === 'manifesto' })),
    ...principles.map(i => ({ ...i, type: 'ciencia' })),
    ...survivalGuides.map(i => ({ ...i, type: 'guias' })),
  ];

  // Separar Hero (Manifiesto) del resto
  const heroArticle = allContent.find(a => a.featured);
  const otherArticles = allContent.filter(a => !a.featured);

  // Filtrado
  const displayArticles = activeFilter === 'todos' 
    ? otherArticles 
    : otherArticles.filter(a => a.type === activeFilter);

  const filters = [
    { id: 'todos', label: 'Explorar Todo' },
    { id: 'filosofia', label: 'Mentalidad' },
    { id: 'ciencia', label: 'Ciencia' },
    { id: 'guias', label: 'Guías Prácticas' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-24 animate-in fade-in duration-500">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-teal-500" /> Academia
        </h1>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === f.id 
                  ? 'bg-white text-slate-950' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        
        {/* SECCIÓN HERO (Solo se muestra en "Todos") */}
        {activeFilter === 'todos' && heroArticle && (
          <HeroArticle article={heroArticle} onClick={setSelectedArticle} />
        )}

        {/* GRID DE CONTENIDO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Artículos */}
          {displayArticles.map((article, idx) => (
             <StandardCard key={idx} article={article} onClick={setSelectedArticle} />
          ))}

          {/* Widget de Asesor Proteico (Insertado en el Grid como publicidad nativa) */}
          <div className="md:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-1 border border-indigo-500/30">
             <div className="h-full bg-slate-900/50 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                <div className="p-3 bg-indigo-500 rounded-full text-white mb-4">
                  <Zap size={24} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">¿Cuánta proteína necesitas?</h3>
                <p className="text-slate-400 text-sm mb-4">Usa la calculadora exclusiva.</p>
                <div className="w-full">
                  <AsesorProteico />
                </div>
             </div>
          </div>

        </div>

        {/* REFERENCIAS CIENTÍFICAS (Footer) */}
        <div className="border-t border-slate-800 pt-10 mt-10">
           <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
             <GraduationCap size={16} /> Respaldo Clínico
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 hover:opacity-100 transition-opacity">
              {scienceReferences.map((ref, i) => (
                <div key={i}>
                   <h5 className="text-teal-500 text-sm font-bold mb-2">{ref.title}</h5>
                   <div className="text-xs text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: ref.content }} />
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* MODAL DE LECTURA */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
        )}
      </AnimatePresence>

    </div>
  );
};

export default Biblioteca;