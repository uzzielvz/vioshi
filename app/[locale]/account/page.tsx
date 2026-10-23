import { createClient } from '@/lib/supabase/server';
import { getProducts } from '@/lib/products';
import type { Locale } from '@/i18n';
import LoginForm, { type LoginNotice } from './_components/LoginForm';
import AccountDashboard from './_components/AccountDashboard';

const NOTICES: LoginNotice[] = ['oauth', 'reset_expired'];

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: { error?: string };
}) {
  const { locale } = await params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const notice = NOTICES.find((n) => n === searchParams.error);
    return <LoginForm locale={locale} notice={notice} />;
  }

  const [{ data: profile }, products] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
    getProducts(),
  ]);

  return (
    <AccountDashboard
      user={user}
      profileName={profile?.name ?? null}
      locale={locale}
      products={products}
    />
  );
}
