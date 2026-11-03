import { useEffect, useRef, useState } from "react";
export default function ExerciseTimer({
  duration = 30,
  initialRemaining,
  onCheckpoint = () => {},
  onComplete = () => {},
}) {
  const [remaining, setRemaining] = useState(
    Number.isFinite(initialRemaining)
      ? Math.max(0, Math.min(duration, initialRemaining))
      : duration,
  );
  const [running, setRunning] = useState(false);
  const deadline = useRef(null);
  const callback = useRef(onComplete);
  const fired = useRef(false);
  useEffect(() => {
    callback.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    setRemaining(
      Number.isFinite(initialRemaining)
        ? Math.max(0, Math.min(duration, initialRemaining))
        : duration,
    );
    setRunning(false);
    deadline.current = null;
    fired.current = false;
    // A checkpoint is only an initial value. Parent saves must not reset a running clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        if (!fired.current) {
          fired.current = true;
          callback.current();
        }
      }
    };
    const timer = setInterval(tick, 200);
    document.addEventListener("visibilitychange", tick);
    tick();
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [running]);
  function toggle() {
    if (running) {
      const left = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setRemaining(left);
      onCheckpoint(left);
      setRunning(false);
    } else if (remaining > 0) {
      deadline.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  }
  function reset() {
    setRunning(false);
    setRemaining(duration);
    deadline.current = null;
    fired.current = false;
    onCheckpoint(duration);
  }
  return (
    <div className="flex gap-2 items-center min-h-12">
      <output
        aria-live="off"
        className="font-mono tabular-nums text-xl w-20 shrink-0"
        aria-label="Tiempo restante"
      >
        {String(Math.floor(remaining / 60)).padStart(2, "0")}:
        {String(remaining % 60).padStart(2, "0")}
      </output>
      <button
        className="p-3 bg-slate-700 rounded-lg w-24 shrink-0"
        onClick={toggle}
        disabled={remaining === 0}
      >
        {running ? "Pausar" : "Iniciar"}
      </button>
      <button className="p-2 underline text-sm" onClick={reset}>
        Reiniciar
      </button>
      {remaining === 0 && (
        <span className="sr-only" role="status">
          Tiempo terminado. Continúa cuando estés listo.
        </span>
      )}
    </div>
  );
}
