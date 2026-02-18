import Header from "@/components/Header";
import Footer from "@/components/Footer";

const chapters = [
  {
    number: "01",
    title: "Origins",
    description: "El inicio de VIOGI. Una visión de streetwear premium accesible nacida en México.",
    date: "2024",
  },
  {
    number: "02",
    title: "Streets",
    description: "Inspiración urbana. La cultura de la calle como lienzo de expresión.",
    date: "2025",
  },
  {
    number: "03",
    title: "Coming Soon",
    description: "El siguiente capítulo está en desarrollo.",
    date: "2025",
  },
];

export default function ChaptersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <h1 className="text-2xl md:text-3xl font-normal mb-4 tracking-wide uppercase">
            Capítulos
          </h1>
          <p className="text-gray-600 mb-12 max-w-2xl">
            Cada colección de VIOGI cuenta una historia. Explora los capítulos que definen
            nuestra marca y su evolución en el mundo del streetwear.
          </p>

          <div className="space-y-0">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.number}
                className={`border-t border-gray-200 py-8 ${
                  index === chapters.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-start gap-8">
                  <span className="text-4xl md:text-5xl font-light text-gray-300">
                    {chapter.number}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-lg font-medium uppercase tracking-wide">
                        {chapter.title}
                      </h2>
                      <span className="text-xs text-gray-500">{chapter.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{chapter.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <h2 className="text-lg font-medium mb-4 uppercase tracking-wide">
              La Filosofía VIOGI
            </h2>
            <div className="grid gap-6 md:grid-cols-2 text-sm text-gray-600">
              <div className="bg-white p-6 border border-gray-200">
                <h3 className="font-medium text-black mb-2">Premium Accesible</h3>
                <p>
                  Creemos que la calidad no debe ser exclusiva. Cada pieza VIOGI está
                  diseñada con materiales premium a precios accesibles.
                </p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <h3 className="font-medium text-black mb-2">Hecho en México</h3>
                <p>
                  Producción local con estándares internacionales. Apoyamos el talento
                  y la manufactura mexicana.
                </p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <h3 className="font-medium text-black mb-2">Diseño Atemporal</h3>
                <p>
                  Piezas que trascienden temporadas. Construye un guardarropa que
                  perdure más allá de las tendencias.
                </p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <h3 className="font-medium text-black mb-2">Comunidad</h3>
                <p>
                  VIOGI es más que ropa. Es una comunidad de personas que valoran
                  la autenticidad y la expresión personal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
