import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LocacionesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 tracking-wide uppercase">
            Locaciones
          </h1>

          <div className="space-y-12">
            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Tienda Flagship</h2>
              <div className="bg-white p-6 border border-gray-200">
                <h3 className="font-medium mb-2">VIOGI CDMX</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Av. Presidente Masaryk 123<br />
                  Col. Polanco, Miguel Hidalgo<br />
                  11560 Ciudad de México, CDMX
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Horario:</strong><br />
                  Lunes a Sábado: 11:00 - 20:00<br />
                  Domingo: 12:00 - 18:00
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Puntos de Venta</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white p-6 border border-gray-200">
                  <h3 className="font-medium mb-2">Monterrey</h3>
                  <p className="text-gray-600 text-sm">
                    Calzada del Valle 400<br />
                    Col. Del Valle, San Pedro Garza García<br />
                    66220 Nuevo León
                  </p>
                </div>
                <div className="bg-white p-6 border border-gray-200">
                  <h3 className="font-medium mb-2">Guadalajara</h3>
                  <p className="text-gray-600 text-sm">
                    Av. México 2500<br />
                    Col. Ladrón de Guevara<br />
                    44600 Jalisco
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">Stockists</h2>
              <p className="text-gray-600 mb-4">
                También puedes encontrar productos VIOGI en tiendas seleccionadas:
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Tier Zero - CDMX</li>
                <li>• Lust - Monterrey</li>
                <li>• Common People - Guadalajara</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
