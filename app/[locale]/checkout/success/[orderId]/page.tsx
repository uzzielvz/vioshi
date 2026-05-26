import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getGuestOrderByPaymentIntent,
  getOrderByNumber,
  getOrderByPaymentReference,
} from '@/lib/orders';
import { createClient } from '@/lib/supabase/server';
import ClearCartOnMount from './_components/ClearCartOnMount';

interface Props {
  params: { locale: string; orderId: string };
  searchParams: {
    t?: string;
    payment_intent?: string;
    redirect_status?: string;
  };
}

const fontStyle = { fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" };

const STATUS_LABELS: Record<string, string> = {
  pending:    'Pendiente',
  processing: 'En proceso',
  shipped:    'Enviado',
  delivered:  'Entregado',
  cancelled:  'Cancelado',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending:   'Pago pendiente',
  completed: 'Pago completado',
  failed:    'Pago fallido',
  refunded:  'Reembolsado',
};

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { locale, orderId: orderNumberParam } = params;
  const orderNumber = decodeURIComponent(orderNumberParam);
  const guestToken = searchParams.t ?? null;
  const paymentIntentId = searchParams.payment_intent ?? null;

  // Resolve current user (may be null for guests)
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const lookupOpts = { userId: user?.id ?? null, guestToken };

  let order =
    (await getOrderByNumber(orderNumber, lookupOpts)) ??
    (paymentIntentId
      ? user
        ? await getOrderByPaymentReference(paymentIntentId, { userId: user.id })
        : guestToken
          ? await getOrderByPaymentReference(paymentIntentId, { guestToken })
          : await getGuestOrderByPaymentIntent(paymentIntentId)
      : null);

  if (!order) {
    // Parche temporal para evitar 404 cuando se pierde sessionStorage después del redirect de Stripe.
    // Esto permite que el usuario vea un mensaje útil en vez de página no encontrada.
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6" style={fontStyle}>
        <div className="max-w-md text-center space-y-6">
          <p className="text-[15px]">Pago registrado correctamente.</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            No pudimos cargar los detalles del pedido automáticamente.<br />
            En unos minutos debería aparecer en <strong>Mis Pedidos</strong>.
          </p>
          <div className="pt-2">
            <Link
              href={`/${locale}/account/orders`}
              className="inline-block text-[11px] uppercase tracking-widest underline hover:opacity-70"
            >
              Ir a Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white" style={fontStyle}>
      {/* Clear cart from localStorage once the order is confirmed */}
      <ClearCartOnMount />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center space-y-8">

          {/* Success mark */}
          <p style={{ fontSize: '48px', fontWeight: 200, lineHeight: 1, color: '#000' }}>✓</p>

          {/* Message */}
          <div className="space-y-2">
            <h1
              className="uppercase tracking-wide"
              style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}
            >
              Pedido Confirmado
            </h1>
            <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
              Gracias por tu compra. Recibirás más información pronto.
            </p>
          </div>

          {/* Order number + status */}
          <div className="border border-gray-200 p-6 space-y-3">
            <div>
              <p
                className="uppercase tracking-wide mb-1"
                style={{ fontSize: '10px', color: '#999', letterSpacing: '0.05em' }}
              >
                Número de Pedido
              </p>
              <p style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '0.05em', color: '#000' }}>
                #{order.order_number}
              </p>
            </div>
            <div className="flex justify-between text-left pt-2 border-t border-gray-100">
              <div>
                <p style={{ fontSize: '10px', color: '#999' }} className="uppercase tracking-wide mb-0.5">
                  Estado
                </p>
                <p style={{ fontSize: '11px', color: '#000' }}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: '10px', color: '#999' }} className="uppercase tracking-wide mb-0.5">
                  Pago
                </p>
                <p style={{ fontSize: '11px', color: order.payment_status === 'completed' ? '#000' : '#9ca3af' }}>
                  {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                </p>
              </div>
            </div>
            <p style={{ fontSize: '10px', color: '#999' }}>{formattedDate}</p>
          </div>

          {/* Items */}
          <div className="text-left border border-gray-200 divide-y divide-gray-100">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center px-4 py-3 gap-4">
                <div className="min-w-0">
                  <p style={{ fontSize: '11px', color: '#000' }} className="truncate">{item.product_name}</p>
                  <p style={{ fontSize: '10px', color: '#999' }}>
                    {[item.size, item.color].filter(Boolean).join(' / ')}
                    {' · '}×{item.quantity}
                  </p>
                </div>
                <p style={{ fontSize: '11px', color: '#000' }} className="flex-shrink-0">
                  ${Number(item.total_price_mxn).toFixed(2)}
                </p>
              </div>
            ))}

            {/* Totals */}
            <div className="px-4 py-3 space-y-1.5 bg-gray-50">
              <div className="flex justify-between">
                <span style={{ fontSize: '10px', color: '#666' }}>Subtotal</span>
                <span style={{ fontSize: '10px', color: '#000' }}>${Number(order.subtotal_mxn).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: '10px', color: '#666' }}>
                  {order.delivery_method === 'pickup' ? 'Costo de punto' : 'Envío'}
                </span>
                <span style={{ fontSize: '10px', color: '#000' }}>${Number(order.shipping_mxn).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: '10px', color: '#666' }}>IVA (16%)</span>
                <span style={{ fontSize: '10px', color: '#000' }}>${Number(order.tax_mxn).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#000' }} className="uppercase tracking-wide">
                  Total
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>
                  ${Number(order.total_mxn).toFixed(2)} MXN
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            {user && (
              <Link
                href={`/${locale}/account/orders/${order.id}`}
                className="block w-full bg-black text-white py-2.5 uppercase hover:opacity-75 transition-opacity text-center"
                style={{ fontSize: '11px', letterSpacing: '0.05em' }}
              >
                Ver detalles del pedido
              </Link>
            )}
            <Link
              href={`/${locale}/collections/all`}
              className="block w-full border border-black text-black py-2.5 uppercase hover:bg-black hover:text-white transition-colors text-center"
              style={{ fontSize: '11px', letterSpacing: '0.05em' }}
            >
              Continuar comprando
            </Link>
          </div>

          {/* Support */}
          <div className="pt-4 border-t border-gray-200">
            <p style={{ fontSize: '11px', color: '#666' }}>
              ¿Necesitas ayuda?{' '}
              <Link
                href={`/${locale}/pages/customer-support`}
                className="underline hover:opacity-60 transition-opacity"
                style={{ color: '#000' }}
              >
                Contacta soporte
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
