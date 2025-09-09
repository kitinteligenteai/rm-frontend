import React from "react";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext.jsx";

import HeaderDashboard from "../components/dashboard/HeaderDashboard";
import PlanHoyCard from "../components/dashboard/PlanHoyCard";
import ProgresoCard from "../components/dashboard/ProgresoCard";
import DescubrimientoCard from "../components/dashboard/DescubrimientoCard";
import AtajosCard from "../components/dashboard/AtajosCard";

// --- Datos MOCK para desarrollo ---
const mockPlanDeHoy = {
  foco: "Entrenamiento de fuerza y alta proteína",
  entrenamiento: { id: "r1", title: "Día 3: Piernas y Glúteos", duration: 45 },
  checklist: [
    { id: "c1", text: "Beber 3L de agua", done: true },
    { id: "c2", text: "Completar rutina de hoy", done: false },
    { id: "c3", text: "Registrar mis comidas", done: false },
  ],
};
const mockProgresoSemanal = { metricName: "Peso", currentValue: 85.8, delta7d: -0.7 };
const mockDescubrimiento = {
  type: "receta",
  payload: { id: "r12", title: "Salmón a la parrilla con espárragos", image: "https://source.unsplash.com/random/600x400/?salmon,healthy" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, ease: "easeOut" } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } },
};

const PanelPrincipal = ( ) => {
  const { user } = useUser();

  return (
    <motion.div className="p-4 sm:p-6 lg:p-8" variants={containerVariants} initial="hidden" animate="visible">
      <HeaderDashboard user={user} foco={mockPlanDeHoy.foco} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}><PlanHoyCard data={mockPlanDeHoy} /></motion.div>
          <motion.div variants={itemVariants}><AtajosCard /></motion.div>
        </div>
        <div className="space-y-6">
          <motion.div variants={itemVariants}><ProgresoCard data={mockProgresoSemanal} /></motion.div>
          <motion.div variants={itemVariants}><DescubrimientoCard data={mockDescubrimiento} /></motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PanelPrincipal;
