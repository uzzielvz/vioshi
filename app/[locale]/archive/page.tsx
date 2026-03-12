import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";

const archiveEntries = [
  {
    date: "15.01.2025",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=1600&fit=crop",
    description: "NUEVA COLECCIÓN INSPIRADA EN LAS CALLES DE LA CIUDAD. PIEZAS ESENCIALES QUE COMBINAN FUNCIONALIDAD CON ESTILO URBANO CONTEMPORÁNEO.",
    slug: "drop-001",
  },
  {
    date: "10.12.2024",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&h=1600&fit=crop",
    description: "DROP DE INVIERNO CON PRENDAS PREMIUM DISEÑADAS PARA EL CLIMA FRÍO. ABRIGOS, SUDADERAS Y ACCESORIOS QUE DEFINEN EL ESTILO VIOGI.",
    slug: "drop-002",
  },
  {
    date: "20.11.2024",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&h=1600&fit=crop",
    description: "LANZAMIENTO DE NUESTRA LÍNEA DE DENIM. JEANS Y CHAQUETAS CON CORTES MODERNOS Y ACABADOS ÚNICOS QUE REFLEJAN NUESTRA IDENTIDAD.",
    slug: "drop-003",
  },
];

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default async function ArchivePage() {
  const t = await getTranslations('archive');
  const locale = await getLocale();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <h1
            className="mb-12 uppercase tracking-wide"
            style={{ ...fontStyle, fontSize: '13px', fontWeight: 500 }}
          >
            {t('title')}
          </h1>

          <div className="space-y-16 md:space-y-24">
            {archiveEntries.map((entry, index) => (
              <Link
                key={entry.slug}
                href={`/${locale}/archive/${entry.slug}`}
                className="block group"
              >
                <p
                  className="uppercase tracking-wide text-gray-500 mb-4"
                  style={{ ...fontStyle, fontSize: '11px' }}
                >
                  {entry.date}
                </p>

                <div className="relative w-full aspect-[3/4] mb-6 overflow-hidden bg-gray-100">
                  <Image
                    src={entry.image}
                    alt={`Archive entry ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>

                <p
                  className="uppercase tracking-wide leading-relaxed text-gray-700 max-w-2xl"
                  style={{ ...fontStyle, fontSize: '11px', lineHeight: '1.6' }}
                >
                  {entry.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-20 pt-8 border-t border-gray-200">
            <p
              className="text-gray-500 uppercase tracking-wide"
              style={{ ...fontStyle, fontSize: '11px' }}
            >
              {t('coming_soon')}{' '}
              <a
                href="https://www.instagram.com/viogi_/?hl=es"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-60 transition-opacity"
              >
                INSTAGRAM
              </a>
              {' '}{t('coming_soon_end')}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
