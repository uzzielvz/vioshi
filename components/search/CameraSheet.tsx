'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import VisualSearchDotField from '@/components/VisualSearchDotField';
import { ChevronIcon, FlipCameraIcon, ImageIcon } from '@/components/ui/icons';
import { buttonClass } from '@/components/ui/styles';

type Phase = 'starting' | 'live' | 'unavailable' | 'captured';
type Facing = 'environment' | 'user';

// How long the shot takes to settle before the search page takes over.
const SETTLE_MS = 650;

// Live camera for «Buscar por foto», with the gallery on one side and the flip
// on the other. The shot flashes, then shrinks to where the «Buscando…» screen
// shows it, faded under the same dot field, so the hand-off to /visual-search
// reads as one motion. Without camera access it falls back to the gallery.
export default function CameraSheet({
  leaving,
  onClose,
  onPhoto,
}: {
  /** Fades the sheet out once the search page is showing the photo. */
  leaving: boolean;
  onClose: () => void;
  onPhoto: (file: File) => void;
}) {
  const t = useTranslations('ui.camera');
  const tVisual = useTranslations('ui.visual');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const shotRef = useRef<HTMLImageElement>(null);

  const [facing, setFacing] = useState<Facing>('environment');
  const [phase, setPhase] = useState<Phase>('starting');
  const [shotUrl, setShotUrl] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (phase === 'captured') return;
    let cancelled = false;

    async function start() {
      stopStream();
      if (!navigator.mediaDevices?.getUserMedia) {
        setPhase('unavailable');
        return;
      }
      setPhase('starting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        setPhase('live');
      } catch {
        if (!cancelled) setPhase('unavailable');
      }
    }

    start();
    return () => {
      cancelled = true;
      stopStream();
    };
    // `phase` only gates the restart after a shot; flipping the camera restarts it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing, stopStream]);

  useEffect(() => {
    return () => {
      if (shotUrl) URL.revokeObjectURL(shotUrl);
    };
  }, [shotUrl]);

  const submitFile = useCallback(
    (file: File) => {
      stopStream();
      setShotUrl(URL.createObjectURL(file));
      setSettled(false);
      setPhase('captured');
      window.setTimeout(() => onPhoto(file), SETTLE_MS + 150);
    },
    [onPhoto, stopStream]
  );

  async function takePhoto() {
    const video = videoRef.current;
    if (phase !== 'live' || !video || !video.videoWidth) return;
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Keep the selfie camera as the person saw it on screen.
    if (facing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    if (blob) submitFile(new File([blob], 'foto.jpg', { type: 'image/jpeg' }));
  }

  function onGalleryPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) submitFile(file);
  }

  // FLIP: the still starts covering the screen like the preview did and
  // eases into its place on the «Buscando…» layout.
  useLayoutEffect(() => {
    const img = shotRef.current;
    if (phase !== 'captured' || !img) return;

    const run = () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rect = img.getBoundingClientRect();
      if (reduce || !rect.width || !rect.height) {
        setSettled(true);
        return;
      }
      const cover = Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height);
      const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
      const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
      img.style.transition = 'none';
      img.style.transform = `translate(${dx}px, ${dy}px) scale(${cover})`;
      img.style.opacity = '1';
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          img.style.transition = `transform ${SETTLE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${SETTLE_MS}ms ease`;
          img.style.transform = 'none';
          img.style.opacity = '0.18';
          setSettled(true);
        })
      );
    };

    if (img.complete && img.naturalWidth) run();
    else img.addEventListener('load', run, { once: true });
  }, [phase, shotUrl]);

  const captured = phase === 'captured';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
      className={clsx(
        'fixed inset-0 z-[60] overflow-hidden transition-[background-color,opacity] duration-500',
        captured && settled ? 'bg-paper' : 'bg-ink',
        leaving && 'opacity-0'
      )}
    >
      {!captured && (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={clsx(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            phase === 'live' ? 'opacity-100' : 'opacity-0',
            facing === 'user' && '-scale-x-100'
          )}
        />
      )}

      {captured && shotUrl && (
        <div className="absolute inset-0 flex items-center justify-center pt-12">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={shotRef}
              src={shotUrl}
              alt={tVisual('your_photo')}
              className="block max-h-[75vh] max-w-[min(90vw,540px)] opacity-0 will-change-transform"
            />
            {settled && (
              <VisualSearchDotField
                imageUrl={shotUrl}
                color="#111111"
                className="vs-fade-in pointer-events-none absolute inset-0 h-full w-full"
              />
            )}
          </div>
          {/* Shutter flash. */}
          <span className="cam-flash pointer-events-none absolute inset-0 bg-paper" />
        </div>
      )}

      {captured && settled && (
        <p role="status" className="vs-fade-in absolute left-4 top-[max(16px,env(safe-area-inset-top))] text-[14px] font-semibold text-ink">
          {tVisual('looking')}
        </p>
      )}

      {!captured && (
        <>
          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-ink/50 to-transparent px-2 pb-6 pt-[max(10px,env(safe-area-inset-top))]">
            <button type="button" onClick={onClose} aria-label={t('close')} className="grid h-11 w-11 place-items-center text-paper">
              <ChevronIcon className="h-6 w-6 rotate-180" />
            </button>
            {phase === 'live' && <p className="text-[13px] font-medium text-paper/90">{t('hint')}</p>}
            <span className="h-11 w-11" />
          </div>

          {phase === 'unavailable' && (
            <div className="absolute inset-0 grid place-items-center px-8 text-center">
              <div className="grid max-w-[300px] justify-items-center gap-3">
                <p className="text-[17px] font-bold text-paper">{t('unavailable_title')}</p>
                <p className="text-[13.5px] leading-[1.45] text-paper/75">{t('unavailable_body')}</p>
                <button type="button" onClick={() => galleryRef.current?.click()} className={buttonClass('soft', 'sm', 'mt-2 bg-paper')}>
                  {t('choose')}
                </button>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 items-center bg-gradient-to-t from-ink/50 to-transparent px-8 pb-[max(28px,calc(env(safe-area-inset-bottom)+16px))] pt-10">
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              aria-label={t('gallery')}
              className="grid h-12 w-12 place-items-center justify-self-start rounded-[10px] border border-paper/50 bg-paper/15 text-paper backdrop-blur-sm"
            >
              <ImageIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={takePhoto}
              disabled={phase !== 'live'}
              aria-label={t('shutter')}
              className="grid h-[76px] w-[76px] place-items-center justify-self-center rounded-full border-[3px] border-paper transition-transform active:scale-95 disabled:opacity-40"
            >
              <span className="h-[62px] w-[62px] rounded-full bg-paper" />
            </button>
            <button
              type="button"
              onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
              disabled={phase === 'unavailable'}
              aria-label={t('flip')}
              className="grid h-12 w-12 place-items-center justify-self-end rounded-full bg-paper/15 text-paper backdrop-blur-sm disabled:opacity-40"
            >
              <FlipCameraIcon className="h-6 w-6" />
            </button>
          </div>
        </>
      )}

      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={onGalleryPick}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
