"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SIGNATURE, STORAGE_KEY } from "./defaults";
import type { SignatureData } from "./types";

/**
 * Holds the signature in React state and mirrors it to localStorage.
 * Starts from defaults (so SSR and first client render match), then
 * hydrates any saved draft after mount to avoid a hydration mismatch.
 */
export function usePersistentSignature() {
  const [data, setData] = useState<SignatureData>(DEFAULT_SIGNATURE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SignatureData>;
        // SSR-safe hydration: server + first client render use defaults, then we
        // adopt the saved draft after mount. setState here is intentional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData({
          ...DEFAULT_SIGNATURE,
          ...saved,
          socials: { ...DEFAULT_SIGNATURE.socials, ...saved.socials },
        });
      }
    } catch {
      /* corrupt draft — ignore and keep defaults */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked — non-fatal */
    }
  }, [data, hydrated]);

  const update = useCallback(<K extends keyof SignatureData>(
    key: K,
    value: SignatureData[K],
  ) => {
    setData((d) => ({ ...d, [key]: value }));
  }, []);

  const updateSocial = useCallback((key: keyof SignatureData["socials"], value: string) => {
    setData((d) => ({ ...d, socials: { ...d.socials, [key]: value } }));
  }, []);

  const reset = useCallback(() => setData(DEFAULT_SIGNATURE), []);

  return { data, setData, update, updateSocial, reset, hydrated };
}
