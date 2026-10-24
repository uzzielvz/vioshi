import Link from 'next/link';
import { inter } from '@/lib/fonts';
import Wordmark from '@/components/ui/Wordmark';
import { buttonClass } from '@/components/ui/styles';

// Only reached outside a locale; [locale]/not-found.tsx covers the store.
export default function NotFound() {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-paper text-ink antialiased">
        <main className="grid min-h-screen place-items-center px-4">
          <div className="grid max-w-[360px] justify-items-center gap-3 text-center">
            <Wordmark className="text-[34px]" />
            <h1 className="mt-4 text-[18px] font-bold">No encontramos esta página</h1>
            <p className="text-[13.5px] text-muted">We couldn&apos;t find this page.</p>
            <Link href="/" className={buttonClass('primary', 'md', 'mt-2 w-full')}>
              Ir al inicio
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
