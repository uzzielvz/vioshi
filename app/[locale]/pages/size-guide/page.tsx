import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTranslations } from 'next-intl/server';

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default async function SizeGuidePage() {
  const t = await getTranslations('sizes');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">

          <h1
            className="uppercase tracking-wide mb-12"
            style={{ ...fontStyle, fontSize: '13px', fontWeight: 500 }}
          >
            {t('title')}
          </h1>

          {/* How to Measure */}
          <div className="mb-12">
            <h2
              className="uppercase tracking-wide mb-6 border-b border-gray-200 pb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('how_to_title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: t('chest_title'), desc: t('chest_desc') },
                { title: t('waist_title'), desc: t('waist_desc') },
                { title: t('hip_title'), desc: t('hip_desc') },
              ].map(({ title, desc }) => (
                <div key={title}>
                  <p
                    className="uppercase tracking-wide mb-2"
                    style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                  >
                    {title}
                  </p>
                  <p style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.6' }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tees & Hoodies */}
          <div className="mb-12">
            <h2
              className="uppercase tracking-wide mb-6 border-b border-gray-200 pb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('tees_hoodies_title')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    {[t('col_size'), t('col_chest'), t('col_length'), t('col_shoulder')].map((col) => (
                      <th
                        key={col}
                        className="text-left py-3 pr-8"
                        style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['S', '96–100', '68', '44'],
                    ['M', '100–104', '70', '46'],
                    ['L', '104–108', '72', '48'],
                    ['XL', '108–112', '74', '50'],
                  ].map(([size, chest, length, shoulder]) => (
                    <tr key={size} className="border-b border-gray-100">
                      {[size, chest, length, shoulder].map((val, i) => (
                        <td
                          key={i}
                          className="py-3 pr-8"
                          style={{ ...fontStyle, fontSize: '11px', color: '#666' }}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pants & Jeans */}
          <div className="mb-12">
            <h2
              className="uppercase tracking-wide mb-6 border-b border-gray-200 pb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('pants_jeans_title')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    {[t('col_size'), t('col_waist'), t('col_hip'), t('col_length')].map((col) => (
                      <th
                        key={col}
                        className="text-left py-3 pr-8"
                        style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['28', '71–74', '90–93', '100'],
                    ['30', '76–79', '96–99', '102'],
                    ['32', '81–84', '102–105', '104'],
                    ['34', '86–89', '108–111', '106'],
                    ['36', '91–94', '114–117', '108'],
                  ].map(([size, waist, hip, length]) => (
                    <tr key={size} className="border-b border-gray-100">
                      {[size, waist, hip, length].map((val, i) => (
                        <td
                          key={i}
                          className="py-3 pr-8"
                          style={{ ...fontStyle, fontSize: '11px', color: '#666' }}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h2
              className="uppercase tracking-wide mb-6 border-b border-gray-200 pb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('notes_title')}
            </h2>
            <ul className="space-y-2">
              {([1, 2, 3, 4] as const).map((i) => (
                <li
                  key={i}
                  style={{ ...fontStyle, fontSize: '11px', color: '#666' }}
                >
                  {t(`note_${i}` as `note_${typeof i}`)}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
