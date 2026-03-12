import SupportNav from '@/components/SupportNav';
import { getTranslations } from 'next-intl/server';

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default async function ShippingPage() {
  const t = await getTranslations('shipping');

  return (
    <div className="min-h-screen bg-white">
      <div className="md:hidden">
        <SupportNav />
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

          {/* Left column: Shipping & Handling */}
          <div>
            <h2
              className="uppercase tracking-wide mb-8 border-b border-gray-200 pb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('shipping_title')}
            </h2>

            <div className="space-y-8">
              <div>
                <p
                  className="uppercase tracking-wide mb-3"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('processing_title')}
                </p>
                <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
                  {t('processing_body')}
                </p>
                <p className="mt-2" style={{ ...fontStyle, fontSize: '11px', color: '#999', lineHeight: '1.7' }}>
                  {t('processing_note')}
                </p>
              </div>

              <div>
                <p
                  className="uppercase tracking-wide mb-3"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('standard_title')}
                </p>
                <p style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>{t('standard_time')}</p>
                <p style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>{t('standard_free')}</p>
                <p style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>{t('standard_cost')}</p>
              </div>

              <div>
                <p
                  className="uppercase tracking-wide mb-3"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('express_title')}
                </p>
                <p style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>{t('express_time')}</p>
                <p style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>{t('express_cost')}</p>
              </div>

              <div>
                <p
                  className="uppercase tracking-wide mb-3"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('payment_title')}
                </p>
                <ul className="space-y-1">
                  {([1, 2, 3, 4, 5] as const).map((i) => (
                    <li key={i} style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                      {t(`payment_${i}` as `payment_${typeof i}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right column: Return Guidelines */}
          <div>
            <h2
              className="uppercase tracking-wide mb-8 border-b border-gray-200 pb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('returns_title')}
            </h2>

            <div className="space-y-8">
              <div>
                <p
                  className="uppercase tracking-wide mb-3"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('return_policy_title')}
                </p>
                <ul className="space-y-2">
                  {([1, 2, 3, 4, 5, 6, 7] as const).map((i) => (
                    <li key={i} style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.6' }}>
                      {t(`return_${i}` as `return_${typeof i}`)}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p
                  className="uppercase tracking-wide mb-3"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('return_process_title')}
                </p>
                <ol className="space-y-2">
                  {([1, 2, 3, 4] as const).map((i) => (
                    <li key={i} style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                      {i}. {t(`return_step_${i}` as `return_step_${typeof i}`)}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <p
                  className="uppercase tracking-wide mb-3"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('exchanges_title')}
                </p>
                <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
                  {t('exchanges_body')}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
