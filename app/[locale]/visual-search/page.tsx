'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import VisualSearchCropper, { type CropRect } from '@/components/VisualSearchCropper';
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

type Stage = 'cropping' | 'looking' | 'results';

/**
 * /[locale]/visual-search (VS-08 → VS-12)
 * Lives inside the [locale] shell so Header/Footer/i18n are inherited.
 *
 * 3-stage flow with soft cross-fades (VS-12):
 * 1. cropping → user picks the garment region (white, draggable rect)
 * 2. looking  → light-theme dot field over the chosen region while we hit the API
 * 3. results  → identical layout to /search
 *
 * The image is cropped client-side before sending to the API, so Gemini
 * focuses on the prenda the user actually wants matched.
 */
export default function VisualSearchPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('search');

  const [stage, setStage] = useState<Stage>('cropping');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [results, setResults] = useState<VSResult[]>([]);
  const [error, setError] = useState<string | null>(null);

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

    loadPendingFile();
    return () => {
      cancelled = true;
    };
  }, [router, locale]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /**
   * Crop the source File using the rect (relative coords). Returns a JPEG File.
   */
  async function cropFile(source: File, rect: CropRect): Promise<File> {
    const url = URL.createObjectURL(source);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = url;
      });
      const sx = Math.max(0, Math.round(rect.x * img.naturalWidth));
      const sy = Math.max(0, Math.round(rect.y * img.naturalHeight));
      const sw = Math.max(1, Math.round(rect.width * img.naturalWidth));
      const sh = Math.max(1, Math.round(rect.height * img.naturalHeight));

      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (!ctx) return source;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92)
      );
      if (!blob) return source;
      return new File([blob], source.name.replace(/\.[^.]+$/, '') + '-crop.jpg', { type: 'image/jpeg' });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function handleCropConfirm(rect: CropRect) {
    if (!file) return;
    setCropRect(rect);
    setStage('looking');
    setError(null);
    setResults([]);

    try {
      const cropped = await cropFile(file, rect);
      const formData = new FormData();
      formData.append('image', cropped);

      const startedAt = Date.now();
      const res = await fetch('/api/visual-search', {
        method: 'POST',
        body: formData,
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        if (res.status === 429) {
          setError(data?.message || 'Demasiadas búsquedas. Intenta más tarde.');
          return;
        }
        const serverMsg = data?.message || data?.error;
        setError(serverMsg ? `Error del servidor: ${serverMsg}` : 'No se pudo procesar la imagen.');
        return;
      }

      // Minimum visible time for the dot field so the transition feels
      // intentional even on fast networks (~1.2s floor).
      const elapsed = Date.now() - startedAt;
      const minVisible = 1200;
      const wait = Math.max(0, minVisible - elapsed);

      setTimeout(() => {
        setResults(data.results ?? []);
        setStage('results');
      }, wait);
    } catch (e: any) {
      console.error('Visual search fetch error:', e);
      setError(
        navigator.onLine
          ? 'Error de conexión con el servidor. Revisa tu GEMINI_API_KEY y los logs del servidor.'
          : 'Sin conexión a internet.'
      );
    }
  }

  function handleBack() {
    try {
      sessionStorage.removeItem('__viogi_vs_pending');
    } catch {}
    router.back();
  }

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

  if (!file || !previewUrl) {
    return <div className="min-h-[calc(100vh-64px)] bg-white" />;
  }

  return (
    <div className="bg-white">
      {stage === 'cropping' && (
        <VisualSearchCropper
          imageUrl={previewUrl}
          onConfirm={handleCropConfirm}
          onBack={handleBack}
        />
      )}

      {stage === 'looking' && (
        <VisualSearchAnalyzer
          file={file}
          cropRect={cropRect ?? undefined}
          onBack={handleBack}
        />
      )}

      {stage === 'results' && (
        <div className="vs-fade-in-slow">
          <VisualSearchResults results={results} />
        </div>
      )}
    </div>
  );
}
