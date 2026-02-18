import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 tracking-wide uppercase">
            Accesibilidad
          </h1>

          <div className="space-y-8 text-sm text-gray-600">
            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide text-black">
                Nuestro Compromiso
              </h2>
              <p>
                En VIOGI, estamos comprometidos a hacer que nuestro sitio web sea accesible para
                todas las personas, incluyendo aquellas con discapacidades. Trabajamos continuamente
                para mejorar la experiencia de usuario y aplicar los estándares de accesibilidad relevantes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide text-black">
                Estándares de Accesibilidad
              </h2>
              <p className="mb-4">
                Nuestro objetivo es cumplir con las Pautas de Accesibilidad para el Contenido Web
                (WCAG) 2.1 nivel AA. Estas pautas explican cómo hacer el contenido web más accesible
                para personas con diversas discapacidades.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Texto alternativo en imágenes</li>
                <li>Contraste de colores adecuado</li>
                <li>Navegación por teclado</li>
                <li>Estructura semántica del contenido</li>
                <li>Formularios accesibles con etiquetas claras</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide text-black">
                Funciones de Accesibilidad
              </h2>
              <div className="space-y-4">
                <div className="bg-white p-4 border border-gray-200">
                  <h3 className="font-medium text-black mb-2">Navegación por Teclado</h3>
                  <p>Puedes navegar por todo el sitio usando solo el teclado (Tab, Enter, Escape).</p>
                </div>
                <div className="bg-white p-4 border border-gray-200">
                  <h3 className="font-medium text-black mb-2">Lectores de Pantalla</h3>
                  <p>El sitio es compatible con lectores de pantalla como NVDA, JAWS y VoiceOver.</p>
                </div>
                <div className="bg-white p-4 border border-gray-200">
                  <h3 className="font-medium text-black mb-2">Zoom</h3>
                  <p>El sitio funciona correctamente con zoom de hasta 200%.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide text-black">
                Retroalimentación
              </h2>
              <p className="mb-4">
                Valoramos tu opinión sobre la accesibilidad de nuestro sitio. Si encuentras
                barreras de accesibilidad o tienes sugerencias para mejorar, por favor contáctanos:
              </p>
              <ul className="space-y-1">
                <li>Email: <strong className="text-black">accessibility@viogi.com</strong></li>
                <li>Teléfono: <strong className="text-black">+52 55 1234 5678</strong></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide text-black">
                Asistencia
              </h2>
              <p>
                Si necesitas ayuda para navegar nuestro sitio o completar una compra debido a
                una discapacidad, nuestro equipo de atención al cliente está disponible para
                asistirte por teléfono o chat.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
