'use client';

import Link from 'next/link';
import { useLocaleContext } from '@/hooks/useLocaleContext';

interface OrderDetailPageProps {
  params: {
    orderId: string;
  };
}

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

const fontStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { locale } = useLocaleContext();
  const order = getMockOrder(params.orderId);

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
              Pedido #{order.orderNumber}
            </h1>
            <p style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {order.status}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">

            {/* Products */}
            <div>
              <p
                className="uppercase tracking-wide mb-4 pb-2 border-b border-gray-200"
                style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}
              >
                Productos
              </p>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-gray-100 flex-shrink-0" />
                    <div className="flex-1">
                      <p style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>{item.name}</p>
                      <p className="mt-1" style={{ fontSize: '10px', color: '#666' }}>
                        {item.size && `Talla: ${item.size}`}
                        {item.color && ` / Color: ${item.color}`}
                      </p>
                      <p style={{ fontSize: '10px', color: '#666' }}>Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking */}
            {order.trackingNumber && (
              <div>
                <p
                  className="uppercase tracking-wide mb-4 pb-2 border-b border-gray-200"
                  style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  Información de Envío
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="uppercase tracking-wide" style={{ fontSize: '10px', color: '#999', letterSpacing: '0.05em' }}>
                      Paquetería
                    </p>
                    <p style={{ fontSize: '11px', color: '#000' }}>{order.carrier}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide" style={{ fontSize: '10px', color: '#999', letterSpacing: '0.05em' }}>
                      Número de Rastreo
                    </p>
                    <p style={{ fontSize: '11px', color: '#000', fontFamily: 'monospace' }}>{order.trackingNumber}</p>
                  </div>
                  <button
                    className="w-full mt-2 bg-black text-white py-2.5 uppercase hover:opacity-75 transition-opacity"
                    style={{ fontSize: '11px', letterSpacing: '0.05em' }}
                  >
                    Rastrear Paquete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* Summary */}
            <div>
              <p
                className="uppercase tracking-wide mb-4 pb-2 border-b border-gray-200"
                style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}
              >
                Resumen
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ fontSize: '11px', color: '#666' }}>Subtotal</span>
                  <span style={{ fontSize: '11px', color: '#000' }}>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '11px', color: '#666' }}>Envío</span>
                  <span style={{ fontSize: '11px', color: '#000' }}>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '11px', color: '#666' }}>Impuestos</span>
                  <span style={{ fontSize: '11px', color: '#000' }}>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="uppercase tracking-wide" style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>Total</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <p
                className="uppercase tracking-wide mb-4 pb-2 border-b border-gray-200"
                style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}
              >
                Dirección de Envío
              </p>
              <div className="space-y-0.5">
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>{order.shippingAddress.name}</p>
                <p style={{ fontSize: '11px', color: '#666' }}>{order.shippingAddress.street}</p>
                {order.shippingAddress.apartment && (
                  <p style={{ fontSize: '11px', color: '#666' }}>{order.shippingAddress.apartment}</p>
                )}
                <p style={{ fontSize: '11px', color: '#666' }}>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p style={{ fontSize: '11px', color: '#666' }}>{order.shippingAddress.country}</p>
                <p className="pt-2" style={{ fontSize: '11px', color: '#666' }}>{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment */}
            <div>
              <p
                className="uppercase tracking-wide mb-4 pb-2 border-b border-gray-200"
                style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}
              >
                Método de Pago
              </p>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}>{order.paymentMethod.type}</p>
              <p style={{ fontSize: '11px', color: '#666' }}>
                {order.paymentMethod.brand} •••• {order.paymentMethod.last4}
              </p>
            </div>

            {/* Date */}
            <div>
              <p
                className="uppercase tracking-wide mb-2 pb-2 border-b border-gray-200"
                style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}
              >
                Fecha de Pedido
              </p>
              <p style={{ fontSize: '11px', color: '#666' }}>
                {new Date(order.date).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
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
          <Link
            href={`/${locale}/account/archivos`}
            className="flex-1 border border-gray-300 text-black py-2.5 uppercase hover:border-black transition-colors text-center"
            style={{ fontSize: '11px', letterSpacing: '0.05em' }}
          >
            Descargar Factura
          </Link>
        </div>
      </div>
    </div>
  );
}
