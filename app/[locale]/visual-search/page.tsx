import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { VisualSearchUploader } from '@/components/visual-search/VisualSearchUploader';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'visualSearch' });
  return { title: t('title') };
}

export default async function VisualSearchPage() {
  const t = await getTranslations('visualSearch');

  return (
    <div className="min-h-screen px-4 md:px-8 py-12 md:py-20">
      <div className="max-w-xl mx-auto flex flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1
            className="uppercase tracking-wider"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            {t('title')}
          </h1>
          <p
            className="text-gray-500"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
            }}
          >
            {t('subtitle')}
          </p>
        </header>

        <VisualSearchUploader />
      </div>
    </div>
  );
}
