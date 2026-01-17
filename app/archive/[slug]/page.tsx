import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import { getProducts } from '@/lib/products';

interface ArchivePageProps {
  params: {
    slug: string;
  };
}

// Mock archive collections data
const archiveCollections: Record<
  string,
  { title: string; description: string; season: string; year: string }
> = {
  'drop-001': {
    title: 'WINTER ESSENTIALS',
    description:
      'Nuestra primera colección de piezas esenciales para el invierno. Diseños minimalistas con máxima funcionalidad.',
    season: 'Invierno',
    year: '2025',
  },
  'drop-002': {
    title: 'SPRING BREAK',
    description:
      'Colección primavera que combina comodidad y estilo urbano. Colores frescos y cortes contemporáneos.',
    season: 'Primavera',
    year: '2025',
  },
  'drop-003': {
    title: 'SUMMER NIGHTS',
    description:
      'Piezas ligeras y versátiles para las noches de verano. Diseños que transitan del día a la noche.',
    season: 'Verano',
    year: '2025',
  },
};

export default function ArchiveDetailPage({ params }: ArchivePageProps) {
  const collection = archiveCollections[params.slug];
  const products = getProducts();

  if (!collection) {
    return (
      <main className="min-h-screen bg-white pt-16">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-4">
            Colección No Encontrada
          </h1>
          <p className="text-gray-600 mb-8">
            La colección que buscas no existe o ha sido archivada.
          </p>
          <Link
            href="/archive"
            className="inline-block bg-black text-white px-8 py-4 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors"
          >
            Volver al Archivo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/archive"
            className="text-sm uppercase tracking-wider text-gray-600 hover:text-black transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al Archivo
          </Link>
        </div>

        {/* Collection Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-gray-100 text-gray-800 rounded-full text-xs uppercase tracking-wider font-medium">
              {collection.season} {collection.year}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-4">
            {collection.title}
          </h1>
          <p className="text-lg text-gray-600">{collection.description}</p>
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm uppercase tracking-wider text-gray-600">
              {products.length} Productos
            </p>
            <select className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-sm uppercase tracking-wider appearance-none bg-white pr-10">
              <option>Ordenar por</option>
              <option>Más reciente</option>
              <option>Precio: Menor a Mayor</option>
              <option>Precio: Mayor a Menor</option>
            </select>
          </div>

          <ProductGrid products={products.slice(0, 8)} />
        </div>

        {/* Archive Note */}
        <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            Esta es una colección de archivo. Los productos mostrados pueden no
            estar disponibles o tener stock limitado.
          </p>
        </div>
      </div>
    </main>
  );
}
