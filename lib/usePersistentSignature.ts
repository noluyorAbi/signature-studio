"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SIGNATURE, STORAGE_KEY } from "./defaults";
import type { SignatureData } from "./types";

const HISTORY_CAP = 80;
const COALESCE_MS = 600;

/**
 * Holds the signature in React state, mirrors it to localStorage, and keeps an
 * undo/redo history. Consecutive edits to the same field within a short window
 * coalesce into one history step (word-level undo, not per-keystroke).
 */
export function usePersistentSignature() {
  const [data, setDataState] = useState<SignatureData>(DEFAULT_SIGNATURE);
  const [hydrated, setHydrated] = useState(false);

  const dataRef = useRef<SignatureData>(DEFAULT_SIGNATURE);
  const past = useRef<SignatureData[]>([]);
  const future = useRef<SignatureData[]>([]);
  const lastKey = useRef<string>("");
  const lastTime = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const sync = useCallback(() => {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }, []);

  const apply = useCallback((next: SignatureData) => {
    dataRef.current = next;
    setDataState(next);
  }, []);

  // A history-aware change. coalesceKey lets same-field rapid edits merge.
  const commit = useCallback(
    (next: SignatureData, coalesceKey = "") => {
      const prev = dataRef.current;
      if (next === prev) return;
      const now = Date.now();
      const coalesce = coalesceKey !== "" && coalesceKey === lastKey.current && now - lastTime.current < COALESCE_MS && past.current.length > 0;
      if (!coalesce) past.current = [...past.current, prev].slice(-HISTORY_CAP);
      future.current = [];
      lastKey.current = coalesceKey;
      lastTime.current = now;
      apply(next);
      sync();
    },
    [apply, sync],
  );

  // Hydrate the saved draft after mount (SSR-safe; no history entry).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SignatureData>;
        const merged = { ...DEFAULT_SIGNATURE, ...saved, socials: { ...DEFAULT_SIGNATURE.socials, ...saved.socials } };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        apply(merged);
      }
    } catch {
      /* corrupt draft — keep defaults */
    }
    setHydrated(true);
  }, [apply]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked — non-fatal */
    }
  }, [data, hydrated]);

  const update = useCallback(
    <K extends keyof SignatureData>(key: K, value: SignatureData[K]) => {
      commit({ ...dataRef.current, [key]: value }, String(key));
    },
    [commit],
  );

  const updateSocial = useCallback(
    (key: keyof SignatureData["socials"], value: string) => {
      commit({ ...dataRef.current, socials: { ...dataRef.current.socials, [key]: value } }, "social:" + key);
    },
    [commit],
  );

  const setData = useCallback((next: SignatureData) => commit(next), [commit]);
  const reset = useCallback(() => commit(DEFAULT_SIGNATURE), [commit]);

  const undo = useCallback(() => {
    if (!past.current.length) return;
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [...future.current, dataRef.current];
    lastKey.current = "";
    apply(prev);
    sync();
  }, [apply, sync]);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    const next = future.current[future.current.length - 1];
    future.current = future.current.slice(0, -1);
    past.current = [...past.current, dataRef.current];
    lastKey.current = "";
    apply(next);
    sync();
  }, [apply, sync]);

  return {
    data,
    setData,
    update,
    updateSocial,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
    hydrated,
  };
}
