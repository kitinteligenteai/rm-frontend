// src/components/dashboard/DashboardHome.jsx
// v31.0 - Human-Tech Harmony / Poka-Yoke Suave

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
  Cpu,
  LifeBuoy,
  CheckCircle,
  Circle,
  Droplets,
  AlertTriangle,
  Zap,
  Target,
  Lock,
  Unlock,
  Brain,
  PlayCircle,
  StopCircle,
  X,
  ClipboardCheck,
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
import MissionBriefing from "./MissionBriefing";

// =======================================================
// CONTENIDO EXCLUSIVO HIGH TICKET
// =======================================================

const FASE_CONTENT = {
  2: {
    title: "Nivel 2: Neuro-Regulación",
    description:
      "La fuerza de voluntad se agota; la identidad no. En esta fase, dejamos de luchar contra los impulsos y aprendemos a desactivarlos desde el sistema nervioso.",
    tools: [
      {
        type: "audio",
        title: "Sesión: El Observador Consciente",
        text:
          "Cierra los ojos. Imagina que estás sentado en la orilla de un río. Los antojos son troncos que flotan en el agua. Tu instinto es saltar y agarrarlos. En esta sesión, aprenderás a quedarte en la orilla, observando cómo pasan y se alejan, sin que te mojes. Tú no eres tus impulsos; eres quien los observa.",
      },
      {
        type: "tip",
        title: "Técnica: La Pausa de los 10 Minutos",
        text:
          "Cuando sientas urgencia de comer sin hambre, pon un cronómetro de 10 minutos. Si al sonar la alarma sigues queriendo comer, elige una opción dentro del plan. La meta no es resistir para siempre, sino recuperar control.",
      },
      {
        type: "tip",
        title: "Protocolo 14:10",
        text:
          "No es una dieta, es un horario de reparación. Limita tu ventana de alimentación a 10 horas, por ejemplo de 9am a 7pm. Las otras 14 horas permiten descanso digestivo y mejor control de antojos.",
      },
    ],
  },
  3: {
    title: "Nivel 3: Eficiencia Mitocondrial",
    description:
      "Has limpiado el terreno, ahora vamos a encender el motor. Esta fase se enfoca en mejorar energía, fuerza y consistencia.",
    tools: [
      {
        type: "tip",
        title: "Termogénesis suave",
        text:
          "Finaliza tu ducha con 30 segundos de agua fría. Concéntrate en controlar tu respiración. No se trata de sufrir, sino de entrenar tolerancia e intención.",
      },
      {
        type: "audio",
        title: "Sesión: Visualización de Energía Celular",
        text:
          "Visualiza tus células como pequeños motores que aprenden a usar energía de forma más estable. Cada comida real, cada caminata y cada rutina envía una señal de reparación y fuerza.",
      },
      {
        type: "tip",
        title: "Fuerza antes que castigo",
        text:
          "El entrenamiento de fuerza no es para agotarte. Es para recordarle a tu cuerpo que el músculo es prioridad. Hazlo con control, no con desesperación.",
      },
    ],
  },
};

// =======================================================
// AUDIO DE FASE
// =======================================================

const PhaseAudioPlayer = ({ text, title }) => {
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);

    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center gap-4 p-5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all border border-slate-700 group shadow-md"
    >
      <div
        className={`p-3 rounded-full shrink-0 ${
          playing
            ? "bg-indigo-500 text-white animate-pulse"
            : "bg-slate-900 text-indigo-400 border border-slate-700"
        }`}
      >
        {playing ? <StopCircle size={24} /> : <PlayCircle size={24} />}
      </div>

      <div className="text-left">
        <p className="text-white font-bold text-base group-hover:text-indigo-300 transition-colors">
          {title}
        </p>
        <p className="text-slate-400 text-xs mt-1">
          {playing ? "Reproduciendo sesión..." : "Escuchar sesión guiada"}
        </p>
      </div>
    </button>
  );
};

// =======================================================
// MODAL DE FASE
// =======================================================

const PhaseModal = ({ phaseId, onClose }) => {
  const content = FASE_CONTENT[phaseId];

  if (!content) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 border-b border-slate-800 shrink-0">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Unlock size={24} className="text-indigo-400" />
            {content.title}
          </h2>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          <p className="text-indigo-100 text-lg leading-relaxed border-l-4 border-indigo-500 pl-4">
            {content.description}
          </p>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Target size={14} />
              Protocolos activados
            </h4>

            {content.tools.map((tool, idx) => (
              <div
                key={idx}
                className="animate-in slide-in-from-bottom-2 fade-in duration-500"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {tool.type === "audio" ? (
                  <PhaseAudioPlayer text={tool.text} title={tool.title} />
                ) : (
                  <div className="p-5 bg-teal-900/10 border border-teal-500/20 rounded-xl hover:border-teal-500/40 transition-colors">
                    <h5 className="text-teal-400 font-bold text-base mb-2 flex items-center gap-2">
                      <Zap size={18} className="fill-teal-400/20" />
                      {tool.title}
                    </h5>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {tool.text}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =======================================================
// ACCESO RÁPIDO CON POKA-YOKE SUAVE
// =======================================================

const QuickAction = ({
  icon: Icon,
  title,
  desc,
  to,
  buttonText,
  isSoftLocked = false,
  lockedText = "Se recomienda completar tu perfil primero.",
}) => {
  return (
    <Link to={to} className="group block h-full">
      <div
        className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all h-full ${
          isSoftLocked
            ? "bg-slate-900/40 border-slate-800 opacity-80 hover:opacity-100"
            : "bg-slate-800/40 border-slate-700 hover:border-teal-500/50 hover:bg-slate-800 shadow-sm"
        }`}
      >
        {isSoftLocked && (
          <div className="absolute top-4 right-4 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
              Sugerido
            </span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div
            className={`p-3 rounded-xl w-fit transition-colors ${
              isSoftLocked
                ? "bg-slate-800 text-slate-500"
                : "bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white"
            }`}
          >
            <Icon size={24} />
          </div>

          <div>
            <h4 className="text-white font-bold text-xl mb-1 group-hover:text-teal-400 transition-colors">
              {title}
            </h4>
            <p className="text-slate-400 text-sm leading-snug">{desc}</p>

            {isSoftLocked && (
              <p className="mt-3 text-xs text-yellow-500/70 italic font-medium">
                {lockedText}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center text-xs font-bold text-teal-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
          {buttonText}
          <ArrowRight size={14} className="ml-2" />
        </div>
      </div>
    </Link>
  );
};

// =======================================================
// WELCOME PARA USUARIO SIN PESO
// =======================================================

const WelcomeMission = ({ onOpenSOS }) => (
  <div className="col-span-1 lg:col-span-3 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
    <div className="absolute top-0 right-0 p-10 opacity-5 text-white">
      <Cpu size={250} />
    </div>

    <div className="relative z-10 max-w-4xl">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">
          Configuración inicial
        </p>

        <h2 className="text-3xl font-bold text-white mb-2">
          Prepara tu sistema
        </h2>

        <p className="text-indigo-200 text-lg leading-relaxed max-w-3xl">
          Antes de entrar de lleno, completa tu punto de partida. Esto permite
          que la plataforma use tus datos reales para ajustar menús,
          hidratación y seguimiento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/plataforma/bitacora"
          className="flex flex-col p-5 bg-indigo-900/40 hover:bg-indigo-900/70 border border-indigo-500/40 rounded-xl transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
              1
            </div>
            <Activity size={22} className="text-indigo-300" />
          </div>

          <h4 className="text-white font-bold mb-1">
            Registra tu punto de partida
          </h4>

          <p className="text-slate-300 text-sm">
            Peso, energía y sueño. Esto activa la personalización.
          </p>

          <span className="text-indigo-300 text-xs font-bold mt-4 uppercase">
            Empezar aquí →
          </span>
        </Link>

        <Link
          to="/plataforma/planeador"
          className="flex flex-col p-5 bg-slate-800/80 hover:bg-teal-900/50 border border-slate-700 hover:border-teal-500/30 rounded-xl transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold">
              2
            </div>
            <Calendar size={22} className="text-teal-400" />
          </div>

          <h4 className="text-white font-bold mb-1">
            Explora el planeador
          </h4>

          <p className="text-slate-400 text-sm">
            Puedes revisarlo desde ahora. Será más preciso al completar tu
            perfil.
          </p>

          <span className="text-teal-400 text-xs font-bold mt-4 uppercase">
            Ir al planeador →
          </span>
        </Link>

        <button
          onClick={onOpenSOS}
          className="flex flex-col p-5 bg-slate-800/80 hover:bg-red-900/40 border border-slate-700 hover:border-red-500/30 rounded-xl transition-all text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold">
              3
            </div>
            <LifeBuoy size={22} className="text-red-400" />
          </div>

          <h4 className="text-white font-bold mb-1">
            Aprende a controlar antojos
          </h4>

          <p className="text-slate-400 text-sm">
            Usa este protocolo cuando sientas que vas a romper el plan.
          </p>

          <span className="text-red-400 text-xs font-bold mt-4 uppercase">
            Ver protocolo →
          </span>
        </button>
      </div>
    </div>
  </div>
);

// =======================================================
// DASHBOARD PRINCIPAL
// =======================================================

export default function DashboardHome({ user }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [localName, setLocalName] = useState("");
  const [showSOS, setShowSOS] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(null);

  const [latestWeight, setLatestWeight] = useState(null);
  const [weightTrend, setWeightTrend] = useState([]);
  const [trackerData, setTrackerData] = useState({
    agua_vasos: 0,
    tareas_completadas: [],
  });

  const cleanName = localName || user?.user_metadata?.full_name;
  const displayName =
    cleanName && cleanName.trim() !== "" ? cleanName : "Campeón";

  const userProfile = user?.user_metadata || {};

  const isCalibrated =
    latestWeight !== null ||
    userProfile?.hasCompletedOnboarding ||
    userProfile?.goal;

  const daysSinceJoin = useMemo(() => {
    if (!user?.created_at) return 1;

    const created = new Date(user.created_at);
    const today = new Date();
    const diffTime = Math.abs(today - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays || 1;
  }, [user]);

  const [diaActivo, setDiaActivo] = useState(daysSinceJoin);

  useEffect(() => {
    setDiaActivo(daysSinceJoin);
  }, [daysSinceJoin]);

  const protocoloDia = useMemo(() => {
    if (diaActivo <= 14) {
      return {
        titulo: "Tu misión de hoy",
        subtitulo: "Fase 1: Inmersión metabólica",
        tareas: [
          "Registrar peso, energía y sueño",
          "Planificar tus comidas del día",
          "Cerrar el día sin azúcar ni harinas",
        ],
      };
    }

    if (diaActivo <= 28) {
      return {
        titulo: "Tu misión de hoy",
        subtitulo: "Fase 2: Consolidación y control de impulsos",
        tareas: [
          "Completar registro en Bitácora",
          "Mantener ventana de alimentación 14:10",
          "Realizar movimiento de fuerza",
        ],
      };
    }

    return {
      titulo: "Tu misión de hoy",
      subtitulo: "Fase 3: Optimización metabólica",
      tareas: [
        "Registrar estado del día",
        "Entrenar fuerza o caminar 20 minutos",
        "Aplicar un protocolo avanzado",
      ],
    };
  }, [diaActivo]);

  const fasesSistema = [
    {
      id: 1,
      nombre: "Fase 1: Inmersión",
      dias: "Días 1-14",
      status: "active",
      objetivo: "Desinflamación y adaptación.",
    },
    {
      id: 2,
      nombre: "Fase 2: Dominio Mental",
      dias: "Días 15-28",
      status: daysSinceJoin >= 15 ? "unlocked" : "locked",
      objetivo: "Control de ansiedad y hambre.",
      teaser: "Desbloquea: Neuro-Entrenamiento",
    },
    {
      id: 3,
      nombre: "Fase 3: Aceleración",
      dias: "Día 29+",
      status: daysSinceJoin >= 29 ? "unlocked" : "locked",
      objetivo: "Quema de grasa profunda.",
      teaser: "Desbloquea: Protocolos Avanzados",
    },
  ];

  const handlePhaseClick = (fase) => {
    if (fase.status === "locked") {
      alert(
        "🔒 Esta fase se desbloquea conforme avances. Sigue tu misión diaria."
      );
      return;
    }

    if (fase.id > 1) {
      setShowPhaseModal(fase.id);
    }
  };

  const calculationWeight = latestWeight || 70;
  const dailyMl = calculationWeight * 35;
  const targetGlasses = Math.ceil(dailyMl / 250);
  const liters = (dailyMl / 1000).toFixed(1);
  const percentHydration = Math.min(
    100,
    Math.round((trackerData.agua_vasos / targetGlasses) * 100)
  );

  useEffect(() => {
    if (user && !user.user_metadata?.full_name && !localName) {
      setShowOnboarding(true);
    }

    if (user) {
      fetchWeightData();
      fetchTrackerData();
    }
  }, [user, localName, diaActivo]);

  const handleOnboardingComplete = (newName) => {
    setLocalName(newName);
    setShowOnboarding(false);
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
      .eq("dia_numero", diaActivo)
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
        dia_numero: diaActivo,
        ...updates,
        updated_at: new Date(),
      },
      { onConflict: "user_id, dia_numero" }
    );
  };

  const toggleTarea = (tarea) => {
    const actuales = trackerData.tareas_completadas || [];

    const nuevaLista = actuales.includes(tarea)
      ? actuales.filter((t) => t !== tarea)
      : [...actuales, tarea];

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

      {showPhaseModal && (
        <PhaseModal
          phaseId={showPhaseModal}
          onClose={() => setShowPhaseModal(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Hola, {displayName}{" "}
            <span className="animate-wave inline-block">👋</span>
          </h1>

          <p className="text-slate-400 mt-2 text-lg">
            {isCalibrated ? (
              <>
                Estás en{" "}
                <span className="text-teal-400 font-bold">Modo Reinicio</span>
              </>
            ) : (
              <span className="text-indigo-400 font-bold">
                Personalizando tu experiencia...
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => setShowSOS(true)}
          className="w-full md:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"
        >
          <AlertTriangle size={18} />
          Control de antojos
        </button>
      </div>

      <MissionBriefing latestWeight={latestWeight} userProfile={userProfile} />

      {/* ACCIÓN PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {!isCalibrated ? (
          <WelcomeMission onOpenSOS={() => setShowSOS(true)} />
        ) : (
          <>
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="mb-6">
                  <p className="text-xs text-teal-400 uppercase tracking-widest font-bold mb-2">
                    Enfócate solo en esto
                  </p>

                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <Target className="text-teal-400" />
                    {protocoloDia.titulo}
                  </h3>

                  <p className="text-slate-400 text-sm">
                    {protocoloDia.subtitulo}. Completa estas acciones antes de
                    explorar otros módulos.
                  </p>
                </div>

                <div className="space-y-4">
                  {protocoloDia.tareas.map((tarea, idx) => {
                    const isDone = (
                      trackerData.tareas_completadas || []
                    ).includes(tarea);

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleTarea(tarea)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isDone
                            ? "bg-teal-500/10 border-teal-500/40"
                            : "bg-slate-950/40 border-slate-700/50 hover:border-slate-600"
                        }`}
                      >
                        <div
                          className={`transition-transform ${
                            isDone
                              ? "text-teal-400 scale-110"
                              : "text-slate-600"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="fill-current" size={24} />
                          ) : (
                            <Circle size={24} />
                          )}
                        </div>

                        <span
                          className={`flex-1 font-medium text-lg ${
                            isDone
                              ? "text-teal-100 line-through decoration-teal-500/50"
                              : "text-slate-200"
                          }`}
                        >
                          {tarea}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 w-full h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Droplets className="text-blue-400" />
                      Hidratación
                    </h3>

                    <p className="text-slate-400 text-xs mt-1">
                      Calculada para {latestWeight ? `tus ${latestWeight}kg` : "tu perfil inicial"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-blue-300 font-bold text-2xl">
                      {liters}L
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center my-4">
                  <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                    {trackerData.agua_vasos}
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

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() =>
                      updateTracker({
                        agua_vasos: Math.max(0, trackerData.agua_vasos - 1),
                      })
                    }
                    className="w-14 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700"
                  >
                    -
                  </button>

                  <button
                    onClick={() =>
                      updateTracker({
                        agua_vasos: trackerData.agua_vasos + 1,
                      })
                    }
                    className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/30"
                  >
                    + Registrar vaso
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ACCESOS SECUNDARIOS */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="text-yellow-400" />
            Accesos secundarios
          </h3>

          <p className="text-slate-400 text-sm mt-1">
            Úsalos para completar o reforzar tu misión del día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            to="/plataforma/planeador"
            icon={Calendar}
            title="Planeador"
            desc="Organiza tu menú semanal."
            buttonText="Ver menú"
            isSoftLocked={!isCalibrated}
            lockedText="Será más preciso después de completar tu perfil inicial."
          />

          <QuickAction
            to="/plataforma/bitacora"
            icon={BookHeart}
            title="Bitácora"
            desc="Registra peso, energía y sueño."
            buttonText="Registrar"
          />

          <QuickAction
            to="/plataforma/gimnasio"
            icon={Dumbbell}
            title="Gimnasio"
            desc="Rutina base disponible desde el día uno."
            buttonText="Entrenar"
          />

          <button
            onClick={() => setShowCheckin(true)}
            className="group flex flex-col justify-between p-6 rounded-2xl bg-indigo-900/20 border border-indigo-500/30 hover:bg-indigo-900/40 hover:border-indigo-400 transition-all h-full text-left"
          >
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors w-fit">
                <ClipboardCheck className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-white font-bold text-xl mb-1 group-hover:text-indigo-300 transition-colors">
                  Consulta semanal
                </h4>

                <p className="text-sm text-slate-400 leading-snug">
                  Revisa tu progreso y ajusta la semana.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center text-xs font-bold text-indigo-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
              Iniciar consulta
              <ArrowRight size={14} className="ml-2" />
            </div>
          </button>
        </div>
      </div>

      {/* GRÁFICA */}
      {latestWeight !== null && (
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl flex flex-col h-96 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-teal-400" />
              Tu transformación
            </h3>

            <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              Últimos 7 registros
            </span>
          </div>

          <div className="flex-1 w-full min-h-0 relative z-10">
            {weightTrend.length > 0 ? (
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
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-base border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/50">
                <Activity size={40} className="mb-3 opacity-50" />
                <p>Registra tu primer peso para ver tu evolución.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RUTA COMPLETA */}
      <div>
        <div className="mb-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="text-indigo-400" />
            Ruta completa del programa
          </h3>

          <p className="text-slate-400 text-sm mt-1">
            Esto muestra hacia dónde vas. Para avanzar hoy, sigue primero tu
            misión diaria.
          </p>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {fasesSistema.map((fase) => (
              <div
                key={fase.id}
                onClick={() => handlePhaseClick(fase)}
                className={`relative w-72 p-5 rounded-2xl border transition-all cursor-pointer hover:scale-105 ${
                  fase.status === "active" || fase.status === "unlocked"
                    ? "bg-gradient-to-br from-indigo-900/80 to-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-900/20"
                    : "bg-slate-900/50 border-slate-800 opacity-60"
                }`}
              >
                {fase.status === "locked" ? (
                  <div className="absolute top-3 right-3 text-slate-500">
                    <Lock size={16} />
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 text-indigo-400">
                    <Unlock size={16} />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      fase.status !== "locked"
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {fase.dias}
                  </span>

                  {fase.status === "active" && (
                    <span className="text-[10px] text-indigo-300 font-bold animate-pulse">
                      ● ACTIVO
                    </span>
                  )}

                  {fase.status === "unlocked" && (
                    <span className="text-[10px] text-emerald-400 font-bold">
                      ✓ COMPLETADO
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">
                  {fase.nombre}
                </h3>

                <p className="text-xs text-slate-400 mb-3">{fase.objetivo}</p>

                {fase.status === "locked" && (
                  <div className="mt-2 p-2 bg-slate-950/50 rounded border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                    <Lock size={12} />
                    {fase.teaser}
                  </div>
                )}

                {fase.status !== "locked" && fase.id > 1 && (
                  <div className="mt-2 p-2 bg-indigo-900/40 rounded border border-indigo-500/30 flex items-center gap-2 text-xs text-indigo-200">
                    <Brain size={12} />
                    Ver contenido exclusivo
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ChefDanteWidget />
    </div>
  );
}