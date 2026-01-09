import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LocacionesPage() {
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
            Locaciones
          </h1>

          <div 
            className="space-y-12"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif"
            }}
          >
            <section>
              <h2 
                className="text-2xl font-bold mb-6 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                Nuestras tiendas
              </h2>
              <p className="text-base leading-relaxed mb-8">
                Visita nuestras tiendas físicas para vivir la experiencia completa VIOGI. 
                Descubre nuestras colecciones y recibe asesoramiento personalizado de nuestro equipo.
              </p>
            </section>

            {/* Tienda 1 */}
            <section className="border-t pt-6">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                VIOGI Polanco
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-base leading-relaxed mb-2">
                    <strong>Dirección:</strong><br />
                    Av. Presidente Masaryk 300<br />
                    Polanco, Miguel Hidalgo<br />
                    Ciudad de México, 11560
                  </p>
                  <p className="text-base leading-relaxed mb-2">
                    <strong>Horario:</strong><br />
                    Lunes a Sábado: 11:00 AM - 8:00 PM<br />
                    Domingo: 12:00 PM - 6:00 PM
                  </p>
                  <p className="text-base leading-relaxed">
                    <strong>Teléfono:</strong> <a href="tel:+525555555551" className="underline">+52 55 5555 5551</a>
                  </p>
                </div>
                <div className="bg-gray-200 h-64 flex items-center justify-center text-gray-500">
                  Mapa
                </div>
              </div>
            </section>

            {/* Tienda 2 */}
            <section className="border-t pt-6">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                VIOGI Roma Norte
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-base leading-relaxed mb-2">
                    <strong>Dirección:</strong><br />
                    Av. Álvaro Obregón 150<br />
                    Roma Norte, Cuauhtémoc<br />
                    Ciudad de México, 06700
                  </p>
                  <p className="text-base leading-relaxed mb-2">
                    <strong>Horario:</strong><br />
                    Lunes a Sábado: 11:00 AM - 8:00 PM<br />
                    Domingo: 12:00 PM - 6:00 PM
                  </p>
                  <p className="text-base leading-relaxed">
                    <strong>Teléfono:</strong> <a href="tel:+525555555552" className="underline">+52 55 5555 5552</a>
                  </p>
                </div>
                <div className="bg-gray-200 h-64 flex items-center justify-center text-gray-500">
                  Mapa
                </div>
              </div>
            </section>

            {/* Tienda 3 */}
            <section className="border-t pt-6">
              <h3 
                className="text-xl font-bold mb-4 uppercase"
                style={{
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                VIOGI Guadalajara
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-base leading-relaxed mb-2">
                    <strong>Dirección:</strong><br />
                    Av. Chapultepec Norte 123<br />
                    Americana, Guadalajara<br />
                    Jalisco, 44160
                  </p>
                  <p className="text-base leading-relaxed mb-2">
                    <strong>Horario:</strong><br />
                    Lunes a Sábado: 11:00 AM - 8:00 PM<br />
                    Domingo: 12:00 PM - 6:00 PM
                  </p>
                  <p className="text-base leading-relaxed">
                    <strong>Teléfono:</strong> <a href="tel:+523333333333" className="underline">+52 33 3333 3333</a>
                  </p>
                </div>
                <div className="bg-gray-200 h-64 flex items-center justify-center text-gray-500">
                  Mapa
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

