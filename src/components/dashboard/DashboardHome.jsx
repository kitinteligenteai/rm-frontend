// src/components/dashboard/DashboardHome.jsx
// v33.0 - Centro de Reinicio Premium / Dante Asesor del Método

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

import {
  Calendar,
  Dumbbell,
  TrendingUp,
  ArrowRight,
  Activity,
  BookHeart,
  CheckCircle,
  Circle,
  Droplets,
  AlertTriangle,
  Zap,
  Target,
  Brain,
  Sparkles,
  BookOpen,
  ClipboardCheck,
  ShieldCheck,
  RotateCcw,
  Clock,
  Utensils,
  ShoppingCart,
  LifeBuoy,
  Scale,
} from "lucide-react";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

import OnboardingModal from "./OnboardingModal";
import ChefDanteWidget from "../dante/ChefDanteWidget";
import SOSCenter from "./SOSCenter";
import WeeklyCheckin from "./WeeklyCheckin";

const MANUAL_ITEMS = [
  {
    title: "Comida real",
    desc: "Prioriza alimentos simples, reconocibles y preparados en casa siempre que puedas.",
    icon: Utensils,
  },
  {
    title: "Proteína suficiente",
    desc: "Que cada comida importante tenga una base sólida de proteína.",
    icon: Target,
  },
  {
    title: "Verduras y fibra",
    desc: "Acompaña tus comidas con verduras para saciedad, volumen y mejor control del apetito.",
    icon: CheckCircle,
  },
  {
    title: "Grasas buenas",
    desc: "Usa grasas de calidad para cocinar y para dar saciedad sin recurrir a ultraprocesados.",
    icon: ShieldCheck,
  },
  {
    title: "Bebidas correctas",
    desc: "Agua, café o té sin azúcar. Evita romper el método con bebidas disfrazadas de saludables.",
    icon: Droplets,
  },
  {
    title: "Movimiento",
    desc: "No necesitas castigarte. Necesitas moverte con constancia y construir fuerza progresivamente.",
    icon: Dumbbell,
  },
];

const QUICK_SITUATIONS = [
  {
    title: "No sé qué comer",
    desc: "Ve a recetas o arma una comida simple dentro del método.",
    to: "/plataforma/recetas",
    icon: Utensils,
  },
  {
    title: "Voy al súper",
    desc: "Organiza tu semana y compra con intención, sin improvisar.",
    to: "/plataforma/planeador",
    icon: ShoppingCart,
  },
  {
    title: "Quiero moverme hoy",
    desc: "Elige una rutina en casa, con mancuernas o solo con tu cuerpo.",
    to: "/plataforma/gimnasio",
    icon: Dumbbell,
  },
  {
    title: "Quiero entender el método",
    desc: "Profundiza en la ciencia detrás de Reinicio Metabólico.",
    to: "/plataforma/biblioteca",
    icon: BookOpen,
  },
];

const TOOL_CARDS = [
  {
    title: "Planeador semanal",
    desc: "Crea estructura para tus comidas y reduce decisiones durante la semana.",
    to: "/plataforma/planeador",
    icon: Calendar,
    button: "Planear semana",
  },
  {
    title: "Bóveda de recetas",
    desc: "Opciones dentro del método para comer sin sentir que repites siempre lo mismo.",
    to: "/plataforma/recetas",
    icon: Utensils,
    button: "Ver recetas",
  },
  {
    title: "Gimnasio digital",
    desc: "Rutinas para casa, con peso corporal o equipo básico.",
    to: "/plataforma/gimnasio",
    icon: Dumbbell,
    button: "Entrenar",
  },
  {
    title: "Guía social",
    desc: "Estrategias para reuniones, salidas y comidas fuera sin volver al punto anterior.",
    to: "/plataforma/social",
    icon: LifeBuoy,
    button: "Prepararme",
  },
  {
    title: "Bitácora",
    desc: "Registra peso, medidas, energía y sueño una vez por semana para ver tendencia.",
    to: "/plataforma/bitacora",
    icon: BookHeart,
    button: "Registrar avance",
  },
  {
    title: "Biblioteca",
    desc: "Aprende la lógica del método: insulina, saciedad, músculo, sueño, estrés y hábitos.",
    to: "/plataforma/biblioteca",
    icon: Brain,
    button: "Profundizar",
  },
];

const MethodPillar = ({ icon: Icon, title, desc }) => {
  return (
    <div className="bg-slate-950/45 border border-slate-700/70 rounded-2xl p-4 hover:border-teal-500/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
          <Icon size={20} />
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-1">{title}</h4>
          <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
};

const RouteCard = ({
  icon: Icon,
  label,
  title,
  desc,
  bullets,
  to,
  button,
  variant = "teal",
}) => {
  const styles =
    variant === "indigo"
      ? {
          border: "border-indigo-500/30",
          bg: "from-indigo-950/70 to-slate-900",
          icon: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
          text: "text-indigo-300",
          button: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30",
        }
      : {
          border: "border-teal-500/30",
          bg: "from-teal-950/60 to-slate-900",
          icon: "bg-teal-500/10 border-teal-500/20 text-teal-300",
          text: "text-teal-300",
          button: "bg-teal-600 hover:bg-teal-500 shadow-teal-900/30",
        };

  return (
    <div
      className={`bg-gradient-to-br ${styles.bg} border ${styles.border} rounded-3xl p-6 flex flex-col justify-between min-h-[340px]`}
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-5">
          <span
            className={`text-[10px] uppercase tracking-[0.22em] font-bold ${styles.text}`}
          >
            {label}
          </span>

          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${styles.icon}`}
          >
            <Icon size={24} />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>

        <p className="text-slate-300 text-sm leading-relaxed mb-5">{desc}</p>

        <ul className="space-y-2">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        to={to}
        className={`mt-7 inline-flex items-center justify-center gap-2 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg ${styles.button}`}
      >
        {button}
        <ArrowRight size={18} />
      </Link>
    </div>
  );
};

const SituationCard = ({ icon: Icon, title, desc, to, onClick }) => {
  const content = (
    <div className="group bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-teal-500/40 hover:bg-slate-800/80 transition-all h-full">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white group-hover:border-teal-400 transition-all shrink-0">
          <Icon size={21} />
        </div>

        <div className="min-w-0">
          <h4 className="text-white font-bold text-base mb-1 group-hover:text-teal-300 transition-colors">
            {title}
          </h4>
          <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left h-full">
        {content}
      </button>
    );
  }

  return (
    <Link to={to} className="block h-full">
      {content}
    </Link>
  );
};

const ToolCard = ({ icon: Icon, title, desc, to, button }) => {
  return (
    <Link to={to} className="group block h-full">
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 h-full hover:bg-slate-800 hover:border-teal-500/45 transition-all flex flex-col justify-between">
        <div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mb-4 group-hover:bg-teal-500 group-hover:text-white transition-all">
            <Icon size={23} />
          </div>

          <h4 className="text-white font-bold text-lg mb-2 group-hover:text-teal-300 transition-colors">
            {title}
          </h4>

          <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>

        <div className="mt-6 flex items-center text-xs font-bold text-teal-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
          {button}
          <ArrowRight size={14} className="ml-2" />
        </div>
      </div>
    </Link>
  );
};

export default function DashboardHome({ user }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [localName, setLocalName] = useState("");
  const [showSOS, setShowSOS] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);

  const [latestWeight, setLatestWeight] = useState(null);
  const [weightTrend, setWeightTrend] = useState([]);
  const [foundationSeen, setFoundationSeen] = useState(false);

  const [trackerData, setTrackerData] = useState({
    agua_vasos: 0,
    tareas_completadas: [],
  });

  const cleanName = localName || user?.user_metadata?.full_name;
  const displayName =
    cleanName && cleanName.trim() !== "" ? cleanName.trim() : "Campeón";

  const daysSinceJoin = useMemo(() => {
    if (!user?.created_at) return 1;

    const created = new Date(user.created_at);
    const today = new Date();
    const diffTime = Math.abs(today - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays || 1;
  }, [user]);

  const trackerDay = Math.max(1, Math.min(daysSinceJoin, 7));

  const hasProgressData = latestWeight !== null || weightTrend.length > 0;

  const danteMessage = useMemo(() => {
    if (!foundationSeen && !hasProgressData) {
      return `Hola ${displayName}. Ya diste el paso más importante: comenzaste con el Kit y ahora estás dentro del Programa Completo. Aquí no vamos a volver a empezar; vamos a consolidar la base para que esto se convierta en un sistema sostenible.`;
    }

    if (!foundationSeen) {
      return `Bienvenido de nuevo, ${displayName}. Ya tienes avance registrado. Ahora conviene reforzar el Manual del Reinicio para que entiendas cómo sostener el método sin depender de motivación diaria.`;
    }

    if (!hasProgressData) {
      return `${displayName}, tu siguiente paso útil no es estudiar más: es convertir el método en acciones simples. Organiza comida real, prepara opciones rápidas y registra tu punto de partida esta semana.`;
    }

    return `${displayName}, vas bien. Mantén la base: comida real, proteína suficiente, verduras, grasas buenas, bebidas correctas y movimiento. No busques perfección; vuelve al método en la siguiente comida.`;
  }, [displayName, foundationSeen, hasProgressData]);

  const danteAction = useMemo(() => {
    if (!foundationSeen) return "/plataforma/biblioteca";
    if (!hasProgressData) return "/plataforma/bitacora";
    return "/plataforma/planeador";
  }, [foundationSeen, hasProgressData]);

  const danteActionLabel = useMemo(() => {
    if (!foundationSeen) return "Reforzar el método";
    if (!hasProgressData) return "Registrar avance semanal";
    return "Organizar mi semana";
  }, [foundationSeen, hasProgressData]);

  const weeklyFocus = useMemo(() => {
    if (!hasProgressData) {
      return [
        "Elige tus comidas base para esta semana.",
        "Ten proteína y verduras disponibles antes de que llegue el hambre.",
        "Haz tu primer registro semanal: peso, medidas, energía y sueño.",
      ];
    }

    return [
      "Repite la base: proteína, verduras, grasas buenas y bebidas sin azúcar.",
      "Usa el planeador para evitar improvisar cuando estés cansado.",
      "Muévete hoy aunque sea poco: caminar o rutina corta en casa.",
    ];
  }, [hasProgressData]);

  const calculationWeight = latestWeight || 80;
  const dailyMl = calculationWeight * 35;
  const targetGlasses = Math.max(6, Math.ceil(dailyMl / 250));
  const liters = (dailyMl / 1000).toFixed(1);
  const percentHydration = Math.min(
    100,
    Math.round(((trackerData.agua_vasos || 0) / targetGlasses) * 100)
  );

  useEffect(() => {
    if (user && !user.user_metadata?.full_name && !localName) {
      setShowOnboarding(true);
    }

    if (user) {
      fetchWeightData();
      fetchTrackerData();

      const savedFoundation = localStorage.getItem(
        `rm_foundation_seen_${user.id}`
      );
      setFoundationSeen(savedFoundation === "true");
    }
  }, [user, localName, trackerDay]);

  const handleOnboardingComplete = (newName) => {
    setLocalName(newName);
    setShowOnboarding(false);
  };

  const markFoundationSeen = () => {
    if (!user?.id) return;
    localStorage.setItem(`rm_foundation_seen_${user.id}`, "true");
    setFoundationSeen(true);
  };

  const fetchWeightData = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("progress_logs")
      .select("weight, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(7);

    if (!error && data && data.length > 0) {
      setLatestWeight(data[0].weight);

      const graphData = [...data].reverse().map((log) => ({
        day: new Date(log.created_at).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        }),
        peso: log.weight,
      }));

      setWeightTrend(graphData);
    } else {
      setLatestWeight(null);
      setWeightTrend([]);
    }
  };

  const fetchTrackerData = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from("seguimiento_7dias")
      .select("*")
      .eq("user_id", user.id)
      .eq("dia_numero", trackerDay)
      .maybeSingle();

    if (data) {
      setTrackerData(data);
    } else {
      setTrackerData({ agua_vasos: 0, tareas_completadas: [] });
    }
  };

  const updateTracker = async (updates) => {
    if (!user?.id) return;

    setTrackerData((prev) => ({ ...prev, ...updates }));

    await supabase.from("seguimiento_7dias").upsert(
      {
        user_id: user.id,
        dia_numero: trackerDay,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id, dia_numero" }
    );
  };

  const toggleFocus = (item) => {
    const actuales = trackerData.tareas_completadas || [];

    const nuevaLista = actuales.includes(item)
      ? actuales.filter((t) => t !== item)
      : [...actuales, item];

    updateTracker({ tareas_completadas: nuevaLista });
  };

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 pb-40">
      {showOnboarding && (
        <OnboardingModal user={user} onComplete={handleOnboardingComplete} />
      )}

      {showSOS && <SOSCenter onClose={() => setShowSOS(false)} />}

      {showCheckin && (
        <WeeklyCheckin user={user} onClose={() => setShowCheckin(false)} />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-xs text-teal-400 uppercase tracking-[0.24em] font-bold mb-2">
            Centro de Reinicio
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Hola, {displayName}{" "}
            <span className="animate-wave inline-block">👋</span>
          </h1>

          <p className="text-slate-400 mt-2 text-lg max-w-3xl">
            Ya hiciste el arranque. Ahora vamos a consolidar el método para que
            no se quede en una semana de motivación.
          </p>
        </div>

        <button
          onClick={() => setShowSOS(true)}
          className="w-full md:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/40 px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"
        >
          <AlertTriangle size={18} />
          Dante SOS
        </button>
      </div>

      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/50 border border-teal-500/25 rounded-3xl p-7 md:p-9 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/20 uppercase tracking-widest mb-5">
              <Sparkles className="w-4 h-4" />
              Dante — Asesor del Método
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-5">
              Ahora no se trata de empezar.
              <span className="block text-teal-300">
                Se trata de sostenerlo.
              </span>
            </h2>

            <p className="text-slate-300 text-lg leading-relaxed max-w-3xl mb-6">
              El Kit de 7 días te mostró la base. En el Programa Completo vamos
              a afianzar el método: comida real, proteína suficiente, verduras,
              grasas buenas, bebidas correctas, movimiento y seguimiento simple.
              Sin vivir contando calorías. Sin pasar hambre. Sin convertir esto
              en una tarea imposible.
            </p>

            <div className="bg-slate-950/55 border border-slate-700/70 rounded-2xl p-5 mb-7">
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                <span className="text-teal-300 font-bold">Dante dice:</span>{" "}
                {danteMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/plataforma/planeador"
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-lg shadow-teal-900/30"
              >
                Organizar mi alimentación
                <ArrowRight size={19} />
              </Link>

              <button
                onClick={() => setShowSOS(true)}
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-6 py-4 rounded-xl transition-all"
              >
                Necesito ayuda rápida
                <LifeBuoy size={19} />
              </button>
            </div>
          </div>

          <div className="bg-black/25 border border-white/10 rounded-3xl p-5 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300">
                <Target size={22} />
              </div>

              <div>
                <h3 className="text-white font-bold text-xl">
                  Tu enfoque práctico
                </h3>
                <p className="text-slate-400 text-xs">
                  No es obligación diaria. Es una guía para volver al rumbo.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {weeklyFocus.map((item) => {
                const isDone = (trackerData.tareas_completadas || []).includes(
                  item
                );

                return (
                  <button
                    key={item}
                    onClick={() => toggleFocus(item)}
                    className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                      isDone
                        ? "bg-teal-500/10 border-teal-500/40"
                        : "bg-slate-950/40 border-slate-700/60 hover:border-slate-500"
                    }`}
                  >
                    <div
                      className={`mt-0.5 ${
                        isDone ? "text-teal-400" : "text-slate-600"
                      }`}
                    >
                      {isDone ? <CheckCircle size={20} /> : <Circle size={20} />}
                    </div>

                    <span
                      className={`text-sm leading-relaxed ${
                        isDone
                          ? "text-teal-100 line-through decoration-teal-500/40"
                          : "text-slate-300"
                      }`}
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowCheckin(true)}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl transition-all"
            >
              <ClipboardCheck size={18} />
              Hacer revisión semanal
            </button>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-7 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-xs text-teal-400 uppercase tracking-[0.24em] font-bold mb-2">
              El Manual del Reinicio
            </p>

            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Vuelve a la base, una y otra vez.
            </h3>

            <p className="text-slate-400 mt-2 max-w-3xl">
              La transformación no depende de hacerlo perfecto. Depende de
              repetir los principios correctos hasta que se vuelvan tu forma
              normal de operar.
            </p>
          </div>

          <Link
            to="/plataforma/biblioteca"
            onClick={markFoundationSeen}
            className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-5 py-3 rounded-xl transition-all"
          >
            Entender la filosofía
            <BookOpen size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {MANUAL_ITEMS.map((item) => (
            <MethodPillar key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <p className="text-xs text-teal-400 uppercase tracking-[0.24em] font-bold mb-2">
            Elige cómo avanzar
          </p>

          <h3 className="text-2xl md:text-3xl font-bold text-white">
            Dos caminos, mismo método.
          </h3>

          <p className="text-slate-400 mt-2 max-w-3xl">
            Hay semanas donde quieres estructura completa y semanas donde solo
            necesitas resolver sin estrés. Ambas rutas deben mantenerte dentro
            de Reinicio Metabólico.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RouteCard
            icon={Calendar}
            label="Modo Automático"
            title="Planea tu semana sin improvisar"
            desc="Usa el planeador para organizar comidas, revisar recetas y convertir la semana en una lista de compras clara."
            bullets={[
              "Menú semanal estructurado.",
              "Recetas conectadas al plan.",
              "Lista de compras para surtir tu despensa.",
              "Menos decisiones cuando estás cansado.",
            ]}
            to="/plataforma/planeador"
            button="Usar modo automático"
          />

          <RouteCard
            icon={Clock}
            label="Modo Rápido"
            title="Resuelve días ocupados sin salirte"
            desc="Cuando no tienes tiempo, no necesitas hacerlo perfecto: necesitas una comida simple, real y alineada al método."
            bullets={[
              "Proteína lista o rápida.",
              "Verdura sencilla.",
              "Grasa buena para saciedad.",
              "Bebida correcta y cero culpa.",
            ]}
            to="/plataforma/recetas"
            button="Buscar opciones rápidas"
            variant="indigo"
          />
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-7 md:p-8">
        <div className="mb-6">
          <p className="text-xs text-red-300 uppercase tracking-[0.24em] font-bold mb-2">
            Cuando la vida real aparece
          </p>

          <h3 className="text-2xl md:text-3xl font-bold text-white">
            No necesitas abandonar por un mal momento.
          </h3>

          <p className="text-slate-400 mt-2 max-w-3xl">
            El problema no es una comida fuera del plan. El problema es
            convertir un desliz en una semana perdida. Aquí Dante te ayuda a
            volver rápido a la base.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <SituationCard
            icon={AlertTriangle}
            title="Tengo antojo"
            desc="Pausa, decide y vuelve al método sin culpa."
            onClick={() => setShowSOS(true)}
          />

          <SituationCard
            icon={RotateCcw}
            title="Me salí del plan"
            desc="No compenses. Vuelve a la siguiente comida base."
            onClick={() => setShowSOS(true)}
          />

          <SituationCard
            icon={Clock}
            title="No tengo tiempo"
            desc="Usa la ruta rápida y resuelve sin cocinar elaborado."
            to="/plataforma/recetas"
          />

          <SituationCard
            icon={LifeBuoy}
            title="Tengo evento social"
            desc="Disfruta con estrategia y vuelve sin perder el rumbo."
            to="/plataforma/social"
          />

          <SituationCard
            icon={Scale}
            title="Estoy estancado"
            desc="Revisa tendencia, sueño, comida y movimiento semanal."
            onClick={() => setShowCheckin(true)}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-7 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-teal-400" />
                Tu avance
              </h3>

              <p className="text-slate-400 text-sm mt-1">
                Revisa tendencia, no perfección diaria. Sugerimos registrar una
                vez por semana.
              </p>
            </div>

            <Link
              to="/plataforma/bitacora"
              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-5 py-3 rounded-xl transition-all"
            >
              Registrar avance
              <Activity size={18} />
            </Link>
          </div>

          <div className="h-80">
            {latestWeight !== null && weightTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightTrend}>
                  <defs>
                    <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={["auto", "auto"]}
                    stroke="#64748b"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#f1f5f9",
                      borderRadius: "12px",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="peso"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPeso)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/40">
                <Activity size={42} className="mb-3 opacity-50" />
                <p className="text-slate-300 font-semibold">
                  Aún no hay registros.
                </p>
                <p className="text-sm max-w-md mt-1">
                  No necesitas registrar diario. Hazlo una vez por semana para
                  ver tendencia de peso, energía, medidas y sueño.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white font-bold text-xl flex items-center gap-2">
                  <Droplets className="text-blue-400" />
                  Hidratación
                </h3>

                <p className="text-slate-400 text-xs mt-1">
                  Referencia práctica, no regla médica rígida.
                </p>
              </div>

              <div className="text-right">
                <span className="text-blue-300 font-bold text-2xl">
                  {liters}L
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center my-8">
              <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                {trackerData.agua_vasos || 0}
                <span className="text-2xl text-slate-600 font-medium">
                  /{targetGlasses}
                </span>
              </div>

              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                Vasos registrados
              </p>
            </div>

            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-6">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${percentHydration}%` }}
              ></div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() =>
                updateTracker({
                  agua_vasos: Math.max(0, (trackerData.agua_vasos || 0) - 1),
                })
              }
              className="w-14 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700"
            >
              -
            </button>

            <button
              onClick={() =>
                updateTracker({
                  agua_vasos: (trackerData.agua_vasos || 0) + 1,
                })
              }
              className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/30"
            >
              + Registrar vaso
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <p className="text-xs text-teal-400 uppercase tracking-[0.24em] font-bold mb-2">
            Herramientas del Programa
          </p>

          <h3 className="text-2xl md:text-3xl font-bold text-white">
            Todo existe para ayudarte a sostener el método.
          </h3>

          <p className="text-slate-400 mt-2 max-w-3xl">
            No tienes que usar todo hoy. Usa la herramienta que resuelva el
            problema que tienes frente a ti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {TOOL_CARDS.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/20 rounded-3xl p-7 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-5 items-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
            <ClipboardCheck size={28} />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Revisión semanal, no tarea diaria.
            </h3>

            <p className="text-slate-300 leading-relaxed">
              Una vez por semana revisa cómo vas: peso, medidas, energía, sueño,
              adherencia y obstáculos. El objetivo no es juzgarte; es ajustar el
              rumbo.
            </p>
          </div>

          <button
            onClick={() => setShowCheckin(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-lg shadow-indigo-900/30"
          >
            Abrir revisión
          </button>
        </div>
      </section>

      <ChefDanteWidget
        message={danteMessage}
        action={danteAction}
        actionLabel={danteActionLabel}
        badge={true}
      />
    </div>
  );
}