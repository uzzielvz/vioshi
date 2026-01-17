'use client';

import Link from 'next/link';

interface OrderDetailPageProps {
  params: {
    orderId: string;
  };
}

// Mock order data
const getMockOrder = (orderId: string) => ({
  id: orderId,
  orderNumber: orderId,
  date: '2026-01-10',
  status: 'Entregado',
  trackingNumber: 'FX123456789MX',
  carrier: 'FedEx',
  items: [
    {
      id: '1',
      name: 'Hoodie Classic Black',
      size: 'L',
      color: 'Black',
      quantity: 1,
      price: 1250.0,
      image: '/products/hoodie-black.jpg',
    },
  ],
  subtotal: 1250.0,
  tax: 125.0,
  shipping: 10.0,
  total: 1385.0,
  shippingAddress: {
    name: 'Juan Pérez',
    street: 'Av. Insurgentes Sur 1234',
    apartment: 'Depto 301',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '03100',
    country: 'México',
    phone: '+52 55 1234 5678',
  },
  paymentMethod: {
    type: 'Tarjeta de crédito',
    last4: '4242',
    brand: 'Visa',
  },
});

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const order = getMockOrder(params.orderId);

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account/orders"
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
            Volver a Mis Pedidos
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
            <h1 className="text-3xl font-bold uppercase tracking-wider">
              Pedido #{order.orderNumber}
            </h1>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-xs font-medium uppercase tracking-wider w-fit">
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
                Productos
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gray-200"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.size && `Talla: ${item.size}`}
                        {item.color && ` / Color: ${item.color}`}
                      </p>
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

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
                  Información de Envío
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Paquetería
                    </p>
                    <p className="font-medium">{order.carrier}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Número de Rastreo
                    </p>
                    <p className="font-mono font-medium">{order.trackingNumber}</p>
                  </div>
                  <button className="w-full mt-4 bg-black text-white py-3 rounded uppercase tracking-wider text-sm font-medium hover:bg-gray-800 transition-colors">
                    Rastrear Paquete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
                Resumen
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impuestos</span>
                  <span className="font-medium">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-medium uppercase tracking-wider">Total</span>
                  <span className="text-xl font-bold">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
                Dirección de Envío
              </h2>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                {order.shippingAddress.apartment && (
                  <p>{order.shippingAddress.apartment}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
                Método de Pago
              </h2>
              <div className="text-sm">
                <p className="font-medium">{order.paymentMethod.type}</p>
                <p className="text-gray-600">
                  {order.paymentMethod.brand} •••• {order.paymentMethod.last4}
                </p>
              </div>
            </div>

            {/* Order Date */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-sm uppercase tracking-wider font-medium mb-2">
                Fecha de Pedido
              </h2>
              <p className="text-sm">
                {new Date(order.date).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/pages/customer-support"
            className="flex-1 border-2 border-black text-black py-3 rounded uppercase tracking-wider text-sm font-medium hover:bg-black hover:text-white transition-colors text-center"
          >
            Contactar Soporte
          </Link>
          <button className="flex-1 border-2 border-gray-300 text-black py-3 rounded uppercase tracking-wider text-sm font-medium hover:border-black transition-colors">
            Descargar Factura
          </button>
        </div>
      </div>
    </main>
  );
}
