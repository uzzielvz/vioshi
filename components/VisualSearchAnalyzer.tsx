'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import VisualSearchDotField from './VisualSearchDotField';
import type { CropRect } from './VisualSearchCropper';

interface VisualSearchAnalyzerProps {
  file: File;
  cropRect?: CropRect;
  onBack: () => void;
}

/**
 * VisualSearchAnalyzer (VS-08 + VS-11 + VS-12)
 * Full-viewport analyzer for the uploaded image.
 *
 * Light theme (VS-12): white backdrop, image at low opacity, dark dots
 * restricted to the user-selected crop region. No blinking cursor — label
 * just reads "MIRANDO" to feel calm and intentional.
 */
export default function VisualSearchAnalyzer({
  file,
  cropRect,
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
    color: '#000000',
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full bg-white overflow-hidden flex items-center justify-center vs-fade-in">
      {previewUrl && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Imagen para búsqueda visual"
            className="block max-h-[75vh] max-w-[min(90vw,540px)]"
            style={{ opacity: 0.18 }}
          />
          <VisualSearchDotField
            imageUrl={previewUrl}
            cropRect={cropRect}
            color="#111111"
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        </div>
      )}

      <div
        className="absolute"
        style={{
          top: '24px',
          left: '24px',
          zIndex: 20,
          ...labelStyle,
        }}
      >
        {t('looking')}
      </div>

      <button
        type="button"
        onClick={onBack}
        aria-label={t('back')}
        className="absolute flex items-center justify-center w-8 h-8 rounded-full border border-black/20 text-black hover:bg-black/5 transition-colors"
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
