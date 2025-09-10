// Contenido COMPLETO y LISTO para: src/pages/MisCompras.jsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { Download, Loader2, Package, AlertTriangle } from "lucide-react";
import DashboardLayout from "./DashboardLayout.jsx";

const MisCompras = () => {
  const { user } = useUser();
  const [entitlements, setEntitlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEntitlements = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.from("my_entitlements").select("*");
      if (error) {
        console.error("Error fetching entitlements:", error);
        setError("No pudimos cargar tus productos. Intenta de nuevo más tarde.");
      } else {
        setEntitlements(data || []);
      }
      setLoading(false);
    };
    fetchEntitlements();
  }, [user]);

  const handleDownload = async (productId) => {
    setError("");
    setDownloading(productId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Debes iniciar sesión para descargar.");
      
      const res = await fetch(`/api/download/${productId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "No se pudo generar la descarga.");
      
      window.location.href = data.url;
    } catch (err) {
      console.error("Download error:", err);
      setError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center text-slate-300 mt-20">
          <Loader2 className="animate-spin w-6 h-6 mr-3" />
          Cargando tus productos...
        </div>
      );
    }
    if (!user) {
        return (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-400 mt-20 bg-slate-800/50 p-8 rounded-2xl">
                <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                <p className="text-lg font-semibold text-white">Acceso Restringido</p>
                <p className="text-sm mt-2">Por favor, inicia sesión para ver tus compras.</p>
            </motion.div>
        );
    }
    if (entitlements.length === 0) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-400 mt-20 bg-slate-800/50 p-8 rounded-2xl">
          <Package className="w-12 h-12 mx-auto text-slate-500 mb-4" />
          <p className="text-lg font-semibold text-white">Tu biblioteca está vacía</p>
          <p className="text-sm mt-2">Cuando adquieras un producto, aparecerá aquí listo para descargar.</p>
        </motion.div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <AnimatePresence>
          {entitlements.map((item) => (
            <motion.div key={item.product_id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-3">
                  <Package className="w-6 h-6 text-teal-400 mr-3" />
                  <h2 className="text-xl font-semibold text-white capitalize">{item.product_id === "kit-7" ? "Kit de Inicio (7 días)" : item.product_id.replace('-', ' ')}</h2>
                </div>
                <p className={`text-sm ${item.status === "active" ? "text-slate-400" : "text-red-400"}`}>{item.status === "active" ? "Acceso activo a este producto digital." : "Acceso revocado o inactivo."}</p>
              </div>
              {item.status === "active" && (
                <button onClick={() => handleDownload(item.product_id)} disabled={downloading !== null} className="mt-6 w-full bg-teal-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-teal-500 transition-all duration-300 flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed">
                  {downloading === item.product_id ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                  {downloading === item.product_id ? 'Generando...' : 'Descargar'}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Mis Compras</h1>
          <p className="text-slate-400 mb-8">Aquí encontrarás todos tus productos adquiridos.</p>
          {error && <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6 flex items-center"><AlertTriangle className="w-5 h-5 mr-3" />{error}</div>}
          {renderContent()}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default MisCompras;
