import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import LoginForm from './_components/LoginForm';
import AccountDashboard from './_components/AccountDashboard';

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginForm locale={locale} />;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <AccountDashboard
      user={user}
      profileName={profile?.name ?? null}
      locale={locale}
    />
  );
}
