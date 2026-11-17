// RUTA: src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import App from "./App.jsx";                // O "./pages/App.jsx" si así lo tienes
ReactDOM.createRoot(document.getElementById("root")).render(
  // ⚠️ SIN React.StrictMode para evitar el doble-montaje en dev
  <App />
);
