import SupportNav from '@/components/SupportNav';
import { getTranslations } from 'next-intl/server';

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default async function AccessibilityPage() {
  const t = await getTranslations('accessibility');

  return (
    <div className="min-h-screen bg-white">
      <div className="md:hidden">
        <SupportNav />
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <h1
          className="uppercase tracking-wide mb-12"
          style={{ ...fontStyle, fontSize: '13px', fontWeight: 500 }}
        >
          {t('title')}
        </h1>

        <div className="max-w-2xl space-y-10">

          <div>
            <h2
              className="uppercase tracking-wide mb-4 border-b border-gray-200 pb-3"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('commitment_title')}
            </h2>
            <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
              {t('commitment_body')}
            </p>
          </div>

          <div>
            <h2
              className="uppercase tracking-wide mb-4 border-b border-gray-200 pb-3"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('standards_title')}
            </h2>
            <p className="mb-3" style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
              {t('standards_body')}
            </p>
            <ul className="space-y-1">
              {([1, 2, 3, 4, 5] as const).map((i) => (
                <li key={i} style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                  {t(`standards_${i}` as `standards_${typeof i}`)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2
              className="uppercase tracking-wide mb-4 border-b border-gray-200 pb-3"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('features_title')}
            </h2>
            <div className="space-y-5">
              {[
                { title: t('feature_keyboard_title'), body: t('feature_keyboard_body') },
                { title: t('feature_screen_reader_title'), body: t('feature_screen_reader_body') },
                { title: t('feature_zoom_title'), body: t('feature_zoom_body') },
              ].map(({ title, body }) => (
                <div key={title}>
                  <p
                    className="uppercase tracking-wide mb-1"
                    style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                  >
                    {title}
                  </p>
                  <p style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2
              className="uppercase tracking-wide mb-4 border-b border-gray-200 pb-3"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('feedback_title')}
            </h2>
            <p className="mb-3" style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
              {t('feedback_body')}
            </p>
            <a
              href={`mailto:${t('feedback_email')}`}
              className="hover:opacity-60 transition-opacity"
              style={{ ...fontStyle, fontSize: '11px', color: '#000', fontWeight: 500 }}
            >
              {t('feedback_email')}
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
