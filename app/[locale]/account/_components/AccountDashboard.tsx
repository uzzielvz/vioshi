import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Locale } from '@/i18n';
import type { OrderRow } from '@/lib/orders';
import AccountShell from './AccountShell';
import { getAccountDisplayName } from './accountDisplayName';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function AccountDashboard({
  user,
  profileName,
  locale,
  recentOrders,
}: {
  user: User;
  profileName: string | null;
  locale: Locale;
  recentOrders: OrderRow[];
}) {
  const displayName = getAccountDisplayName(user, profileName);
  const email = user.email ?? '';

  return (
    <AccountShell locale={locale} displayName={displayName} email={email}>
      <div>
        <header className="mb-8 pb-6 border-b border-gray-200">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
            Hola
          </p>
          <h1 className="text-[13px] font-semibold uppercase tracking-widest text-black">
            {displayName}
          </h1>
          <p className="text-[11px] text-gray-400 mt-3 max-w-md leading-relaxed">
            Gestiona tus pedidos, direcciones y perfil desde aquí.
          </p>
        </header>

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-black">
              Pedidos recientes
            </h2>
            {recentOrders.length > 0 && (
              <Link
                href={`/${locale}/account/orders`}
                className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              >
                Ver todos
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 border-t border-gray-100">
              <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-2">
                No tienes pedidos
              </p>
              <p className="text-[11px] text-gray-400 mb-6">
                Cuando compres algo, aparecerá aquí.
              </p>
              <Link
                href={`/${locale}/collections/all`}
                className="inline-block bg-black text-white px-8 py-2.5 text-[11px] uppercase tracking-widest hover:opacity-80 transition-opacity"
              >
                Explorar
              </Link>
            </div>
          ) : (
            <ul>
              {recentOrders.map((order) => {
                const itemNames = order.order_items
                  .map((i) => i.product_name)
                  .join(', ');
                const formattedDate = new Date(order.created_at).toLocaleDateString(
                  'es-MX',
                  { year: 'numeric', month: 'short', day: 'numeric' }
                );

                return (
                  <li key={order.id}>
                    <Link
                      href={`/${locale}/account/orders/${order.id}`}
                      className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 hover:opacity-60 transition-opacity"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-black">
                          #{order.order_number}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                          {formattedDate}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 truncate">
                          {itemNames}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-black">
                          ${Number(order.total_mxn).toFixed(2)}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                          {STATUS_LABELS[order.status] ?? order.status}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AccountShell>
  );
}
