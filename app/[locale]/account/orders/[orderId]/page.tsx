import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getOrderById } from '@/lib/orders';

interface Props {
  params: { locale: string; orderId: string };
}

const fontStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

const STATUS_LABELS: Record<string, string> = {
  pending:    'Pendiente',
  processing: 'En proceso',
  shipped:    'Enviado',
  delivered:  'Entregado',
  cancelled:  'Cancelado',
};

const DELIVERY_LABELS: Record<string, string> = {
  home:   'Envío a domicilio',
  pickup: 'Recoger en punto',
};

const SHIPPING_LABELS: Record<string, string> = {
  standard: 'Estándar',
  express:  'Express (2-3 días)',
};

export default async function OrderDetailPage({ params }: Props) {
  const { locale, orderId } = params;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account`);
  }

  const order = await getOrderById(orderId);
  if (!order) notFound();

  const formattedDate = new Date(order.created_at).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white" style={fontStyle}>
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <Link
            href={`/${locale}/account/orders`}
            className="inline-flex items-center gap-2 hover:opacity-60 transition-opacity mb-4"
            style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Mis Pedidos
          </Link>
          <div className="flex items-center justify-between">
            <h1 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000' }}>
              Pedido #{order.order_number}
            </h1>
            <p style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {STATUS_LABELS[order.status] ?? order.status}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* Main */}
          <div className="lg:col-span-2 space-y-8">

            {/* Products */}
            <div>
              <p className="uppercase tracking-wide mb-4 pb-2 border-b border-gray-200"
                style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>
                Productos
              </p>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    {item.product_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-20 h-20 object-contain bg-gray-50 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>{item.product_name}</p>
                      <p className="mt-1" style={{ fontSize: '10px', color: '#666' }}>
                        {[item.size && `Talla: ${item.size}`, item.color && `Color: ${item.color}`]
                          .filter(Boolean)
                          .join(' / ')}
                      </p>
                      <p style={{ fontSize: '10px', color: '#666' }}>Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>
                        ${Number(item.total_price_mxn).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking */}
            {order.tracking_number && (
              <div>
                <p className="uppercase tracking-wide mb-4 pb-2 border-b border-gray-200"
                  style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>
                  Información de Envío
                </p>
                <div className="space-y-2">
                  <p style={{ fontSize: '10px', color: '#999' }} className="uppercase tracking-wide">
                    Número de Rastreo
                  </p>
                  <p style={{ fontSize: '11px', color: '#000', fontFamily: 'monospace' }}>
                    {order.tracking_number}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* Summary */}
            <div>
              <p className="uppercase tracking-wide mb-4 pb-2 border-b border-gray-200"
                style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>
                Resumen
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ fontSize: '11px', color: '#666' }}>Subtotal</span>
                  <span style={{ fontSize: '11px', color: '#000' }}>${Number(order.subtotal_mxn).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '11px', color: '#666' }}>Envío</span>
                  <span style={{ fontSize: '11px', color: '#000' }}>${Number(order.shipping_mxn).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '11px', color: '#666' }}>IVA</span>
                  <span style={{ fontSize: '11px', color: '#000' }}>${Number(order.tax_mxn).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="uppercase tracking-wide" style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>Total</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>
                    ${Number(order.total_mxn).toFixed(2)} MXN
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery info */}
            <div>
              <p className="uppercase tracking-wide mb-4 pb-2 border-b border-gray-200"
                style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>
                Entrega
              </p>
              <div className="space-y-1">
                <p style={{ fontSize: '11px', color: '#000' }}>
                  {DELIVERY_LABELS[order.delivery_method] ?? order.delivery_method}
                </p>
                {order.delivery_method === 'home' && order.shipping_method && (
                  <p style={{ fontSize: '10px', color: '#666' }}>
                    {SHIPPING_LABELS[order.shipping_method] ?? order.shipping_method}
                  </p>
                )}
                {order.delivery_method === 'pickup' && order.pickup_point_id && (
                  <p style={{ fontSize: '10px', color: '#666' }}>Punto: {order.pickup_point_id}</p>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <p className="uppercase tracking-wide mb-2 pb-2 border-b border-gray-200"
                style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>
                Fecha de Pedido
              </p>
              <p style={{ fontSize: '11px', color: '#666' }}>{formattedDate}</p>
            </div>

            {/* Email */}
            <div>
              <p className="uppercase tracking-wide mb-2 pb-2 border-b border-gray-200"
                style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>
                Contacto
              </p>
              <p style={{ fontSize: '11px', color: '#666' }}>{order.email}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 border-t border-gray-200 pt-8">
          <Link
            href={`/${locale}/pages/customer-support`}
            className="flex-1 border border-black text-black py-2.5 uppercase hover:bg-black hover:text-white transition-colors text-center"
            style={{ fontSize: '11px', letterSpacing: '0.05em' }}
          >
            Contactar Soporte
          </Link>
        </div>

      </div>
    </div>
  );
}
