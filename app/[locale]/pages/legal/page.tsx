import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LegalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 tracking-wide uppercase">
            Legal
          </h1>

          <div className="space-y-12 text-sm text-gray-600">
            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide text-black">
                Términos y Condiciones
              </h2>
              <div className="space-y-4">
                <p>
                  Al acceder y utilizar el sitio web de VIOGI, aceptas cumplir con estos términos
                  y condiciones de uso. Si no estás de acuerdo con alguna parte de estos términos,
                  te pedimos que no utilices nuestro sitio.
                </p>
                <p>
                  VIOGI se reserva el derecho de modificar estos términos en cualquier momento.
                  Los cambios serán efectivos inmediatamente después de su publicación en el sitio.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide text-black">
                Política de Privacidad
              </h2>
              <div className="space-y-4">
                <p>
                  En VIOGI, respetamos tu privacidad y nos comprometemos a proteger tus datos personales.
                  Esta política describe cómo recopilamos, utilizamos y protegemos tu información.
                </p>
                <h3 className="font-medium text-black mt-4">Información que Recopilamos</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Información de contacto (nombre, email, teléfono, dirección)</li>
                  <li>Información de pago (procesada de forma segura por terceros)</li>
                  <li>Historial de compras</li>
                  <li>Preferencias de navegación</li>
                </ul>
                <h3 className="font-medium text-black mt-4">Uso de la Información</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Procesar y enviar tus pedidos</li>
                  <li>Comunicarnos contigo sobre tu cuenta o pedidos</li>
                  <li>Mejorar nuestros productos y servicios</li>
                  <li>Enviarte información promocional (solo si lo autorizas)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide text-black">
                Propiedad Intelectual
              </h2>
              <p>
                Todo el contenido de este sitio, incluyendo pero no limitado a textos, gráficos,
                logos, imágenes, clips de audio, descargas digitales y compilaciones de datos,
                es propiedad de VIOGI o sus proveedores de contenido y está protegido por las
                leyes de propiedad intelectual de México e internacionales.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide text-black">
                Cookies
              </h2>
              <p>
                Utilizamos cookies para mejorar tu experiencia de navegación. Al usar nuestro sitio,
                aceptas el uso de cookies de acuerdo con nuestra política. Puedes configurar tu
                navegador para rechazar cookies, pero esto puede afectar la funcionalidad del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide text-black">
                Contacto Legal
              </h2>
              <p>
                Para cualquier consulta legal, puedes contactarnos en:<br />
                <strong className="text-black">legal@viogi.com</strong>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
