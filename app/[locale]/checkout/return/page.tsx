'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { resolveCheckoutReturnAction } from '../actions';

const FONT = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" };

function CheckoutReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocaleContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No pudimos identificar tu pago. Revisa "Mis Pedidos" o escríbenos.');
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
        if (!cancelado) setError('No pudimos confirmar tu pago. Revisa "Mis Pedidos".');
      });

    return () => {
      cancelado = true;
    };
  }, [searchParams, router, locale]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={FONT}>
        <div className="text-center space-y-6 max-w-sm">
          <p className="text-[13px] text-red-600 leading-relaxed">{error}</p>
          <div className="space-y-2">
            <Link
              href={`/${locale}/account/orders`}
              className="block text-[11px] uppercase tracking-widest underline"
            >
              Ver mis pedidos
            </Link>
            <Link
              href={`/${locale}/collections/all`}
              className="block text-[11px] uppercase tracking-widest text-gray-400 hover:text-black"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={FONT}>
      <p className="text-[13px] text-gray-400 tracking-wide">Confirmando tu pago…</p>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={FONT}>
          <p className="text-[13px] text-gray-400">Confirmando tu pago…</p>
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}
