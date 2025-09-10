// Contenido de PRUEBA para: /api/generate-payment.js
export default async function handler(req, res) {
  console.log("generate-payment method:", req.method);

  // Permitimos GET y POST solo para pruebas
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // GET: prueba rápida en navegador
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, note: "GET ok. Ahora prueba POST desde el botón." });
  }

  try {
    // Versión de prueba: devolvemos un preferenceId falso
    // En el frontend, el componente espera una propiedad "id", no "preferenceId"
    return res.status(201).json({ ok: true, id: "TEST-PREF-123" });
  } catch (err) {
    console.error("generate-payment error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
