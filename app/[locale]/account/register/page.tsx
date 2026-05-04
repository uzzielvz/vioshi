import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import RegisterForm from './_components/RegisterForm';

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya hay sesión, no tiene sentido mostrar el form de registro
  if (user) {
    redirect(`/${locale}`);
  }

  return <RegisterForm locale={locale} />;
}
