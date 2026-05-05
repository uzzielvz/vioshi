import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import ResetForm from './_components/ResetForm';

export default async function ResetPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sin sesión activa → el link del email expiró o el flujo se rompió.
  // Mandamos al login.
  if (!user) {
    redirect(`/${locale}/account?error=reset_expired`);
  }

  return <ResetForm locale={locale} email={user.email ?? ''} />;
}
