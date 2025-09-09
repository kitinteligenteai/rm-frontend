import React from "react";
import { motion } from "framer-motion";

const HeaderDashboard = ({ user, foco }) => {
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
        {saludo}, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Campeón"}
      </h1>
      <p className="text-lg text-cyan-400 mt-1">{foco}</p>
    </motion.header>
  );
};

export default HeaderDashboard;
