'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CloseIcon } from '@/components/ui/icons';
import VisualSearchDotField from './VisualSearchDotField';

interface VisualSearchAnalyzerProps {
  file: File;
  onBack: () => void;
}

/**
 * VisualSearchAnalyzer (VS-08 + VS-11 + VS-13)
 * Full-viewport analyzer for the uploaded image.
 *
 * Light theme: white backdrop, image at low opacity, dark dots over the whole
 * photo, and a single calm status line.
 */
export default function VisualSearchAnalyzer({
  file,
  onBack,
}: VisualSearchAnalyzerProps) {
  const t = useTranslations('ui.visual');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="vs-fade-in relative flex min-h-[calc(100vh-64px)] w-full items-center justify-center overflow-hidden bg-paper">
      {previewUrl && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={t('your_photo')}
            className="block max-h-[75vh] max-w-[min(90vw,540px)] opacity-[0.18]"
          />
          <VisualSearchDotField
            imageUrl={previewUrl}
            color="#111111"
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
        </div>
      )}

      <p role="status" className="absolute left-4 top-4 z-20 text-[14px] font-semibold text-ink md:left-8">
        {t('looking')}
      </p>

      <button
        type="button"
        onClick={onBack}
        aria-label={t('close')}
        className="absolute right-2 top-2 z-20 grid h-10 w-10 place-items-center text-ink md:right-6"
      >
        <CloseIcon className="h-[22px] w-[22px]" />
      </button>
    </div>
  );
}
