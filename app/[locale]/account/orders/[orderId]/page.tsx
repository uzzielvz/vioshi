import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getOrderById } from '@/lib/orders';
import type { Locale } from '@/i18n';
import AccountShell from '../../_components/AccountShell';
import { getAccountDisplayName } from '../../_components/accountDisplayName';

interface Props {
  params: { locale: string; orderId: string };
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const DELIVERY_LABELS: Record<string, string> = {
  home: 'Envío a domicilio',
  pickup: 'Recoger en punto',
};

const SHIPPING_LABELS: Record<string, string> = {
  standard: 'Estándar',
  express: 'Express (2-3 días)',
};

export default async function OrderDetailPage({ params }: Props) {
  const locale = params.locale as Locale;
  const { orderId } = params;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account`);
  }

  const order = await getOrderById(orderId);
  if (!order) notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  const displayName = getAccountDisplayName(user, profile?.name ?? null);

  const formattedDate = new Date(order.created_at).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AccountShell
      locale={locale}
      displayName={displayName}
      email={user.email ?? ''}
    >
      <div>
        <header className="mb-8 pb-6 border-b border-gray-200">
          <Link
            href={`/${locale}/account/orders`}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-4"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Pedidos
          </Link>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[11px] font-semibold uppercase tracking-widest text-black">
              Pedido #{order.order_number}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">
              {STATUS_LABELS[order.status] ?? order.status}
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-black mb-4 pb-2 border-b border-gray-200">
                Productos
              </p>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    {item.product_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-20 h-20 object-contain bg-gray-50 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-50 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-black">{item.product_name}</p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {[item.size && `Talla: ${item.size}`, item.color && `Color: ${item.color}`]
                          .filter(Boolean)
                          .join(' / ')}
                      </p>
                      <p className="text-[10px] text-gray-400">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[11px] font-medium text-black">
                        ${Number(item.total_price_mxn).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.tracking_number && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-black mb-4 pb-2 border-b border-gray-200">
                  Información de Envío
                </p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  Número de Rastreo
                </p>
                <p className="text-[11px] font-mono text-black">{order.tracking_number}</p>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-black mb-4 pb-2 border-b border-gray-200">
                Resumen
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-black">${Number(order.subtotal_mxn).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Envío</span>
                  <span className="text-black">${Number(order.shipping_mxn).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2 text-[11px]">
                  <span className="uppercase tracking-widest font-semibold text-black">Total</span>
                  <span className="font-semibold text-black">
                    ${Number(order.total_mxn).toFixed(2)} MXN
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-black mb-4 pb-2 border-b border-gray-200">
                Entrega
              </p>
              <p className="text-[11px] text-black">
                {DELIVERY_LABELS[order.delivery_method] ?? order.delivery_method}
              </p>
              {order.delivery_method === 'home' && order.shipping_method && (
                <p className="text-[10px] text-gray-400 mt-1">
                  {SHIPPING_LABELS[order.shipping_method] ?? order.shipping_method}
                </p>
              )}
              {order.delivery_method === 'pickup' && order.pickup_point_id && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Punto: {order.pickup_point_id}
                </p>
              )}
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-black mb-2 pb-2 border-b border-gray-200">
                Fecha de Pedido
              </p>
              <p className="text-[11px] text-gray-400">{formattedDate}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-black mb-2 pb-2 border-b border-gray-200">
                Contacto
              </p>
              <p className="text-[11px] text-gray-400">{order.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-8">
          <Link
            href={`/${locale}/pages/customer-support`}
            className="inline-block border border-black text-black py-2.5 px-8 text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Contactar Soporte
          </Link>
        </div>
      </div>
    </AccountShell>
  );
}
