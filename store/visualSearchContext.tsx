'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * VisualSearchContext
 *
 * Provides a File for the visual search flow.
 *
 * NOTE (adaptation from PLAN 3.6.1 spec):
 * React Context cannot cross Next.js layout shells (/ [locale] vs /visual-search standalone).
 * Header (in locale shell) uses sessionStorage handoff to pass the selected image File
 * to the /visual-search page. The context is still created and wrapped per spec for:
 *  - Intra-page state sharing inside /visual-search React tree (analyzer/results)
 *  - Future unification of shells if ever done
 *  - Consistency with the documented implementation steps
 */
type Ctx = {
  file: File | null;
  setFile: (f: File | null) => void;
};

const VisualSearchCtx = createContext<Ctx | null>(null);

export function VisualSearchProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <VisualSearchCtx.Provider value={{ file, setFile }}>
      {children}
    </VisualSearchCtx.Provider>
  );
}

export function useVisualSearch() {
  const ctx = useContext(VisualSearchCtx);
  if (!ctx) throw new Error('useVisualSearch outside provider');
  return ctx;
}
