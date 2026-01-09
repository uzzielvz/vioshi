import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShippingPaymentsReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[56px]">
        <div className="px-8 py-12 md:px-32 max-w-6xl">
          {/* Título solo visible en móvil */}
          <h1 
            className="md:hidden mb-8 uppercase"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
            }}
          >
            Envíos, Pagos y Devoluciones
          </h1>

          <div 
            className="space-y-12"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif"
            }}
          >
            {/* Envíos */}
            <section>
              <h2 
                className="text-2xl font-bold mb-6 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Envíos
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2 text-lg">Tiempos de entrega</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Ciudad de México y área metropolitana: 2-3 días hábiles</li>
                    <li>Interior de la República: 3-5 días hábiles</li>
                    <li>Zonas rurales: 5-7 días hábiles</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold mb-2 text-lg">Costos de envío</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Envío estándar: $99 MXN</li>
                    <li>Envío express (24-48 hrs): $199 MXN</li>
                    <li><strong>Envío gratis en compras mayores a $1,500 MXN</strong></li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold mb-2 text-lg">Seguimiento</h3>
                  <p className="text-gray-700">
                    Una vez que tu pedido sea enviado, recibirás un correo electrónico con tu número 
                    de guía para rastrear tu paquete en tiempo real.
                  </p>
                </div>
              </div>
            </section>

            {/* Pagos */}
            <section className="border-t pt-8">
              <h2 
                className="text-2xl font-bold mb-6 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Métodos de pago
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2 text-lg">Aceptamos:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Tarjetas de crédito (Visa, Mastercard, American Express)</li>
                    <li>Tarjetas de débito</li>
                    <li>PayPal</li>
                    <li>Mercado Pago</li>
                    <li>Transferencia bancaria / SPEI</li>
                    <li>Pago en efectivo (OXXO, 7-Eleven)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold mb-2 text-lg">Seguridad</h3>
                  <p className="text-gray-700">
                    Todas las transacciones están encriptadas y protegidas. No almacenamos información 
                    de tarjetas de crédito en nuestros servidores. Utilizamos procesadores de pago 
                    certificados PCI DSS.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold mb-2 text-lg">Meses sin intereses</h3>
                  <p className="text-gray-700">
                    Ofrecemos meses sin intereses en compras mayores a $1,000 MXN con tarjetas 
                    participantes (3, 6, 9 y 12 MSI según el banco).
                  </p>
                </div>
              </div>
            </section>

            {/* Devoluciones */}
            <section className="border-t pt-8">
              <h2 
                className="text-2xl font-bold mb-6 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Devoluciones y cambios
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2 text-lg">Política de devoluciones</h3>
                  <p className="text-gray-700 mb-4">
                    Tienes 30 días a partir de la fecha de recepción para devolver cualquier producto 
                    que no cumpla con tus expectativas.
                  </p>
                  <p className="text-gray-700 mb-2"><strong>Condiciones:</strong></p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>El producto debe estar sin usar, con sus etiquetas originales</li>
                    <li>En su empaque original</li>
                    <li>Con todos sus accesorios (si aplica)</li>
                    <li>No se aceptan devoluciones de ropa interior por razones de higiene</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold mb-2 text-lg">Proceso de devolución</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Inicia tu solicitud de devolución desde tu cuenta o contáctanos</li>
                    <li>Recibirás una etiqueta de envío prepagada por correo electrónico</li>
                    <li>Empaca el producto de forma segura con la etiqueta</li>
                    <li>Lleva el paquete a la paquetería indicada</li>
                    <li>Una vez recibido, procesaremos tu reembolso en 5-7 días hábiles</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-bold mb-2 text-lg">Cambios</h3>
                  <p className="text-gray-700">
                    Si deseas cambiar un producto por otra talla o color, contáctanos y te 
                    asistiremos en el proceso. Los cambios están sujetos a disponibilidad de stock.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold mb-2 text-lg">Reembolsos</h3>
                  <p className="text-gray-700">
                    Los reembolsos se procesan al mismo método de pago utilizado en la compra original. 
                    El tiempo de aparición en tu cuenta puede variar según tu institución bancaria (generalmente 5-10 días hábiles).
                  </p>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section className="border-t pt-8">
              <h2 
                className="text-2xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                ¿Tienes dudas?
              </h2>
              <p className="text-gray-700">
                Nuestro equipo de soporte está aquí para ayudarte. Contáctanos a través de{' '}
                <a href="/pages/customer-support" className="underline">customer support</a> o 
                escríbenos a <a href="mailto:support@viogi.com" className="underline">support@viogi.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

