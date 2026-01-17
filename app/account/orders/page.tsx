'use client';

import Link from 'next/link';
import Image from 'next/image';

// Mock data
const mockOrders = [
  {
    id: 'ORDER001',
    date: '2026-01-10',
    status: 'Entregado',
    total: 1250.0,
    items: [
      {
        name: 'Hoodie Classic Black',
        image: '/products/hoodie-black.jpg',
        quantity: 1,
        price: 1250.0,
      },
    ],
  },
  {
    id: 'ORDER002',
    date: '2026-01-05',
    status: 'En tránsito',
    total: 2800.0,
    trackingNumber: 'FX123456789MX',
    items: [
      {
        name: 'Chamarra Bomber',
        image: '/products/bomber.jpg',
        quantity: 1,
        price: 2800.0,
      },
    ],
  },
  {
    id: 'ORDER003',
    date: '2025-12-28',
    status: 'Procesando',
    total: 850.0,
    items: [
      {
        name: 'Playera Oversized',
        image: '/products/tee-oversized.jpg',
        quantity: 2,
        price: 425.0,
      },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'entregado':
      return 'bg-green-100 text-green-800';
    case 'en tránsito':
      return 'bg-blue-100 text-blue-800';
    case 'procesando':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="text-sm uppercase tracking-wider text-gray-600 hover:text-black transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a Mi Cuenta
          </Link>
          <h1 className="text-3xl font-bold uppercase tracking-wider mt-4">
            Mis Pedidos
          </h1>
        </div>

        {/* Orders List */}
        {mockOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-wider">
                  No Tienes Pedidos
                </h2>
                <p className="text-gray-600">
                  Cuando realices una compra, tus pedidos aparecerán aquí
                </p>
              </div>
              <Link
                href="/collections/all"
                className="inline-block bg-black text-white px-8 py-4 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors"
              >
                Explorar Productos
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors"
              >
                <Link href={`/account/orders/${order.id}`}>
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500">
                            Pedido
                          </p>
                          <p className="font-medium">#{order.id}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500">
                            Fecha
                          </p>
                          <p className="font-medium">
                            {new Date(order.date).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <p className="text-lg font-bold">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {order.trackingNumber && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Número de Rastreo
                        </p>
                        <p className="font-mono font-medium">
                          {order.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <div className="w-full h-full bg-gray-200"></div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              Cantidad: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 border-2 border-black text-black py-2 rounded uppercase tracking-wider text-sm font-medium hover:bg-black hover:text-white transition-colors">
                      Ver Detalles
                    </button>
                    {order.trackingNumber && (
                      <button className="flex-1 border-2 border-gray-300 text-black py-2 rounded uppercase tracking-wider text-sm font-medium hover:border-black transition-colors">
                        Rastrear Pedido
                      </button>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
