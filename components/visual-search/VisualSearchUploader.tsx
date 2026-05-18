'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import type {
  ClassificationResult,
  GarmentClass,
  UploadState,
} from '@/types/visual-search';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_BYTES = 10 * 1024 * 1024;

const CATEGORY_SLUGS: Record<GarmentClass, string> = {
  playera: 'playeras',
  pantalon: 'pants',
  sudadera: 'hoodie',
  calzado: 'accesorios',
};

const CLASS_KEYS: GarmentClass[] = ['playera', 'pantalon', 'sudadera', 'calzado'];

export function VisualSearchUploader() {
  const t = useTranslations('visualSearch');
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [state, setState] = useState<UploadState>({ status: 'idle' });

  const resetToIdle = useCallback(() => {
    if (state.status === 'previewing') URL.revokeObjectURL(state.previewUrl);
    setState({ status: 'idle' });
  }, [state]);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setState({ status: 'error', message: t('error_format') });
        return;
      }
      if (file.size > MAX_BYTES) {
        setState({ status: 'error', message: t('error_size') });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setState({ status: 'previewing', file, previewUrl });
    },
    [t]
  );

  const classify = useCallback(async () => {
    if (state.status !== 'previewing') return;

    const { file } = state;
    setState({ status: 'processing' });

    try {
      const body = new FormData();
      body.append('image', file);

      const res = await fetch('/api/classify', { method: 'POST', body });
      const data = await res.json();

      if (!res.ok) {
        const codeMap: Record<string, string> = {
          INVALID_FORMAT: t('error_format'),
          FILE_TOO_LARGE: t('error_size'),
          SERVICE_UNAVAILABLE: t('error_service'),
          LOW_QUALITY: t('error_quality'),
        };
        setState({
          status: 'error',
          message: codeMap[data.code] ?? t('error_unknown'),
        });
        return;
      }

      const result = data as ClassificationResult;
      if (result.low_confidence) {
        setState({ status: 'low_confidence', result });
      } else {
        setState({ status: 'success', result });
      }
    } catch {
      setState({ status: 'error', message: t('error_service') });
    }
  }, [state, t]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  return (
    <div className="max-w-xl mx-auto w-full flex flex-col gap-8">
      {/* Drop zone — shown while idle or on error */}
      {(state.status === 'idle' || state.status === 'error') && (
        <div
          role="button"
          tabIndex={0}
          aria-label={t('upload_label')}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            'border border-black flex flex-col items-center justify-center gap-3 py-16 px-8 cursor-pointer transition-colors select-none',
            isDragging ? 'bg-gray-100' : 'hover:bg-gray-50'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p
            className="uppercase tracking-wide text-center"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11px', fontWeight: 500 }}
          >
            {t('drag_drop')}
          </p>
          <p
            className="text-gray-500 text-center"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11px' }}
          >
            {t('drag_drop_or')}
          </p>
          <p
            className="text-gray-400 text-center"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '10px' }}
          >
            {t('supported_formats')}
          </p>
          {state.status === 'error' && (
            <p
              className="text-red-600 text-center mt-2"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11px' }}
            >
              {state.message}
            </p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        aria-hidden="true"
        onChange={onInputChange}
      />

      {/* Preview — shown before classification */}
      {state.status === 'previewing' && (
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-square border border-black overflow-hidden">
            <Image
              src={state.previewUrl}
              alt="Vista previa"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex gap-3">
            <Button variant="primary" fullWidth onClick={classify}>
              {t('upload_label')}
            </Button>
            <Button variant="secondary" fullWidth onClick={resetToIdle}>
              {t('try_again')}
            </Button>
          </div>
        </div>
      )}

      {/* Processing spinner */}
      {state.status === 'processing' && (
        <div className="flex flex-col items-center gap-6 py-16">
          <Spinner size="lg" />
          <p
            className="uppercase tracking-wide"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11px', fontWeight: 500 }}
          >
            {t('analyzing')}
          </p>
        </div>
      )}

      {/* Low confidence warning */}
      {state.status === 'low_confidence' && (
        <div className="flex flex-col gap-6">
          <ProbabilityCard result={state.result} t={t} />
          <div className="border border-black p-6 flex flex-col gap-3">
            <p
              className="uppercase tracking-wide"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11px', fontWeight: 700 }}
            >
              {t('low_confidence_title')}
            </p>
            <p
              className="text-gray-600 leading-relaxed"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11px' }}
            >
              {t('low_confidence_message')}
            </p>
          </div>
          <Button variant="secondary" fullWidth onClick={resetToIdle}>
            {t('try_again')}
          </Button>
        </div>
      )}

      {/* Success result */}
      {state.status === 'success' && (
        <div className="flex flex-col gap-6">
          <ProbabilityCard result={state.result} t={t} />
          <div className="flex gap-3">
            <Link
              href={`/${locale}/collections/${CATEGORY_SLUGS[state.result.class]}`}
              className="flex-1 bg-black text-white flex items-center justify-center py-3 uppercase tracking-wide transition-opacity hover:opacity-80"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11px', fontWeight: 500 }}
            >
              {t('view_category')}
            </Link>
            <Button variant="secondary" className="flex-1" onClick={resetToIdle}>
              {t('try_again')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProbabilityCard({
  result,
  t,
}: {
  result: ClassificationResult;
  t: ReturnType<typeof useTranslations<'visualSearch'>>;
}) {
  const topConfidencePct = Math.round(result.confidence * 100);

  return (
    <div className="border border-black p-6 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <p
          className="uppercase tracking-wide"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11px', fontWeight: 700 }}
        >
          {t('result_title')}
        </p>
        <p
          className="uppercase tracking-wide"
          style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '11px' }}
        >
          {t(`class_${result.class}`)} — {topConfidencePct}%
        </p>
      </div>

      <p
        className="uppercase tracking-wide text-gray-500"
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '10px' }}
      >
        {t('probability_distribution')}
      </p>

      <div className="flex flex-col gap-3">
        {CLASS_KEYS.map((cls) => {
          const pct = Math.round(result.probabilities[cls] * 100);
          const isTop = cls === result.class;
          return (
            <div key={cls} className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span
                  className={cn('uppercase tracking-wide', isTop && 'font-bold')}
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '10px' }}
                >
                  {t(`class_${cls}`)}
                </span>
                <span
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '10px' }}
                >
                  {pct}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-1">
                <div
                  className={cn('h-1 transition-all', isTop ? 'bg-black' : 'bg-gray-400')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
