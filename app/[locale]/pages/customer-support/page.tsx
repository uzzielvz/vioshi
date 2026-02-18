import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function CustomerSupportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 tracking-wide uppercase">
            Customer Support
          </h1>

          <div className="space-y-12">
            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Contacto</h2>
              <p className="text-gray-600 mb-4">
                Estamos aquí para ayudarte. Puedes contactarnos a través de los siguientes medios:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>Email: support@viogi.com</li>
                <li>WhatsApp: +52 55 1234 5678</li>
                <li>Horario: Lunes a Viernes, 9:00 - 18:00 (CST)</li>
              </ul>
            </section>

            <section id="chat">
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Chat en Vivo</h2>
              <p className="text-gray-600 mb-4">
                Nuestro chat en vivo está disponible durante horario de oficina para responder tus preguntas al instante.
              </p>
              <button className="bg-black text-white px-6 py-3 text-sm uppercase tracking-wide hover:opacity-80 transition-opacity">
                Iniciar Chat
              </button>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Preguntas Frecuentes</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium mb-2">¿Cuánto tarda mi pedido en llegar?</h3>
                  <p className="text-gray-600 text-sm">Los envíos dentro de México tardan entre 3-7 días hábiles.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium mb-2">¿Puedo cambiar o devolver mi producto?</h3>
                  <p className="text-gray-600 text-sm">Sí, tienes 30 días para cambios y devoluciones. Consulta nuestra política completa.</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-medium mb-2">¿Cómo sé qué talla elegir?</h3>
                  <p className="text-gray-600 text-sm">
                    Consulta nuestra{" "}
                    <Link href="/pages/size-guide" className="underline hover:opacity-60">
                      guía de tallas
                    </Link>
                    {" "}para encontrar tu talla perfecta.
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
