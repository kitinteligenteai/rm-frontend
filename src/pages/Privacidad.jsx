// src/pages/Privacidad.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Privacidad() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-teal-300 hover:text-teal-200">
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-white">
          Aviso de Privacidad
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Última actualización: 28 de mayo de 2026
        </p>

        <section className="mt-8 space-y-5 text-sm leading-7 text-slate-300">
          <p>
            Este Aviso de Privacidad explica cómo Reinicio Metabólico trata los
            datos personales proporcionados por usuarios, compradores o
            visitantes del sitio reiniciometabolico.net.
          </p>

          <h2 className="text-xl font-bold text-white">1. Datos que podemos recabar</h2>
          <p>
            Podemos recabar datos como nombre, correo electrónico, información de
            compra, identificadores de pago, estado de acceso, actividad básica
            dentro de la plataforma y datos que el usuario proporcione
            voluntariamente en formularios, bitácoras o herramientas internas.
          </p>

          <h2 className="text-xl font-bold text-white">2. Finalidades</h2>
          <p>
            Usamos los datos para procesar compras, entregar productos digitales,
            administrar accesos, enviar correos transaccionales, responder
            soporte, mejorar la experiencia del producto, prevenir fraude,
            mantener seguridad operativa y cumplir obligaciones aplicables.
          </p>

          <h2 className="text-xl font-bold text-white">3. Datos de salud y bienestar</h2>
          <p>
            Algunas herramientas pueden permitir que el usuario registre datos
            relacionados con hábitos, progreso o bienestar. Estos datos se usan
            para mostrar seguimiento dentro de la plataforma. No deben usarse
            como expediente médico ni sustituyen atención profesional.
          </p>

          <h2 className="text-xl font-bold text-white">4. Servicios externos</h2>
          <p>
            Podemos utilizar proveedores como Supabase, Vercel, Mercado Pago,
            Resend, Zoho u otros servicios necesarios para operar pagos,
            autenticación, hosting, correo y soporte. Cada proveedor puede tratar
            datos conforme a sus propias políticas y medidas de seguridad.
          </p>

          <h2 className="text-xl font-bold text-white">5. Derechos del usuario</h2>
          <p>
            El usuario puede solicitar acceso, corrección, actualización o
            eliminación de sus datos cuando corresponda. Para ejercer estos
            derechos, puede escribir a soporte@reiniciometabolico.net indicando
            el correo asociado a su compra o cuenta.
          </p>

          <h2 className="text-xl font-bold text-white">6. Seguridad</h2>
          <p>
            Aplicamos medidas razonables de seguridad técnica y operativa para
            proteger los datos. Ningún sistema digital es completamente inmune a
            incidentes, pero trabajamos bajo principios de mínimo privilegio,
            trazabilidad y recuperación.
          </p>

          <h2 className="text-xl font-bold text-white">7. Conservación</h2>
          <p>
            Conservamos los datos durante el tiempo necesario para cumplir las
            finalidades descritas, mantener evidencia de compra, atender soporte,
            prevenir abuso o cumplir obligaciones legales.
          </p>

          <h2 className="text-xl font-bold text-white">8. Contacto</h2>
          <p>
            Para privacidad, soporte o derechos relacionados con datos personales:
            soporte@reiniciometabolico.net.
          </p>

          <h2 className="text-xl font-bold text-white">9. Cambios al aviso</h2>
          <p>
            Este aviso puede actualizarse. La versión vigente será la publicada
            en esta página.
          </p>
        </section>
      </div>
    </main>
  );
}