import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import AccountSubpage from '../_components/AccountSubpage';
import AddressesClient, { type AddressRow } from './_components/AddressesClient';

interface Props {
  params: { locale: string };
}

// Saved addresses live under settings («Editar perfil»), not as a profile tab.
export default async function AddressesPage({ params }: Props) {
  const locale = params.locale as Locale;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/account`);

  const [{ data }, t] = await Promise.all([
    supabase
      .from('addresses')
      .select(
        'id, first_name, last_name, phone, street, apartment, colony, city, state, zip_code, country, is_default'
      )
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true }),
    getTranslations('ui.profile'),
  ]);

  const addresses = (data ?? []) as AddressRow[];

  return (
    <AccountSubpage backHref={`/${locale}/account/profile`} backLabel={t('edit_title')} title={t('addresses')}>
      <AddressesClient initial={addresses} />
    </AccountSubpage>
  );
}
