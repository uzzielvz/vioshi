'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import VisualSearchDotField from './VisualSearchDotField';

interface VisualSearchAnalyzerProps {
  file: File;
  onBack: () => void;
}

/**
 * VisualSearchAnalyzer (VS-08 + VS-11)
 * Full-viewport analyzer for the uploaded image.
 *
 * Visual stack (back → front), all bounded to the rendered <img> box so dots
 * never spill across the screen:
 *   - black backdrop                  → "AI processing" mode cue
 *   - inline-block wrapper            → shrinks to exact image bounds
 *     - user image @ 14% opacity      → faint ghost so user knows what's analyzed
 *     - canvas dot field overlay      → density driven by image luminance,
 *                                       contour-aware, breathing, direction-shifting
 *   - top-left label                  → ANALIZANDO with blinking cursor
 *   - top-right back button           → minimal X
 */
export default function VisualSearchAnalyzer({
  file,
  onBack,
}: VisualSearchAnalyzerProps) {
  const t = useTranslations('search');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#ffffff',
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full bg-black overflow-hidden flex items-center justify-center">
      {/* Image-bound wrapper — inline-block so it sizes to the actual rendered img.
          Both the <img> and the canvas live inside this box, so the dot cloud is
          strictly contained within the image, not across the whole viewport. */}
      {previewUrl && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Imagen para búsqueda visual"
            className="block max-h-[75vh] max-w-[min(90vw,540px)]"
            style={{ opacity: 0.14 }}
          />
          <VisualSearchDotField
            imageUrl={previewUrl}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        </div>
      )}

      {/* Top-left label with blinking cursor (ChatGPT vibe) */}
      <div
        className="absolute"
        style={{
          top: '24px',
          left: '24px',
          zIndex: 20,
          ...labelStyle,
        }}
      >
        <span>{t('analyzing')}</span>
        <span className="vs-cursor-blink" aria-hidden="true">▍</span>
      </div>

      {/* Back button — minimal circle, white outline on black */}
      <button
        type="button"
        onClick={onBack}
        aria-label={t('back')}
        className="absolute flex items-center justify-center w-8 h-8 rounded-full border border-white/40 text-white hover:bg-white/10 transition-colors"
        style={{
          top: '24px',
          right: '24px',
          zIndex: 20,
        }}
      >
        <span className="text-lg leading-none" style={{ transform: 'translateY(-1px)' }}>×</span>
      </button>
    </div>
  );
}
