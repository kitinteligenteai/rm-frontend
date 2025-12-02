// src/pages/MisCompras.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { Download, Loader2, Package, AlertTriangle } from "lucide-react";

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
        setError("No pudimos cargar tus productos.");
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
      if (!session?.access_token) throw new Error("Debes iniciar sesión.");
      
      const res = await fetch(`https://mgjzlohapnepvrqlxmpo.functions.supabase.co/download-product`, { // Ajusta URL si tienes una función específica o usa link directo
         // NOTA: Si no tienes función de descarga, aquí iría la lógica directa.
         // Por ahora simulamos un link directo si es el PDF
         method: 'POST',
         headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
         body: JSON.stringify({ productId })
      });
      
      // Si no tienes la función 'download-product', temporalmente redirigimos al PDF público si es el kit
      if (productId === 'kit-7-dias') {
          window.location.href = "/kit-7-dias.pdf"; // Asumiendo que está en public
          return;
      }
      
      // ... resto de lógica de descarga
    } catch (err) {
      // Fallback simple para el MVP
      if (productId.includes('kit')) window.open("/kit-7-dias.pdf", "_blank");
      else alert("Descarga disponible próximamente en la plataforma.");
    } finally {
      setDownloading(null);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin w-8 h-8 text-teal-500" /></div>;
    
    if (entitlements.length === 0) {
      return (
        <div className="text-center text-slate-400 mt-20 bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
          <Package className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <p className="text-lg font-semibold text-white">Tu biblioteca está vacía</p>
          <p className="text-sm mt-2">Tus productos comprados aparecerán aquí.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {entitlements.map((item) => (
          <div key={item.product_id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-3">
                <Package className="w-6 h-6 text-teal-400 mr-3" />
                <h2 className="text-xl font-semibold text-white capitalize">{item.product_id.replace(/-/g, ' ')}</h2>
              </div>
              <p className="text-sm text-slate-400">Acceso activo.</p>
            </div>
            <button onClick={() => handleDownload(item.product_id)} className="mt-6 w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-500 transition-all flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" /> Descargar / Acceder
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mis Compras</h1>
        <p className="text-slate-400 mb-8">Gestiona tus productos y descargas.</p>
        {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6 flex items-center"><AlertTriangle className="w-5 h-5 mr-3" />{error}</div>}
        {renderContent()}
      </div>
    </div>
  );
};

export default MisCompras;