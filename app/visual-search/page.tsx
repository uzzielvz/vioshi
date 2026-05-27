'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import VisualSearchAnalyzer from '@/components/VisualSearchAnalyzer';
import VisualSearchResults from '@/components/VisualSearchResults';

type VSResult = {
  id: string;
  slug: string;
  name: string;
  price_mxn: number;
  similarity: number;
  image_url: string | null;
};

type Stage = 'idle' | 'analyzing' | 'detected' | 'results';

/**
 * /visual-search (VS-08 + VS-09)
 * 4-stage full-screen flow:
 *
 * 1. idle     → dual-input UI (upload file OR camera capture)
 * 2. analyzing → fetch + large image + sweep animation
 * 3. detected (600ms) → dashed crop overlay
 * 4. results  → identical layout to /search: visual_title + ProductGrid
 *
 * File handoff: sessionStorage (set by Header camera) skips idle and goes directly
 * to analyzing. Direct access without a pending file shows the idle input UI.
 */
export default function VisualSearchPage() {
  const router = useRouter();
  const t = useTranslations('search');
  const tVS = useTranslations('visualSearch');

  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<VSResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Tracks whether the current file came from the Header sessionStorage handoff,
  // so the back button can use router.back() instead of returning to idle.
  const fromSessionStorage = useRef(false);

  // Try to reconstruct File from Header handoff (sessionStorage)
  useEffect(() => {
    let cancelled = false;

    async function loadPendingFile() {
      try {
        const raw = sessionStorage.getItem('__viogi_vs_pending');
        if (raw) {
          const { name, type, dataUrl } = JSON.parse(raw);
          if (dataUrl) {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const reconstructed = new File([blob], name || 'upload.jpg', { type: type || 'image/jpeg' });
            if (!cancelled) {
              fromSessionStorage.current = true;
              setFile(reconstructed);
              sessionStorage.removeItem('__viogi_vs_pending');
            }
          }
        }
      } catch {
        // No pending file — stay idle so the user can choose an input method
      }
    }

    loadPendingFile();
    return () => {
      cancelled = true;
    };
  }, []);

  // Shared handler called by both inputs after the user selects or captures an image
  function handleImageSelected(selectedFile: File) {
    fromSessionStorage.current = false;
    setError(null);
    setResults([]);
    setFile(selectedFile);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) handleImageSelected(selected);
    // Reset so the same file can be re-selected without a stale value
    e.target.value = '';
  }

  // Run visual search whenever a file is set
  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    const controller = new AbortController();

    async function runSearch() {
      if (!file) return;
      setIsLoading(true);
      setError(null);
      setResults([]);
      setStage('analyzing');

      try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/visual-search', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        let data: any = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (!res.ok) {
          if (res.status === 429) {
            const msg = data?.message || 'Demasiadas búsquedas. Intenta más tarde.';
            setError(msg);
            setIsLoading(false);
            return;
          }

          const serverMsg = data?.message || data?.error;
          setError(serverMsg ? `Error del servidor: ${serverMsg}` : 'No se pudo procesar la imagen.');
          setIsLoading(false);
          return;
        }

        if (cancelled) return;

        setResults(data.results ?? []);
        setTimeout(() => {
          if (!cancelled) setStage('detected');
        }, 600);
        setTimeout(() => {
          if (!cancelled) {
            setStage('results');
            setIsLoading(false);
          }
        }, 1200);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;

        console.error('Visual search fetch error:', e);

        if (!cancelled) {
          setError(
            navigator.onLine
              ? 'Error de conexión con el servidor. Revisa tu GEMINI_API_KEY y los logs del servidor.'
              : 'Sin conexión a internet.'
          );
          setIsLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [file]);

  // Back: return to idle for direct entries; router.back() for Header handoffs
  const handleBack = () => {
    try { sessionStorage.removeItem('__viogi_vs_pending'); } catch {}
    if (fromSessionStorage.current) {
      router.back();
    } else {
      setFile(null);
      setStage('idle');
    }
  };

  const handleRetry = () => {
    setError(null);
    setFile(null);
    setStage('idle');
  };

  if (error) {
    return (
      <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="max-w-md">
          <p className="text-2xl mb-4">⚠️</p>
          <p className="uppercase tracking-widest text-sm mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="uppercase text-xs tracking-widest border-b border-black pb-0.5 hover:opacity-60"
          >
            {tVS('try_again')}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      {stage === 'idle' && (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-xs flex flex-col items-center gap-8">
            <div className="text-center">
              <h1 className="uppercase tracking-widest text-sm font-medium">{tVS('title')}</h1>
              <p className="mt-2 text-xs text-gray-500 tracking-wide leading-relaxed">
                {tVS('subtitle')}
              </p>
            </div>

            <div className="w-full flex flex-col gap-3">
              {/* Upload image — standard file picker, no camera constraint */}
              <label className="w-full border border-black py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-black hover:text-white transition-colors uppercase text-xs tracking-widest">
                {tVS('upload_label')}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileInput}
                />
              </label>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 uppercase tracking-widest">
                  {tVS('or_separator')}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Take photo — capture="environment" opens rear camera directly on mobile;
                  falls back to standard file picker on desktop (expected behavior) */}
              <label className="w-full bg-black text-white py-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-900 transition-colors uppercase text-xs tracking-widest">
                {tVS('take_photo')}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleFileInput}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {(stage === 'analyzing' || stage === 'detected') && file && (
        <VisualSearchAnalyzer file={file} stage={stage} onBack={handleBack} />
      )}

      {stage === 'results' && (
        <VisualSearchResults results={results} />
      )}
    </main>
  );
}
