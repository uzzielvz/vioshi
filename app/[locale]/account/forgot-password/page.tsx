import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import ForgotPasswordForm from './_components/ForgotPasswordForm';

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya hay sesión, no tiene sentido pedir recuperación
  if (user) {
    redirect(`/${locale}/account`);
  }

  return <ForgotPasswordForm locale={locale} />;
}
