import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { CartProvider } from "@/store/cartStore";
import { locales } from '@/i18n';
import { ClientLayout } from "@/components/ClientLayout";
import { createClient } from "@/lib/supabase/server";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <ClientLayout userEmail={user?.email ?? null}>
              {children}
            </ClientLayout>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
