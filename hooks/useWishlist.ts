"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

const CHANGE_EVENT = "viogi:wishlist";

function readIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(ids));
  } catch {
    // Private mode or a full quota: the toggle still updates this tab.
  }
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  // False until localStorage was read, so lists don't flash their empty state.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readIds());
    setReady(true);

    const sync = () => setIds(readIds());
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = readIds();
    const next = current.includes(id)
      ? current.filter((saved) => saved !== id)
      : [...current, id];
    writeIds(next);
    setIds(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, ready, has, toggle };
}
