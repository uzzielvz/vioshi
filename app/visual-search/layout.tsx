import type { Metadata } from 'next';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { CartProvider } from '@/store/cartStore';
// Default to Spanish messages (primary lang per CLAUDE.md). Visual search route is outside
// i18n prefix intentionally (middleware exclusion). For the 4 new keys (VS-09) this suffices.
import messages from '@/messages/es.json';

export const metadata: Metadata = {
  title: 'VIOGI · Búsqueda Visual',
  description: 'Encuentra prendas similares subiendo una foto.',
};

export default function VisualSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <CartProvider>
          <NextIntlClientProvider locale="es" messages={messages}>
            {children}
          </NextIntlClientProvider>
        </CartProvider>
      </body>
    </html>
  );
}
