import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CustomerSupportPage() {
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
            Customer Support
          </h1>

          <div 
            className="space-y-8"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif"
            }}
          >
            <section>
              <h2 
                className="text-2xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                ¿Necesitas ayuda?
              </h2>
              <p className="text-base leading-relaxed mb-4">
                Estamos aquí para ayudarte. Nuestro equipo de soporte está disponible para responder 
                todas tus preguntas sobre productos, pedidos, envíos y más.
              </p>
            </section>

            <section id="chat">
              <h3 
                className="text-xl font-bold mb-3 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Chat en vivo
              </h3>
              <p className="text-base leading-relaxed mb-4">
                Chatea con nosotros en tiempo real de lunes a viernes de 9:00 AM a 6:00 PM (hora del centro de México).
              </p>
              <button
                className="px-8 py-3 bg-black text-white uppercase transition-opacity hover:opacity-80"
                style={{
                  fontWeight: 800,
                  fontSize: '11px',
                  letterSpacing: '0.02em'
                }}
              >
                Iniciar chat
              </button>
            </section>

            <section>
              <h3 
                className="text-xl font-bold mb-3 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Email
              </h3>
              <p className="text-base leading-relaxed mb-2">
                Envíanos un correo a: <a href="mailto:support@viogi.com" className="underline">support@viogi.com</a>
              </p>
              <p className="text-base leading-relaxed text-gray-600">
                Responderemos tu consulta en un plazo de 24-48 horas.
              </p>
            </section>

            <section>
              <h3 
                className="text-xl font-bold mb-3 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Teléfono
              </h3>
              <p className="text-base leading-relaxed">
                Llámanos al: <a href="tel:+525555555555" className="underline">+52 55 5555 5555</a>
              </p>
              <p className="text-base leading-relaxed text-gray-600">
                Horario: Lunes a viernes de 9:00 AM a 6:00 PM
              </p>
            </section>

            <section>
              <h3 
                className="text-xl font-bold mb-3 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Preguntas frecuentes
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">¿Cómo puedo rastrear mi pedido?</h4>
                  <p className="text-gray-700">
                    Una vez que tu pedido sea enviado, recibirás un correo electrónico con el número 
                    de seguimiento y un enlace para rastrear tu paquete.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">¿Cuál es la política de devoluciones?</h4>
                  <p className="text-gray-700">
                    Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del producto. 
                    Consulta nuestra página de <a href="/pages/shipping-payments-returns" className="underline">envíos, pagos y devoluciones</a> para más detalles.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-2">¿Ofrecen envío internacional?</h4>
                  <p className="text-gray-700">
                    Actualmente solo realizamos envíos dentro de México. Estamos trabajando para expandir 
                    nuestro servicio de envíos internacionales pronto.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

