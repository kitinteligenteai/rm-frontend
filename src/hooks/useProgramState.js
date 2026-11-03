import { sameJson } from "../lib/stateSync";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

export function useProgramState(section, initialValue = {}) {
  const { user } = useUser();
  const key = `rm:${user.id}:${section}:v1`;
  const initial = useRef(initialValue);
  const loaded = useRef(false);
  const [loadVersion, setLoadVersion] = useState(0);
  const [value, setValue] = useState(initial.current);
  const [status, setStatus] = useState("loading");
  const [revision, setRevision] = useState(0);
  const current = useRef(value);
  const queue = useRef(Promise.resolve());
  const cacheOk = useRef(true);
  const baseline = useRef(null);
  const cache = useCallback(
    (next, dirty) => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ value: next, dirty, baseline: baseline.current }),
        );
        return true;
      } catch {
        return false;
      }
    },
    [key],
  );
  useEffect(() => {
    let active = true;
    loaded.current = false;
    setStatus("loading");
    let cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(key));
    } catch {
      /* corrupt cache */
    }
    if (cached?.value && typeof cached.value === "object") {
      current.current = cached.value;
      setValue(cached.value);
    } else {
      current.current = initial.current;
      setValue(initial.current);
    }
    supabase
      .from("program_state")
      .select(section)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        // Never replay a dirty cache when the remote read failed: another device
        // may have newer data. Keep the local copy intact and require a new read.
        if (error) {
          loaded.current = false;
          setStatus("unavailable");
          return;
        }
        const remote = data?.[section] || initial.current;
        baseline.current = remote;
        if (
          cached?.dirty &&
          !sameJson(remote, cached.value) &&
          !sameJson(cached.baseline, remote)
        ) {
          loaded.current = false;
          setStatus("conflict");
          return;
        }
        if (cached?.dirty) {
          loaded.current = true;
          setStatus("local");
          setRevision((r) => r + 1);
          return;
        }
        const next =
          data?.[section] && Object.keys(data[section]).length
            ? data[section]
            : cached?.value || initial.current;
        loaded.current = true;
        current.current = next;
        setValue(next);
        cache(next, false);
        setStatus("saved");
      });
    return () => {
      active = false;
    };
  }, [key, section, user.id, cache, loadVersion]);
  useEffect(() => {
    if (!revision) return;
    let active = true;
    const timer = setTimeout(async () => {
      setStatus("saving");
      const snapshot = current.current;
      const send = () =>
        supabase.rpc("save_program_state", {
          p_section: section,
          p_value: snapshot,
        });
      const work = queue.current.then(send, send);
      queue.current = work;
      const { error } = await work;
      if (!active) return;
      if (error) {
        setStatus(cacheOk.current ? "local" : "unsaved");
        return;
      }
      baseline.current = snapshot;
      cache(snapshot, false);
      setStatus("saved");
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [revision, key, section, cache]);
  const update = (next) => {
    if (!loaded.current) return;
    const updated = typeof next === "function" ? next(current.current) : next;
    current.current = updated;
    setValue(updated);
    cacheOk.current = cache(updated, true);
    setStatus("saving");
    setRevision((r) => r + 1);
  };
  return [
    value,
    update,
    status,
    () =>
      loaded.current && !cacheOk.current
        ? setRevision((r) => r + 1)
        : setLoadVersion((v) => v + 1),
    () => {
      // Explicit resolution keeps the unsynced version separately for recovery.
      try {
        const local = localStorage.getItem(key);
        if (local) localStorage.setItem(`${key}:conflict-backup`, local);
        localStorage.removeItem(key);
      } catch {
        return;
      }
      setLoadVersion((v) => v + 1);
    },
  ];
}
