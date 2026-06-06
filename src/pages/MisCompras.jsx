// src/pages/MisCompras.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, BookOpen, Download, Loader2, Package } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import { supabase } from "../lib/supabaseClient.js";

const KIT_PDF_URL = "/kits/kit-7-dias.pdf";

const PRODUCT_COPY = {
  "kit-7-dias": {
    title: "Kit de 7 Días",
    description: "Tu PDF de inicio con menú, guía práctica y plan de arranque.",
    button: "Descargar Kit",
    type: "download",
  },
  "programa-completo": {
    title: "Programa Completo",
    description:
      "Acceso activo a tu plataforma: planeador, recetas, bitácora, gimnasio y ruta guiada.",
    button: "Entrar al Programa",
    type: "program",
  },
};

function getProductCopy(productId) {
  if (!productId) {
    return {
      title: "Producto",
      description: "Acceso activo.",
      button: "Acceder",
      type: "unknown",
    };
  }

  if (PRODUCT_COPY[productId]) return PRODUCT_COPY[productId];

  if (productId.includes("kit")) {
    return PRODUCT_COPY["kit-7-dias"];
  }

  if (productId.includes("programa") || productId.includes("premium")) {
    return PRODUCT_COPY["programa-completo"];
  }

  return {
    title: productId.replace(/-/g, " "),
    description: "Acceso activo.",
    button: "Acceder",
    type: "unknown",
  };
}

const MisCompras = () => {
  const { user } = useUser();
  const navigate = useNavigate();

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
      setError("");

      const { data, error } = await supabase
        .from("my_entitlements")
        .select("*");

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

  const handleAccess = async (productId) => {
    setError("");
    setDownloading(productId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Debes iniciar sesión.");
      }

      const product = getProductCopy(productId);

      if (product.type === "download") {
        window.open(KIT_PDF_URL, "_blank");
        return;
      }

      if (product.type === "program") {
        navigate("/plataforma/panel-de-control");
        return;
      }

      navigate("/plataforma/panel-de-control");
    } catch (err) {
      console.error("Error accediendo al producto:", err);

      if (productId?.includes("kit")) {
        window.open(KIT_PDF_URL, "_blank");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "No pudimos abrir tu producto. Intenta de nuevo."
        );
      }
    } finally {
      setDownloading(null);
    }
  };

  const renderIcon = (type) => {
    if (type === "program") {
      return <BookOpen className="w-6 h-6 text-teal-400 mr-3" />;
    }

    return <Package className="w-6 h-6 text-teal-400 mr-3" />;
  };

  const renderButtonIcon = (type, productId) => {
    if (downloading === productId) {
      return <Loader2 className="w-4 h-4 mr-2 animate-spin" />;
    }

    if (type === "download") {
      return <Download className="w-4 h-4 mr-2" />;
    }

    return <ArrowRight className="w-4 h-4 mr-2" />;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center mt-20">
          <Loader2 className="animate-spin w-8 h-8 text-teal-500" />
        </div>
      );
    }

    if (entitlements.length === 0) {
      return (
        <div className="text-center text-slate-400 mt-20 bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
          <Package className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <p className="text-lg font-semibold text-white">
            Tu biblioteca está vacía
          </p>
          <p className="text-sm mt-2">
            Tus productos comprados aparecerán aquí.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {entitlements.map((item) => {
          const product = getProductCopy(item.product_id);

          return (
            <div
              key={item.product_id}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center mb-3">
                  {renderIcon(product.type)}
                  <h2 className="text-xl font-semibold text-white">
                    {product.title}
                  </h2>
                </div>

                <p className="text-sm text-slate-400 mb-3">
                  {product.description}
                </p>

                <div className="inline-flex items-center rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
                  Acceso activo
                </div>
              </div>

              <button
                onClick={() => handleAccess(item.product_id)}
                disabled={downloading === item.product_id}
                className="mt-6 w-full bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-teal-500 transition-all flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {renderButtonIcon(product.type, item.product_id)}
                {downloading === item.product_id
                  ? "Preparando..."
                  : product.button}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Mis Compras
        </h1>

        <p className="text-slate-400 mb-8">
          Aquí encuentras tus productos comprados y el acceso permanente a tu
          Programa.
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3 shrink-0" />
            {error}
          </div>
        )}

        {renderContent()}

        <div className="mt-10 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-sm text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-300 mb-1">
            Acceso al Programa Completo
          </p>
          <p>
            Después de activar tu cuenta, puedes volver siempre desde{" "}
            <strong className="text-white">reiniciometabolico.net</strong> e
            iniciar sesión con el mismo correo de compra.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MisCompras;