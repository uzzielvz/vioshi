'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import VisualSearchAnalyzer from '@/components/VisualSearchAnalyzer';
import VisualSearchResults from '@/components/VisualSearchResults';
import EmptyState from '@/components/ui/EmptyState';
import { CameraIcon } from '@/components/ui/icons';
import { buttonClass } from '@/components/ui/styles';

type VSResult = {
  id: string;
  slug: string;
  name: string;
  price_mxn: number;
  similarity: number;
  image_url: string | null;
};

type Stage = 'looking' | 'results';

/**
 * /[locale]/visual-search (VS-08 → VS-13)
 * Lives inside the [locale] shell so Header/Footer/i18n are inherited.
 *
 * 2-stage flow with soft cross-fades (VS-13 dropped the crop selector — the
 * search now fires automatically on the full photo right after it's picked):
 * 1. looking  → light-theme dot field over the whole image while we hit the API
 * 2. results  → identical layout to /search
 *
 * File handoff via sessionStorage (set by the Header image input).
 */
export default function VisualSearchPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('ui.visual');
  // Plain strings so a new `t` identity never re-fires the (paid) search.
  const busyMessage = t('error_busy');
  const failedMessage = t('error_body');
  const offlineMessage = t('error_offline');

  const [stage, setStage] = useState<Stage>('looking');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [results, setResults] = useState<VSResult[]>([]);
  const [aiDescription, setAiDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPendingFile() {
      // Reset to a clean slate so a second search (same route, no remount)
      // starts fresh instead of staying on results.
      setStage('looking');
      setResults([]);
      setError(null);

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
              setPreviewUrl(URL.createObjectURL(reconstructed));
              sessionStorage.removeItem('__viogi_vs_pending');
              return;
            }
          }
        }
      } catch {
        // ignore, fall through to redirect
      }

      if (!cancelled) {
        router.replace(`/${locale}`);
      }
    }

    // Initial mount load.
    loadPendingFile();

    // A new search fired from the Header while already on /visual-search does
    // NOT remount this page (same route), so we re-run on a custom event.
    window.addEventListener('viogi:vs-new', loadPendingFile);
    return () => {
      cancelled = true;
      window.removeEventListener('viogi:vs-new', loadPendingFile);
    };
  }, [router, locale]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Fire the search automatically whenever a new file is loaded.
  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    const controller = new AbortController();

    async function runSearch() {
      if (!file) return;
      setStage('looking');
      setError(null);
      setResults([]);
      setAiDescription('');

      try {
        const formData = new FormData();
        formData.append('image', file);

        const startedAt = Date.now();
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

        if (cancelled) return;

        if (!res.ok) {
          // Server details go to the console; people get plain copy.
          console.error('[visual-search] API error', res.status, data?.message || data?.error);
          setError(res.status === 429 ? busyMessage : failedMessage);
          return;
        }

        // Minimum visible time for the dot field so the transition feels
        // intentional even on fast networks (~1.2s floor).
        const elapsed = Date.now() - startedAt;
        const wait = Math.max(0, 1200 - elapsed);

        // Demo observability: log Gemini's raw output (description + match scores).
        console.log('[visual-search] Gemini description:', data.ai_description);
        console.log(
          '[visual-search] matches:',
          (data.results ?? []).map((r: VSResult) => ({
            name: r.name,
            similarity: r.similarity,
          }))
        );

        setTimeout(() => {
          if (!cancelled) {
            setResults(data.results ?? []);
            setAiDescription(data.ai_description ?? '');
            setStage('results');
          }
        }, wait);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        console.error('Visual search fetch error:', e);
        if (!cancelled) {
          setError(navigator.onLine ? failedMessage : offlineMessage);
        }
      }
    }

    runSearch();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [file, busyMessage, failedMessage, offlineMessage]);

  function handleBack() {
    try {
      sessionStorage.removeItem('__viogi_vs_pending');
    } catch {}
    router.back();
  }

  if (error) {
    return (
      <EmptyState icon={<CameraIcon />} title={t('error_title')} body={error} className="py-20">
        <button type="button" onClick={() => router.replace(`/${locale}`)} className={buttonClass('primary')}>
          {t('back')}
        </button>
      </EmptyState>
    );
  }

  if (!file || !previewUrl) {
    return <div className="min-h-[calc(100vh-64px)] bg-paper" />;
  }

  return (
    <div className="bg-paper">
      {stage === 'looking' && (
        <VisualSearchAnalyzer file={file} onBack={handleBack} />
      )}

      {stage === 'results' && (
        <div className="vs-fade-in-slow">
          <VisualSearchResults results={results} aiDescription={aiDescription} previewUrl={previewUrl} />
        </div>
      )}
    </div>
  );
}
