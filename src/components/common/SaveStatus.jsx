export function SaveStatus({ status, retry }) {
  return (
    <div role="status" className="text-xs text-slate-400 my-3">
      {status === "loading"
        ? "Cargando tus datos…"
        : status === "saved"
          ? "Guardado en tu cuenta."
          : status === "saving"
            ? "Guardando…"
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
    </div>
  );
}
