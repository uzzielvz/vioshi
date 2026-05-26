'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
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

type Stage = 'analyzing' | 'detected' | 'results';

/**
 * /[locale]/visual-search (VS-08 + VS-09 + VS-10)
 * Lives inside the [locale] shell so Header/Footer/i18n are inherited from ClientLayout.
 *
 * 3-stage full-screen flow:
 * 1. analyzing → fetch + large image + sweep animation
 * 2. detected (600ms) → dashed crop overlay
 * 3. results → identical layout to /search (post-PRO-12): visual_title + single FILTRAR + ProductGrid + drawer
 *
 * File handoff via sessionStorage (set by Header camera input).
 * Direct access without file → redirect to /[locale] home.
 */
export default function VisualSearchPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('search');

  const [stage, setStage] = useState<Stage>('analyzing');
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<VSResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reconstruct File from Header handoff (sessionStorage) or fallback
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
              setFile(reconstructed);
              sessionStorage.removeItem('__viogi_vs_pending');
              return;
            }
          }
        }
      } catch {
        // ignore, fall through to redirect
      }

      // No file available → redirect to locale home
      if (!cancelled) {
        router.replace(`/${locale}`);
      }
    }

    loadPendingFile();
    return () => {
      cancelled = true;
    };
  }, [router, locale]);

  // When we have a file, run the visual search
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

  // Back handler for analyzer stages
  const handleBack = () => {
    try {
      sessionStorage.removeItem('__viogi_vs_pending');
    } catch {}
    router.back();
  };

  if (error) {
    return (
      <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="max-w-md">
          <p className="text-2xl mb-4">⚠️</p>
          <p className="uppercase tracking-widest text-sm mb-6">{error}</p>
          <button
            onClick={() => router.replace(`/${locale}`)}
            className="uppercase text-xs tracking-widest border-b border-black pb-0.5 hover:opacity-60"
          >
            {t('back')}
          </button>
        </div>
      </main>
    );
  }

  if (!file && !isLoading) {
    return null;
  }

  return (
    <div className="bg-white">
      {stage !== 'results' && file && (
        <VisualSearchAnalyzer file={file} stage={stage} onBack={handleBack} />
      )}

      {stage === 'results' && (
        <VisualSearchResults results={results} />
      )}
    </div>
  );
}
