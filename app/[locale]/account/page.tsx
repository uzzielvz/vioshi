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

  const products = await getProducts();

  return <AccountDashboard user={user} locale={locale} products={products} />;
}
