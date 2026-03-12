import SupportNav from '@/components/SupportNav';
import { getTranslations } from 'next-intl/server';

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default async function LocacionesPage() {
  const t = await getTranslations('locaciones');

  return (
    <div className="min-h-screen bg-white">
      <div className="md:hidden">
        <SupportNav />
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

          {/* Left: Flagship Store */}
          <div>
            <h2
              className="uppercase tracking-wide mb-8 border-b border-gray-200 pb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('flagship_title')}
            </h2>

            <div className="space-y-5">
              <p
                className="uppercase tracking-wide"
                style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
              >
                {t('flagship_name')}
              </p>
              <p
                style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7', whiteSpace: 'pre-line' }}
              >
                {t('flagship_address')}
              </p>
              <div>
                <p
                  className="uppercase tracking-wide mb-1"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('flagship_hours_label')}
                </p>
                <p
                  style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7', whiteSpace: 'pre-line' }}
                >
                  {t('flagship_hours')}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Sales Points */}
          <div>
            <h2
              className="uppercase tracking-wide mb-8 border-b border-gray-200 pb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('sales_points_title')}
            </h2>

            <div className="space-y-8">
              <div>
                <p
                  className="uppercase tracking-wide mb-2"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('monterrey_name')}
                </p>
                <p
                  style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7', whiteSpace: 'pre-line' }}
                >
                  {t('monterrey_address')}
                </p>
              </div>

              <div>
                <p
                  className="uppercase tracking-wide mb-2"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('guadalajara_name')}
                </p>
                <p
                  style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.7', whiteSpace: 'pre-line' }}
                >
                  {t('guadalajara_address')}
                </p>
              </div>

              <div>
                <p
                  className="uppercase tracking-wide mb-3"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('stockists_title')}
                </p>
                <p className="mb-2" style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                  {t('stockists_note')}
                </p>
                <ul className="space-y-1">
                  <li style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>Tier Zero — CDMX</li>
                  <li style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>Lust — Monterrey</li>
                  <li style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>Common People — Guadalajara</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
