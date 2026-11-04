export function emailTemplate(
  template: string,
  link: string,
  siteUrl = "https://www.reiniciometabolico.net",
) {
  const program = template === "welcome-program";
  if (!program && !["welcome-kit", "welcome_kit_7_dias"].includes(template))
    throw Error("unknown_template");
  const title = program ? "Tu Programa Completo" : "Tu Kit de 7 días";
  const text = program
    ? "Abre el enlace para crear tu contraseña. Si ya tienes cuenta, entra con tu correo de compra."
    : "Abre el enlace y descarga tu guía. Puedes guardarla en tu dispositivo.";
  return {
    subject: `${title} – Reinicio Metabólico`,
    text: `${title}\n${text}\n${link}\nSoporte: soporte@reiniciometabolico.net`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#163332;max-width:560px;margin:auto;padding:24px"><h1>${title}</h1><p>${text}</p><p><a href="${link.replaceAll("&", "&amp;")}" style="background:#007f78;color:white;padding:15px;display:inline-block;border-radius:8px">${program ? "Crear contraseña y entrar" : "Descargar mi Kit"}</a></p><p>Si el enlace caduca, solicita otro desde <a href="${siteUrl}/auth?mode=reset">Recuperar acceso</a>.</p><p>Soporte: soporte@reiniciometabolico.net</p></div>`,
  };
}
export async function sendResend(
  apiKey: string,
  id: string,
  body: any,
  fetcher = fetch,
) {
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `rm-outbox/${id}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || !data.id) throw Error(`delivery_${response.status}`);
  return data.id;
}
