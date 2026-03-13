'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';

const mockDocuments = [
  {
    id: 'DOC001',
    orderId: 'ORDER001',
    date: '2026-01-10',
    type: 'invoice' as const,
  },
  {
    id: 'DOC002',
    orderId: 'ORDER002',
    date: '2026-01-05',
    type: 'receipt' as const,
  },
  {
    id: 'DOC003',
    orderId: 'ORDER003',
    date: '2025-12-28',
    type: 'invoice' as const,
  },
];

const fontStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default function ArchivosPage() {
  const t = useTranslations('account');
  const { locale } = useLocaleContext();

  return (
    <div className="min-h-screen bg-white" style={fontStyle}>
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <Link
            href={`/${locale}/account`}
            className="inline-flex items-center gap-2 hover:opacity-60 transition-opacity mb-4"
            style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('archivos_back')}
          </Link>
          <div>
            <h1 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000' }}>
              {t('archivos_title')}
            </h1>
            <p className="mt-1" style={{ fontSize: '11px', color: '#999' }}>
              {t('archivos_subtitle')}
            </p>
          </div>
        </div>

        {/* Documents */}
        {mockDocuments.length === 0 ? (
          <div className="py-16 text-center">
            <p style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('archivos_empty')}
            </p>
          </div>
        ) : (
          <div>
            {/* Column headers */}
            <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200">
              {[t('archivos_order'), t('archivos_date'), t('archivos_type'), ''].map((label, i) => (
                <p key={i} className="uppercase tracking-wide" style={{ fontSize: '10px', color: '#999', letterSpacing: '0.05em' }}>
                  {label}
                </p>
              ))}
            </div>

            {mockDocuments.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-4 gap-4 items-center border-b border-gray-100 py-4"
              >
                <Link
                  href={`/${locale}/account/orders/${doc.orderId}`}
                  className="hover:opacity-60 transition-opacity"
                  style={{ fontSize: '11px', color: '#000', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 500 }}
                >
                  #{doc.orderId}
                </Link>
                <p style={{ fontSize: '11px', color: '#666' }}>
                  {new Date(doc.date).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="uppercase tracking-wide" style={{ fontSize: '10px', color: '#666', letterSpacing: '0.03em' }}>
                  {doc.type === 'invoice' ? t('archivos_type_invoice') : t('archivos_type_receipt')}
                </p>
                <button
                  className="border border-gray-300 py-1.5 px-3 uppercase hover:border-black transition-colors text-left"
                  style={{ fontSize: '10px', letterSpacing: '0.05em', color: '#000' }}
                >
                  {t('archivos_download')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
