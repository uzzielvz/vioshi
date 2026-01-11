import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const archiveCollections = [
  { name: "DROP 001 - ORIGINS", season: "FW 2024", slug: "drop-001" },
  { name: "DROP 002 - STREETS", season: "SS 2025", slug: "drop-002" },
];

export default function ArchivePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 tracking-wide uppercase">
            Archivo
          </h1>

          <p className="text-gray-600 mb-12 max-w-2xl">
            Explora las colecciones pasadas de VIOGI. Cada drop representa un capítulo
            en nuestra historia de streetwear premium accesible.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {archiveCollections.map((collection) => (
              <Link
                key={collection.slug}
                href={`/archive/${collection.slug}`}
                className="group block bg-white border border-gray-200 hover:border-black transition-colors"
              >
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400 text-sm uppercase tracking-wide">
                      Coming Soon
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    {collection.season}
                  </p>
                  <h2 className="text-lg font-medium uppercase tracking-wide group-hover:opacity-60 transition-opacity">
                    {collection.name}
                  </h2>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Próximamente más contenido del archivo. Sigue nuestro{" "}
              <a
                href="https://www.instagram.com/viogi_/?hl=es"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-60"
              >
                Instagram
              </a>
              {" "}para actualizaciones.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
