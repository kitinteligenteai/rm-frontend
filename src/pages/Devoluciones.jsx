// src/pages/Devoluciones.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Devoluciones() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-teal-300 hover:text-teal-200">
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-white">
          Política de Devoluciones
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Última actualización: 28 de mayo de 2026
        </p>

        <section className="mt-8 space-y-5 text-sm leading-7 text-slate-300">
          <p>
            Esta política describe las condiciones generales de devoluciones,
            aclaraciones y soporte para productos digitales adquiridos en
            Reinicio Metabólico.
          </p>

          <h2 className="text-xl font-bold text-white">1. Producto digital</h2>
          <p>
            El Kit de 7 Días y el Programa Completo son productos digitales. Una
            vez confirmado el pago, el usuario puede recibir acceso inmediato,
            descarga, correo de entrega o instrucciones de ingreso.
          </p>

          <h2 className="text-xl font-bold text-white">2. Problemas de acceso</h2>
          <p>
            Si realizaste una compra y no recibiste el correo, enlace, acceso o
            confirmación correspondiente, escríbenos a
            soporte@reiniciometabolico.net con el correo usado en la compra y,
            si lo tienes, el comprobante o identificador del pago.
          </p>

          <h2 className="text-xl font-bold text-white">3. Revisión de casos</h2>
          <p>
            Revisaremos los casos relacionados con cargos duplicados, falta de
            entrega, errores técnicos, imposibilidad de acceso o discrepancias
            entre el pago y el producto recibido.
          </p>

          <h2 className="text-xl font-bold text-white">4. Devoluciones</h2>
          <p>
            Las solicitudes de devolución se revisarán caso por caso. En
            productos digitales con acceso inmediato, podremos validar si el
            acceso fue entregado, si existió falla técnica o si hubo un cargo
            incorrecto o duplicado.
          </p>

          <h2 className="text-xl font-bold text-white">5. Procesador de pago</h2>
          <p>
            Algunos reembolsos, aclaraciones o contracargos pueden depender de
            los tiempos y políticas del procesador de pago utilizado, como
            Mercado Pago u otro proveedor disponible al momento de la compra.
          </p>

          <h2 className="text-xl font-bold text-white">6. Contacto</h2>
          <p>
            Para soporte de compra, acceso o devolución, escribe a:
            soporte@reiniciometabolico.net.
          </p>
        </section>
      </div>
    </main>
  );
}