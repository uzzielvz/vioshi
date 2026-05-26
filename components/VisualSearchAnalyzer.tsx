'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface VisualSearchAnalyzerProps {
  file: File;
  stage: 'analyzing' | 'detected';
  onBack: () => void;
}

/**
 * VisualSearchAnalyzer (VS-08)
 * Full-viewport analyzer for the uploaded image with two transient stages:
 * - 'analyzing': large preview + sweeping scan line animation + "ANALIZANDO..."
 * - 'detected': same preview + static dashed crop rect + "DETECTADO" badge (600ms)
 *
 * The parent page orchestrates timing (600ms between detected → results).
 * Back button uses router.back() or equivalent.
 */
export default function VisualSearchAnalyzer({
  file,
  stage,
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
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-white px-4 py-8 relative">
      {/* Back button — absolute, styled like drawer close (Stüssy circle) */}
      <button
        type="button"
        onClick={onBack}
        aria-label={t('back')}
        className="absolute flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-black hover:bg-gray-100 transition-colors"
        style={{
          top: '80px',
          left: '20px',
          zIndex: 20,
        }}
      >
        <span className="text-lg leading-none" style={{ transform: 'translateY(-1px)' }}>←</span>
      </button>

      {/* Large image container */}
      <div className="relative w-full max-w-[500px] flex justify-center">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Imagen para búsqueda visual"
            className="max-h-[70vh] max-w-[min(90vw,500px)] object-contain rounded"
            style={{ background: '#f8f8f8' }}
          />
        )}

        {/* Overlay layer on the image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {stage === 'analyzing' && (
            <>
              {/* Sweeping scan line (CSS keyframes in globals.css) */}
              <div className="vs-scan-line" />
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 border border-gray-200"
                style={labelStyle}
              >
                {t('analyzing')}
              </div>
            </>
          )}

          {stage === 'detected' && (
            <>
              {/* Dashed crop rect (~70% of image area) + DETECTADO badge */}
              <div
                className="absolute border-2 border-dashed border-black bg-transparent"
                style={{
                  width: '70%',
                  height: '70%',
                  top: '15%',
                  left: '15%',
                }}
              />
              <div
                className="absolute bg-white border border-black px-3 py-0.5"
                style={{
                  ...labelStyle,
                  top: 'calc(15% - 1.25rem)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontWeight: 600,
                }}
              >
                {t('detected')}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
