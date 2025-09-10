// Contenido para: /api/ping.js
export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    method: req.method,
    hint: "Si ves esto en producción, las funciones están vivas."
  });
}
