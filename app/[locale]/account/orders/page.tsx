import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getOrdersByUser } from '@/lib/orders';

interface Props {
  params: { locale: string };
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

export default async function OrdersPage({ params }: Props) {
  const { locale } = params;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account`);
  }

  const orders = await getOrdersByUser();

  return (
    <div className="min-h-screen bg-white" style={fontStyle}>
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <Link
            href={`/${locale}/account`}
            className="inline-flex items-center gap-2 hover:opacity-60 transition-opacity mb-4"
            style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Mi Cuenta
          </Link>
          <h1 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000' }}>
            Mis Pedidos
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <p style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              No tienes pedidos
            </p>
            <p className="mt-2" style={{ fontSize: '11px', color: '#999' }}>
              Cuando realices una compra, tus pedidos aparecerán aquí
            </p>
            <Link
              href={`/${locale}/collections/all`}
              className="inline-block mt-6 bg-black text-white py-2.5 px-8 hover:opacity-75 transition-opacity"
              style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div>
            {orders.map((order) => {
              const itemNames = order.order_items.map((i) => i.product_name).join(', ');
              const formattedDate = new Date(order.created_at).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <Link
                  key={order.id}
                  href={`/${locale}/account/orders/${order.id}`}
                  className="flex items-start justify-between border-b border-gray-200 py-5 hover:opacity-60 transition-opacity"
                >
                  <div className="space-y-1.5 min-w-0 pr-4">
                    <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000' }}>
                      #{order.order_number}
                    </p>
                    <p style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {formattedDate}
                    </p>
                    <p style={{ fontSize: '10px', color: '#999' }} className="truncate">
                      {itemNames}
                    </p>
                    {order.tracking_number && (
                      <p style={{ fontSize: '10px', color: '#999', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                        Rastreo: {order.tracking_number}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-1.5 flex-shrink-0">
                    <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000' }}>
                      ${Number(order.total_mxn).toFixed(2)}
                    </p>
                    <p style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
