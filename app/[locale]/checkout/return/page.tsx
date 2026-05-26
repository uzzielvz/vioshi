'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocaleContext } from '@/hooks/useLocaleContext';

type PendingOrder = {
  orderNumber: string;
  guestToken: string;
};

function readPendingOrder(): PendingOrder | null {
  try {
    const raw = sessionStorage.getItem('viogi_pending_order');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingOrder;
    if (!parsed.orderNumber || !parsed.guestToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

function CheckoutReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocaleContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectStatus = searchParams.get('redirect_status');
    const paymentIntent = searchParams.get('payment_intent');
    const pending = readPendingOrder();

    if (!pending) {
      const paymentIntent = searchParams.get('payment_intent');

      // Fallback temporal: si perdimos sessionStorage pero tenemos payment_intent,
      // intentamos redirigir igual para evitar 404 en la mayoría de casos.
      if (paymentIntent) {
        router.replace(`/${locale}/checkout/success/pending?payment_intent=${paymentIntent}`);
        return;
      }

      setError('La sesión de pago expiró. Revisa "Mis Pedidos" o vuelve a intentar.');
      return;
    }

    if (redirectStatus === 'failed') {
      sessionStorage.removeItem('viogi_checkout_payment');
      setError('El pago no se completó. Revisa los datos de la tarjeta e intenta otra vez.');
      return;
    }

    const qs = new URLSearchParams();
    qs.set('t', pending.guestToken);
    if (paymentIntent) qs.set('payment_intent', paymentIntent);

    router.replace(
      `/${locale}/checkout/success/${encodeURIComponent(pending.orderNumber)}?${qs.toString()}`
    );
  }, [searchParams, router, locale]);

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }}
      >
        <div className="text-center space-y-6 max-w-sm">
          <p className="text-[11px] text-red-600 leading-relaxed">{error}</p>
          <Link
            href={`/${locale}/checkout`}
            className="inline-block text-[11px] uppercase tracking-widest underline"
          >
            Volver al checkout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }}
    >
      <p className="text-[11px] text-gray-400 tracking-wide">Confirmando pago…</p>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[11px] text-gray-400">Confirmando pago…</p>
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}
