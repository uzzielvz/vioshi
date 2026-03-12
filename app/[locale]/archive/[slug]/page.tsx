import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import { getProducts } from '@/lib/products';
import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';

interface ArchivePageProps {
  params: {
    locale: string;
    slug: string;
  };
}

const archiveCollections: Record<
  string,
  { title: string; description: string; season: string; year: string }
> = {
  'drop-001': {
    title: 'WINTER ESSENTIALS',
    description: 'Nuestra primera colección de piezas esenciales para el invierno. Diseños minimalistas con máxima funcionalidad.',
    season: 'Invierno',
    year: '2025',
  },
  'drop-002': {
    title: 'SPRING BREAK',
    description: 'Colección primavera que combina comodidad y estilo urbano. Colores frescos y cortes contemporáneos.',
    season: 'Primavera',
    year: '2025',
  },
  'drop-003': {
    title: 'SUMMER NIGHTS',
    description: 'Piezas ligeras y versátiles para las noches de verano. Diseños que transitan del día a la noche.',
    season: 'Verano',
    year: '2025',
  },
};

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default async function ArchiveDetailPage({ params }: ArchivePageProps) {
  const t = await getTranslations('archive');
  const locale = await getLocale();
  const collection = archiveCollections[params.slug];
  const products = await getProducts();

  if (!collection) {
    return (
      <main className="min-h-screen bg-white pt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
          <h1 className="uppercase tracking-wide mb-4" style={{ ...fontStyle, fontSize: '13px', fontWeight: 500 }}>
            {t('not_found_title')}
          </h1>
          <p className="text-gray-500 mb-8" style={{ ...fontStyle, fontSize: '11px' }}>
            {t('not_found_desc')}
          </p>
          <Link
            href={`/${locale}/archive`}
            className="bg-black text-white px-8 py-3 uppercase tracking-wide hover:bg-gray-800 transition-colors"
            style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
          >
            {t('back')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/${locale}/archive`}
            className="uppercase tracking-wide text-gray-500 hover:text-black transition-colors"
            style={{ ...fontStyle, fontSize: '11px' }}
          >
            ← {t('back')}
          </Link>
        </div>

        <div className="mb-12">
          <p className="uppercase tracking-wide text-gray-500 mb-2" style={{ ...fontStyle, fontSize: '11px' }}>
            {collection.season} {collection.year}
          </p>
          <h1 className="uppercase tracking-wide" style={{ ...fontStyle, fontSize: '13px', fontWeight: 500 }}>
            {collection.title}
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl" style={{ ...fontStyle, fontSize: '11px' }}>
            {collection.description}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6 border-t border-gray-200 pt-4">
            <p className="uppercase tracking-wide text-gray-500" style={{ ...fontStyle, fontSize: '11px' }}>
              {t('products_count', { count: products.length })}
            </p>
            <select
              className="border-b border-black bg-transparent focus:outline-none uppercase tracking-wide appearance-none"
              style={{ ...fontStyle, fontSize: '11px' }}
            >
              <option>{t('sort_by')}</option>
              <option>{t('sort_newest')}</option>
              <option>{t('sort_price_asc')}</option>
              <option>{t('sort_price_desc')}</option>
            </select>
          </div>

          <ProductGrid products={products.slice(0, 8)} />
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6">
          <p className="text-gray-500" style={{ ...fontStyle, fontSize: '11px' }}>
            {t('archive_note')}
          </p>
        </div>
      </div>
    </main>
  );
}
