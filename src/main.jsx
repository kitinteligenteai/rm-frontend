// RUTA: src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import App from "./App.jsx";                // O "./pages/App.jsx" si así lo tienes
import { UserProvider } from "./context/UserContext.jsx";

import { initMercadoPago } from "@mercadopago/sdk-react";
const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
if (publicKey) {
  initMercadoPago(publicKey, { locale: "es-MX" });
} else {
  console.warn("VITE_MERCADOPAGO_PUBLIC_KEY no está definida.");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  // ⚠️ SIN React.StrictMode para evitar el doble-montaje en dev
  <UserProvider>
    <App />
  </UserProvider>
);
