// src/pages/HomeMarca.jsx
// v1.1 - Home institucional Etsy-safe / sin enlace al Kit barato

import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  ShoppingCart,
  Utensils,
  Brain,
  Activity,
  ShieldCheck,
  Sparkles,
  LogIn,
  ClipboardCheck,
  AlertTriangle,
  HeartPulse,
  Flame,
  CircleDot,
  BookOpen,
  LifeBuoy,
  TrendingUp,
} from "lucide-react";
import LegalFooter from "../components/common/LegalFooter.jsx";

const PAIN_POINTS = [
  "Despiertas cansado aunque hayas dormido.",
  "Comes y al poco tiempo vuelves a tener hambre.",
  "Tienes antojos frecuentes, sobre todo de pan, azúcar o snacks.",
  "Te sientes pesado, inflamado o con mala digestión después de comer.",
  "Te cuesta concentrarte y tu energía sube y baja durante el día.",
  "Has probado dietas, pero terminas regresando al mismo punto.",
];

const PROGRAM_TOOLS = [
  {
    title: "Planeador semanal",
    desc: "Para organizar tus comidas y dejar de improvisar cuando llega el hambre o la prisa.",
    icon: ShoppingCart,
  },
  {
    title: "Recetas de comida real",
    desc: "Opciones prácticas para comer dentro del método sin sentir que repites siempre lo mismo.",
    icon: Utensils,
  },
  {
    title: "Gimnasio digital",
    desc: "Rutinas en casa con peso corporal, silla o mancuernas, sin depender de un gimnasio.",
    icon: Dumbbell,
  },
  {
    title: "Bitácora de avance",
    desc: "Seguimiento simple para observar peso, medidas, energía, sueño y tendencia.",
    icon: TrendingUp,
  },
  {
    title: "Biblioteca educativa",
    desc: "Contenido para entender la lógica del método: hambre, saciedad, insulina, músculo, sueño y hábitos.",
    icon: BookOpen,
  },
  {
    title: "Apoyo inteligente",
    desc: "Orientación práctica para momentos reales: antojos, eventos sociales, dudas o días difíciles.",
    icon: Brain,
  },
];

const METHOD_PRINCIPLES = [
  {
    title: "Menos improvisación",
    desc: "La mayoría no falla por falta de ganas. Falla porque llega el hambre y no hay plan.",
    icon: ClipboardCheck,
  },
  {
    title: "Comida real como base",
    desc: "El método se apoya en alimentos simples, saciantes y reconocibles.",
    icon: Utensils,
  },
  {
    title: "Estructura, no castigo",
    desc: "No se trata de vivir restringido, sino de tener dirección cuando la vida real aparece.",
    icon: ShieldCheck,
  },
  {
    title: "Movimiento posible",
    desc: "Actividad física progresiva para acompañar el cambio, sin extremos innecesarios.",
    icon: Dumbbell,
  },
];

export default function HomeMarca() {
  return (
    <div className="min-h-screen text-slate-100 font-sans bg-[#062f38] relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 620px at 20% 10%, rgba(45, 212, 191, 0.20), transparent 60%), radial-gradient(900px 520px at 90% 25%, rgba(14, 116, 144, 0.25), transparent 62%), linear-gradient(180deg, #073b46 0%, #052d35 45%, #031f26 100%)",
        }}
      />

      <header className="relative z-10 sticky top-0 backdrop-blur-md border-b border-white/10 bg-slate-950/10">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="block">
            <p className="text-[15px] font-extrabold tracking-tight">
              Reinicio Metabólico
            </p>
            <p className="text-[12.5px] text-white/70 -mt-0.5">
              Comida real. Energía. Dirección.
            </p>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/plataforma/panel-de-control"
              className="hidden sm:flex items-center gap-2 border border-white/15 hover:bg-white/10 px-4 py-2 rounded-full text-xs font-bold text-white transition-colors"
            >
              <LogIn size={14} />
              Acceso Programa
            </Link>

            <Link
              to="/programa"
              className="flex items-center gap-2 bg-teal-400 hover:bg-teal-300 px-4 py-2 rounded-full text-xs font-extrabold text-slate-950 transition-colors shadow-lg shadow-teal-500/20"
            >
              Programa Completo
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-[1180px] px-4 sm:px-6 pt-14 pb-12 lg:pt-20 lg:pb-18 grid grid-cols-1 lg:grid-cols-[1.06fr_0.94fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-[12.5px] text-teal-100">
              <Sparkles size={14} />
              Método práctico de alimentación y hábitos
            </div>

            <h1 className="mt-5 text-[39px] sm:text-[52px] lg:text-[64px] leading-[1.02] font-black tracking-tight text-[#E8FFFB]">
              Tu cuerpo no está roto.
              <span className="block text-teal-200">Está saturado.</span>
            </h1>

            <p className="mt-5 text-[17px] md:text-[19px] text-slate-200/90 max-w-[650px] leading-relaxed">
              Reinicio Metabólico es un método para recuperar dirección:
              ordenar tu alimentación, reducir la improvisación y construir un
              estilo de vida basado en comida real, movimiento y decisiones más
              claras.
            </p>

            <p className="mt-4 text-[15.5px] text-slate-300/90 max-w-[650px] leading-relaxed">
              Si llevas tiempo sintiéndote cansado, pesado, inflamado, con
              antojos, mala digestión o energía inestable, tal vez no te falta
              voluntad. Tal vez necesitas un sistema que te ayude a dejar de
              adivinar.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/programa"
                className="inline-flex items-center justify-center gap-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold px-6 py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20"
              >
                Conocer Programa Completo
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/plataforma/panel-de-control"
                className="inline-flex items-center justify-center gap-2 border border-white/15 bg-white/8 hover:bg-white/12 text-white font-bold px-6 py-4 rounded-xl transition-all"
              >
                Ya tengo acceso
                <LogIn size={18} />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/10 backdrop-blur-xl p-6 md:p-7 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-400/12 border border-teal-300/20 flex items-center justify-center text-teal-200">
                <AlertTriangle size={25} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-white">
                  ¿Te identificas?
                </h2>
                <p className="text-sm text-slate-300">
                  El problema rara vez es falta de intención.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {PAIN_POINTS.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-[2px] h-5 w-5 text-teal-300 flex-shrink-0" />
                  <span className="text-[15px] text-slate-50/95">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl bg-slate-950/35 border border-white/10 p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                La vida moderna está diseñada para que comas rápido, comas de
                más y comas sin darte cuenta. Reinicio Metabólico existe para
                devolverle estructura al proceso.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 sm:px-6 py-10">
          <div className="mb-7">
            <p className="text-xs text-teal-300 uppercase tracking-[0.22em] font-bold mb-2">
              El cambio real
            </p>

            <h2 className="text-3xl md:text-4xl font-black text-white">
              No empieza con más fuerza de voluntad.
            </h2>

            <p className="mt-3 text-slate-300 max-w-3xl leading-relaxed">
              Empieza cuando dejas de depender de la motivación y tienes una
              estructura clara para comer, comprar, moverte, registrar avances y
              retomar el rumbo cuando aparecen antojos, estrés o vida social.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {METHOD_PRINCIPLES.map(({ title, desc, icon: Icon }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-white/7 p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-300/10 border border-teal-300/20 flex items-center justify-center text-teal-200 mb-5">
                  <Icon size={24} />
                </div>

                <h3 className="text-xl font-extrabold text-white mb-2">
                  {title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 sm:px-6 py-10">
          <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-8 items-start">
              <div>
                <p className="text-xs text-teal-300 uppercase tracking-[0.22em] font-bold mb-2">
                  Programa Completo
                </p>

                <h2 className="text-3xl md:text-4xl font-black text-white">
                  Un método. Un sistema de aplicación.
                </h2>

                <p className="mt-4 text-slate-300 leading-relaxed">
                  El Programa Completo está diseñado para ayudarte a llevar el
                  método a la vida real: organizar tus comidas, resolver días
                  ocupados, moverte en casa, entender tu progreso y sostener
                  mejores decisiones sin vivir contando calorías.
                </p>

                <Link
                  to="/programa"
                  className="mt-7 inline-flex items-center justify-center gap-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold px-6 py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20"
                >
                  Ver Programa Completo
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROGRAM_TOOLS.map(({ title, desc, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/7 p-5 hover:border-teal-300/25 hover:bg-white/10 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-300/10 border border-teal-300/20 flex items-center justify-center text-teal-200 mb-4">
                      <Icon size={21} />
                    </div>

                    <h3 className="text-base font-extrabold text-white mb-1.5">
                      {title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 sm:px-6 py-10">
          <div className="rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-400/12 to-white/6 p-7 md:p-9">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-5 items-center">
              <div className="w-14 h-14 rounded-2xl bg-teal-300/12 border border-teal-300/20 flex items-center justify-center text-teal-200">
                <LifeBuoy size={28} />
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  ¿Ya tienes una guía o material de Reinicio Metabólico?
                </h2>

                <p className="mt-2 text-slate-300 leading-relaxed">
                  El siguiente paso es usar el sistema completo: herramientas,
                  planeador, recetas, gimnasio digital, bitácora, biblioteca y
                  apoyo práctico para aplicar el método en tu vida diaria.
                </p>
              </div>

              <Link
                to="/programa"
                className="inline-flex items-center justify-center gap-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold px-6 py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20"
              >
                Continuar al Programa
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 sm:px-6 py-10">
          <div className="rounded-3xl border border-yellow-300/20 bg-yellow-300/8 p-5 md:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-200 mt-0.5 flex-shrink-0" />
              <p className="text-xs md:text-sm text-yellow-50/85 leading-relaxed">
                Reinicio Metabólico es un programa educativo de alimentación,
                hábitos y organización personal. No sustituye atención médica,
                nutricional o psicológica. Si tienes diabetes, hipertensión,
                enfermedad renal, enfermedad cardiovascular, embarazo,
                trastornos de la conducta alimentaria o tomas medicamentos,
                consulta a tu médico antes de hacer cambios importantes en
                alimentación, ayuno, suplementos o actividad física.
              </p>
            </div>
          </div>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}