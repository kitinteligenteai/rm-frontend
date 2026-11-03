export function SaveStatus({ status, retry, resolve }) {
  return (
    <div role="status" className="text-xs text-slate-400 my-3">
      {status === "loading"
        ? "Cargando tus datos…"
        : status === "saved"
          ? "Guardado en tu cuenta."
          : status === "saving"
            ? "Guardando…"
            : status === "conflict"
              ? "Hay cambios distintos en este navegador y en tu cuenta. No sobrescribiremos ninguno automáticamente."
              : status === "unavailable"
                ? "No pudimos cargar tus datos. Reintenta antes de editar."
                : status === "unsaved"
                  ? "No se guardaron los cambios. No cierres esta pantalla; reintenta."
                  : "Sin sincronizar. Conserva este navegador y reintenta."}
      {["local", "unsaved", "unavailable"].includes(status) && (
        <button onClick={retry} className="ml-2 underline text-teal-300">
          Reintentar
        </button>
      )}
      {status === "conflict" && resolve && (
        <button onClick={resolve} className="ml-2 underline text-teal-300 py-2">
          Cargar versión de mi cuenta y conservar copia local
        </button>
      )}
    </div>
  );
}
