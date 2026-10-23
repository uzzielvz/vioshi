'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClass } from '@/components/ui/styles';
import { resolveCheckoutReturnAction } from '../actions';

function Confirming() {
  const t = useTranslations('ui.order');
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <p role="status" className="text-[14px] text-muted">
        {t('confirming')}
      </p>
    </div>
  );
}

function CheckoutReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocaleContext();
  const t = useTranslations('ui.order');
  const [error, setError] = useState<string | null>(null);
  // Plain strings keep the effect from re-running (and re-resolving) on re-render.
  const missingMessage = t('return_missing');
  const failedMessage = t('return_error');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError(missingMessage);
      return;
    }

    let cancelado = false;

    // El número de pedido se resuelve en el SERVIDOR a partir del session_id,
    // verificándolo contra Stripe. No se confía en sessionStorage, que se
    // pierde si el cliente vuelve desde otra pestaña o desde el banco.
    resolveCheckoutReturnAction(sessionId)
      .then((res) => {
        if (cancelado) return;
        if (!res.ok) {
          setError(res.message);
          return;
        }
        sessionStorage.removeItem('viogi_checkout_payment');
        sessionStorage.removeItem('viogi_pending_order');
        router.replace(
          `/${locale}/checkout/success/${encodeURIComponent(res.orderNumber)}?session_id=${encodeURIComponent(sessionId)}`
        );
      })
      .catch(() => {
        if (!cancelado) setError(failedMessage);
      });

    return () => {
      cancelado = true;
    };
  }, [searchParams, router, locale, missingMessage, failedMessage]);

  if (error) {
    return (
      <EmptyState title={t('return_title')} body={error} className="py-20">
        <Link href={`/${locale}/account/orders`} className={buttonClass('primary')}>
          {t('see_purchases')}
        </Link>
        <Link href={`/${locale}`} className={buttonClass('soft')}>
          {t('keep_browsing')}
        </Link>
      </EmptyState>
    );
  }

  return <Confirming />;
}

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={<Confirming />}>
      <CheckoutReturnContent />
    </Suspense>
  );
}
