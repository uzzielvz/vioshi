import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import AccountShell from '../_components/AccountShell';
import { getAccountDisplayName } from '../_components/accountDisplayName';
import AddressesClient, { type AddressRow } from './_components/AddressesClient';

interface Props {
  params: { locale: string };
}

export default async function AddressesPage({ params }: Props) {
  const locale = params.locale as Locale;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/account`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  const { data } = await supabase
    .from('addresses')
    .select(
      'id, first_name, last_name, phone, street, apartment, colony, city, state, zip_code, country, is_default'
    )
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  const addresses = (data ?? []) as AddressRow[];
  const displayName = getAccountDisplayName(user, profile?.name ?? null);

  return (
    <AccountShell
      locale={locale}
      displayName={displayName}
      email={user.email ?? ''}
    >
      <div>
        <header className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-[11px] font-semibold uppercase tracking-widest text-black">
            Mis Direcciones
          </h1>
        </header>

        <AddressesClient initial={addresses} />
      </div>
    </AccountShell>
  );
}
