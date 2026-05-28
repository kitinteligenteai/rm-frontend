// src/pages/Terminos.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Terminos() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-teal-300 hover:text-teal-200">
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-white">
          Términos y Condiciones
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Última actualización: 28 de mayo de 2026
        </p>

        <section className="mt-8 space-y-5 text-sm leading-7 text-slate-300">
          <p>
            Estos Términos y Condiciones regulan el uso del sitio
            reiniciometabolico.net y la compra de productos digitales ofrecidos
            por Reinicio Metabólico.
          </p>

          <h2 className="text-xl font-bold text-white">1. Naturaleza del producto</h2>
          <p>
            Reinicio Metabólico ofrece materiales digitales educativos sobre
            alimentación real, hábitos, organización de comidas, movimiento y
            bienestar general. El Kit de 7 Días y el Programa Completo son
            productos digitales de acceso inmediato.
          </p>

          <h2 className="text-xl font-bold text-white">2. No es asesoría médica</h2>
          <p>
            El contenido de Reinicio Metabólico tiene fines informativos y
            educativos. No sustituye diagnóstico, tratamiento, consulta médica,
            nutricional, psicológica ni indicaciones de un profesional de salud.
            Si tienes una condición médica, embarazo, lactancia, tratamiento
            activo, diabetes, hipertensión, enfermedad renal, trastorno de la
            conducta alimentaria u otra situación clínica, consulta a tu
            profesional de salud antes de aplicar cambios.
          </p>

          <h2 className="text-xl font-bold text-white">3. Compra y entrega</h2>
          <p>
            Las compras se procesan mediante proveedores externos de pago,
            incluyendo Mercado Pago u otros procesadores disponibles. Una vez
            confirmado el pago, el sistema puede entregar acceso, descarga,
            correo transaccional o instrucciones de ingreso.
          </p>

          <h2 className="text-xl font-bold text-white">4. Precio y disponibilidad</h2>
          <p>
            Los precios, promociones, bonos y condiciones de acceso pueden
            cambiar. El precio aplicable será el mostrado al momento de la
            compra y confirmado por el procesador de pago.
          </p>

          <h2 className="text-xl font-bold text-white">5. Uso personal</h2>
          <p>
            Los materiales son para uso personal del comprador. No está
            permitido revender, redistribuir, publicar, copiar masivamente o
            compartir el acceso de forma pública sin autorización.
          </p>

          <h2 className="text-xl font-bold text-white">6. Resultados</h2>
          <p>
            Los resultados pueden variar según contexto personal, adherencia,
            salud previa, descanso, actividad física, alimentación y otros
            factores. No garantizamos resultados específicos de peso, salud,
            composición corporal o rendimiento.
          </p>

          <h2 className="text-xl font-bold text-white">7. Soporte</h2>
          <p>
            Para dudas de acceso, compra o entrega digital, puedes escribir a:
            soporte@reiniciometabolico.net.
          </p>

          <h2 className="text-xl font-bold text-white">8. Cambios a estos términos</h2>
          <p>
            Podemos actualizar estos términos para reflejar cambios del producto,
            operación o requisitos legales. La versión vigente será la publicada
            en esta página.
          </p>
        </section>
      </div>
    </main>
  );
}