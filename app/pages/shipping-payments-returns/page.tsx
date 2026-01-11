import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 tracking-wide uppercase">
            Envíos, Pagos y Devoluciones
          </h1>

          <div className="space-y-12">
            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Envíos</h2>
              <div className="space-y-4 text-gray-600">
                <div className="bg-white p-6 border border-gray-200">
                  <h3 className="font-medium text-black mb-2">Envío Estándar</h3>
                  <p className="text-sm mb-2">3-7 días hábiles</p>
                  <p className="text-sm">Gratis en compras mayores a $1,500 MXN</p>
                  <p className="text-sm">$99 MXN en compras menores</p>
                </div>
                <div className="bg-white p-6 border border-gray-200">
                  <h3 className="font-medium text-black mb-2">Envío Express</h3>
                  <p className="text-sm mb-2">1-3 días hábiles</p>
                  <p className="text-sm">$199 MXN</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Métodos de Pago</h2>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li>
                <li>• PayPal</li>
                <li>• Transferencia bancaria</li>
                <li>• Pago en OXXO</li>
                <li>• Meses sin intereses (3, 6, 9 y 12 MSI con tarjetas participantes)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Devoluciones</h2>
              <div className="space-y-4 text-gray-600 text-sm">
                <p>
                  Aceptamos devoluciones dentro de los 30 días posteriores a la compra,
                  siempre que el producto esté en su estado original con etiquetas.
                </p>
                <div className="bg-white p-6 border border-gray-200">
                  <h3 className="font-medium text-black mb-2">Proceso de Devolución</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Contacta a nuestro equipo de soporte</li>
                    <li>Recibirás una guía de envío prepagada</li>
                    <li>Envía el producto en su empaque original</li>
                    <li>El reembolso se procesa en 5-10 días hábiles</li>
                  </ol>
                </div>
                <p>
                  <strong className="text-black">Nota:</strong> Los artículos en oferta solo pueden ser cambiados, no reembolsados.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Cambios</h2>
              <p className="text-gray-600 text-sm">
                Si necesitas cambiar tu producto por otra talla o color, el primer cambio es gratuito.
                Cambios adicionales tienen un costo de envío de $99 MXN.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
