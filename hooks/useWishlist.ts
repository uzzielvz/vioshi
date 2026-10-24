"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import { setSavedAction, syncSavedAction } from "@/lib/social/actions";

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

function readOwner(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.WISHLIST_OWNER);
  } catch {
    return null;
  }
}

function writeOwner(userId: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST_OWNER, userId);
  } catch {
    // Without it the next load merges again, which is harmless.
  }
}

// Supabase keeps the session in a readable `sb-<ref>-auth-token` cookie, so
// anonymous visitors skip the server round trip entirely.
function hasSessionCookie(): boolean {
  return typeof document !== "undefined" && /(?:^|; )sb-[^=]+-auth-token/.test(document.cookie);
}

// One account sync per page load, shared by every heart on the page.
let syncPromise: Promise<boolean> | null = null;
let accountBacked = false;

function syncWithAccount(): Promise<boolean> {
  if (!syncPromise) {
    syncPromise = (async () => {
      if (!hasSessionCookie()) return false;
      try {
        const result = await syncSavedAction(readIds(), readOwner());
        if (!result) return false;
        writeIds(result.ids);
        writeOwner(result.userId);
        accountBacked = true;
        window.dispatchEvent(new Event(CHANGE_EVENT));
        return true;
      } catch {
        return false;
      }
    })();
  }
  return syncPromise;
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  // False until localStorage was read, so lists don't flash their empty state.
  const [ready, setReady] = useState(false);
  // True when the list also lives in the signed-in account.
  const [synced, setSynced] = useState(accountBacked);

  useEffect(() => {
    setIds(readIds());
    setReady(true);

    let active = true;
    syncWithAccount().then((ok) => {
      if (active) setSynced(ok);
    });

    const sync = () => setIds(readIds());
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = readIds();
    const saving = !current.includes(id);
    const next = saving ? [...current, id] : current.filter((saved) => saved !== id);
    writeIds(next);
    setIds(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    if (accountBacked) void setSavedAction(id, saving);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, ready, synced, has, toggle };
}
