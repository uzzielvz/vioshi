import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getOrdersByUser } from '@/lib/orders';
import type { Locale } from '@/i18n';
import AccountShell from '../_components/AccountShell';
import { getAccountDisplayName } from '../_components/accountDisplayName';

interface Props {
  params: { locale: string };
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default async function OrdersPage({ params }: Props) {
  const locale = params.locale as Locale;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  const orders = await getOrdersByUser();
  const displayName = getAccountDisplayName(user, profile?.name ?? null);

  return (
    <AccountShell
      locale={locale}
      displayName={displayName}
      email={user.email ?? ''}
    >
      <div>
        <header className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-[11px] font-semibold uppercase tracking-widest text-black">
            Mis Pedidos
          </h1>
        </header>

        {orders.length === 0 ? (
          <div className="py-12">
            <p className="text-[11px] uppercase tracking-widest text-gray-400">
              No tienes pedidos
            </p>
            <p className="mt-2 text-[11px] text-gray-400">
              Cuando realices una compra, tus pedidos aparecerán aquí
            </p>
            <Link
              href={`/${locale}/collections/all`}
              className="inline-block mt-6 bg-black text-white py-2.5 px-8 text-[11px] uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <ul>
            {orders.map((order) => {
              const itemNames = order.order_items
                .map((i) => i.product_name)
                .join(', ');
              const formattedDate = new Date(order.created_at).toLocaleDateString(
                'es-MX',
                { year: 'numeric', month: 'long', day: 'numeric' }
              );

              return (
                <li key={order.id}>
                  <Link
                    href={`/${locale}/account/orders/${order.id}`}
                    className="flex items-start justify-between gap-4 py-5 border-b border-gray-100 hover:opacity-60 transition-opacity"
                  >
                    <div className="space-y-1.5 min-w-0 pr-4">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-black">
                        #{order.order_number}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">
                        {formattedDate}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{itemNames}</p>
                      {order.tracking_number && (
                        <p className="text-[10px] text-gray-400 font-mono uppercase">
                          Rastreo: {order.tracking_number}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-1.5 flex-shrink-0">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-black">
                        ${Number(order.total_mxn).toFixed(2)}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">
                        {STATUS_LABELS[order.status] ?? order.status}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AccountShell>
  );
}
