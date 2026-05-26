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
 * Single 'analyzing' stage (the old 'detected' dashed rectangle was removed
 * in VS-11 — the diffusion dot field already communicates "AI processing"
 * without the literal crop UI). Parent page orchestrates timing.
 *
 * Visual stack (back → front):
 *   - black backdrop          → "AI mode" visual cue
 *   - user image @ 35% opacity → user still sees what is being analyzed
 *   - canvas dot field         → ChatGPT-style noise-driven breathing
 *   - top-left label           → ANALIZANDO… with blinking cursor
 *   - back button              → circle button, white border
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
    <div className="relative min-h-[calc(100vh-64px)] w-full bg-black overflow-hidden">
      {/* User image — large, centered, low opacity. Sits below the dot field. */}
      <div className="absolute inset-0 flex items-center justify-center">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Imagen para búsqueda visual"
            className="max-h-[75vh] max-w-[min(90vw,540px)] object-contain"
            style={{ opacity: 0.32 }}
          />
        )}
      </div>

      {/* Diffusion dot field — covers the whole analyzer area */}
      <VisualSearchDotField className="absolute inset-0 w-full h-full" />

      {/* Top-left label with blinking cursor, à la ChatGPT */}
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
