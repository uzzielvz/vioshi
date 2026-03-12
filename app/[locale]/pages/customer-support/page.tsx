'use client';

import { useState } from 'react';
import SupportNav from '@/components/SupportNav';
import { useTranslations } from 'next-intl';

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

const faqs = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export default function CustomerSupportPage() {
  const t = useTranslations('support');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <div className="md:hidden">
        <SupportNav />
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

          {/* Left column: Contact */}
          <div>
            <h2
              className="uppercase tracking-wide mb-8 border-b border-gray-200 pb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('contact_title')}
            </h2>

            <div className="space-y-8">
              <div>
                <p
                  className="uppercase tracking-wide mb-1"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('whatsapp_label')}
                </p>
                <a
                  href={`https://wa.me/${t('whatsapp_number').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-60 transition-opacity"
                  style={{ ...fontStyle, fontSize: '11px', color: '#666' }}
                >
                  {t('whatsapp_cta')}
                </a>
                <p style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                  {t('whatsapp_number')}
                </p>
              </div>

              <div>
                <p
                  className="uppercase tracking-wide mb-1"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('email_label')}
                </p>
                <a
                  href={`mailto:${t('email_value')}`}
                  className="hover:opacity-60 transition-opacity"
                  style={{ ...fontStyle, fontSize: '11px', color: '#666' }}
                >
                  {t('email_value')}
                </a>
              </div>

              <div>
                <p
                  className="uppercase tracking-wide mb-1"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('hours_label')}
                </p>
                <p style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                  {t('hours_value')}
                </p>
                <p style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                  {t('hours_note')}
                </p>
              </div>

              <div className="flex gap-6">
                <a
                  href="https://www.instagram.com/viogi_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uppercase tracking-wide hover:opacity-60 transition-opacity"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('instagram')}
                </a>
                <a
                  href="https://www.tiktok.com/@viogi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uppercase tracking-wide hover:opacity-60 transition-opacity"
                  style={{ ...fontStyle, fontSize: '11px', fontWeight: 500, color: '#000' }}
                >
                  {t('tiktok')}
                </a>
              </div>
            </div>
          </div>

          {/* Right column: FAQ */}
          <div>
            <h2
              className="uppercase tracking-wide mb-8 border-b border-gray-200 pb-4"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('faq_title')}
            </h2>

            <div>
              {faqs.map((i) => (
                <div key={i} className="border-b border-gray-200">
                  <button
                    className="w-full flex items-center justify-between py-4 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span
                      className="uppercase tracking-wide pr-4"
                      style={{ ...fontStyle, fontSize: '11px', fontWeight: openFaq === i ? 500 : 400, color: '#000' }}
                    >
                      {t(`faq_${i}_q` as `faq_${typeof i}_q`)}
                    </span>
                    <span
                      className="flex-shrink-0 transition-transform duration-200"
                      style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none', fontSize: '16px', lineHeight: 1 }}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <p
                      className="pb-4"
                      style={{ ...fontStyle, fontSize: '11px', color: '#666', lineHeight: '1.6' }}
                    >
                      {t(`faq_${i}_a` as `faq_${typeof i}_a`)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
