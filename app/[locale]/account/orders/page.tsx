'use client';

import Link from 'next/link';
import { useLocaleContext } from '@/hooks/useLocaleContext';

const mockOrders = [
  {
    id: 'ORDER001',
    date: '2026-01-10',
    status: 'Entregado',
    total: 1250.0,
    items: [{ name: 'Hoodie Classic Black', quantity: 1, price: 1250.0 }],
  },
  {
    id: 'ORDER002',
    date: '2026-01-05',
    status: 'En tránsito',
    total: 2800.0,
    trackingNumber: 'FX123456789MX',
    items: [{ name: 'Chamarra Bomber', quantity: 1, price: 2800.0 }],
  },
  {
    id: 'ORDER003',
    date: '2025-12-28',
    status: 'Procesando',
    total: 850.0,
    items: [{ name: 'Playera Oversized', quantity: 2, price: 425.0 }],
  },
];

const fontStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default function OrdersPage() {
  const { locale } = useLocaleContext();

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

        {/* Orders */}
        {mockOrders.length === 0 ? (
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
            {mockOrders.map((order) => (
              <Link
                key={order.id}
                href={`/${locale}/account/orders/${order.id}`}
                className="flex items-start justify-between border-b border-gray-200 py-5 hover:opacity-60 transition-opacity"
              >
                <div className="space-y-1.5">
                  <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000' }}>
                    #{order.id}
                  </p>
                  <p style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(order.date).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p style={{ fontSize: '10px', color: '#999', letterSpacing: '0.02em' }}>
                    {order.items.map((i) => i.name).join(', ')}
                  </p>
                  {order.trackingNumber && (
                    <p style={{ fontSize: '10px', color: '#999', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                      Rastreo: {order.trackingNumber}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-1.5 flex-shrink-0 ml-4">
                  <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000' }}>
                    ${order.total.toFixed(2)}
                  </p>
                  <p style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {order.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
