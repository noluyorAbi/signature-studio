"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SIGNATURE, STORAGE_KEY } from "./defaults";
import type { SignatureData } from "./types";

const HISTORY_CAP = 80;
const COALESCE_MS = 600;
const PKEY = "signature-studio:profiles:v1";
const DEFAULT_ID = "default";

export type Profile = { id: string; name: string };
type Stored = { activeId: string; profiles: { id: string; name: string; data: SignatureData }[] };

function newId(): string {
  return "p" + Math.random().toString(36).slice(2, 9);
}
function normalize(d: Partial<SignatureData> | undefined): SignatureData {
  return { ...DEFAULT_SIGNATURE, ...d, socials: { ...DEFAULT_SIGNATURE.socials, ...d?.socials } };
}

/**
 * Profiles-backed signature store. Holds several named signatures, the active
 * one in editable React state, an undo/redo history (word-level coalescing),
 * and mirrors everything to localStorage. Migrates the old single-draft key.
 */
export function usePersistentSignature() {
  const [data, setDataState] = useState<SignatureData>(DEFAULT_SIGNATURE);
  const [hydrated, setHydrated] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([{ id: DEFAULT_ID, name: "Default" }]);
  const [activeId, setActiveId] = useState(DEFAULT_ID);

  const dataRef = useRef<SignatureData>(DEFAULT_SIGNATURE);
  const activeRef = useRef<string>(DEFAULT_ID);
  const slots = useRef<Record<string, SignatureData>>({ [DEFAULT_ID]: DEFAULT_SIGNATURE });
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
  const resetHistory = useCallback(() => {
    past.current = [];
    future.current = [];
    lastKey.current = "";
    sync();
  }, [sync]);

  // Live-set the active signature (also keeps its slot in sync).
  const place = useCallback((next: SignatureData) => {
    dataRef.current = next;
    slots.current[activeRef.current] = next;
    setDataState(next);
  }, []);

  // A history-aware change; same-field rapid edits coalesce into one step.
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
      place(next);
      sync();
    },
    [place, sync],
  );

  // Hydrate after mount (SSR-safe). Loads the profiles store, else migrates v1.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PKEY);
      if (raw) {
        const s = JSON.parse(raw) as Stored;
        if (s.profiles?.length) {
          const map: Record<string, SignatureData> = {};
          s.profiles.forEach((p) => (map[p.id] = normalize(p.data)));
          slots.current = map;
          const active = s.profiles.find((p) => p.id === s.activeId) ?? s.profiles[0];
          activeRef.current = active.id;
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setProfiles(s.profiles.map((p) => ({ id: p.id, name: p.name })));
          setActiveId(active.id);
          place(map[active.id]);
          setHydrated(true);
          return;
        }
      }
      const old = localStorage.getItem(STORAGE_KEY);
      if (old) {
        const merged = normalize(JSON.parse(old) as Partial<SignatureData>);
        slots.current = { [DEFAULT_ID]: merged };
        place(merged);
      }
    } catch {
      /* corrupt store — keep defaults */
    }
    setHydrated(true);
  }, [place]);

  // Persist the whole profiles store on any change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const out: Stored = {
        activeId,
        profiles: profiles.map((p) => ({ id: p.id, name: p.name, data: p.id === activeId ? data : slots.current[p.id] ?? DEFAULT_SIGNATURE })),
      };
      localStorage.setItem(PKEY, JSON.stringify(out));
    } catch {
      /* storage full or blocked — non-fatal */
    }
  }, [data, profiles, activeId, hydrated]);

  const update = useCallback(
    <K extends keyof SignatureData>(key: K, value: SignatureData[K]) => commit({ ...dataRef.current, [key]: value }, String(key)),
    [commit],
  );
  const updateSocial = useCallback(
    (key: keyof SignatureData["socials"], value: string) => commit({ ...dataRef.current, socials: { ...dataRef.current.socials, [key]: value } }, "social:" + key),
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
    place(prev);
    sync();
  }, [place, sync]);
  const redo = useCallback(() => {
    if (!future.current.length) return;
    const next = future.current[future.current.length - 1];
    future.current = future.current.slice(0, -1);
    past.current = [...past.current, dataRef.current];
    lastKey.current = "";
    place(next);
    sync();
  }, [place, sync]);

  // ---- profiles ----
  const switchProfile = useCallback(
    (id: string) => {
      if (id === activeRef.current) return;
      slots.current[activeRef.current] = dataRef.current;
      const target = slots.current[id] ?? DEFAULT_SIGNATURE;
      activeRef.current = id;
      setActiveId(id);
      dataRef.current = target;
      setDataState(target);
      resetHistory();
    },
    [resetHistory],
  );
  const addProfile = useCallback(
    (from?: SignatureData) => {
      const id = newId();
      const base = from && typeof from.accentColor === "string" ? from : DEFAULT_SIGNATURE;
      slots.current[activeRef.current] = dataRef.current;
      slots.current[id] = base;
      setProfiles((ps) => [...ps, { id, name: `Profile ${ps.length + 1}` }]);
      activeRef.current = id;
      setActiveId(id);
      dataRef.current = base;
      setDataState(base);
      resetHistory();
    },
    [resetHistory],
  );
  const duplicateProfile = useCallback(() => addProfile(dataRef.current), [addProfile]);
  const renameProfile = useCallback((id: string, name: string) => setProfiles((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p))), []);
  const deleteProfile = useCallback(
    (id: string) => {
      setProfiles((ps) => {
        if (ps.length <= 1) return ps;
        const next = ps.filter((p) => p.id !== id);
        delete slots.current[id];
        if (activeRef.current === id) {
          const t = next[0];
          activeRef.current = t.id;
          setActiveId(t.id);
          const td = slots.current[t.id] ?? DEFAULT_SIGNATURE;
          dataRef.current = td;
          setDataState(td);
          resetHistory();
        }
        return next;
      });
    },
    [resetHistory],
  );

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
    profiles,
    activeId,
    switchProfile,
    addProfile,
    duplicateProfile,
    renameProfile,
    deleteProfile,
  };
}
