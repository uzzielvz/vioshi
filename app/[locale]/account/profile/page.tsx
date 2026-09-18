import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import AccountShell from '../_components/AccountShell';
import { getAccountDisplayName } from '../_components/accountDisplayName';
import ProfileForm from './_components/ProfileForm';

export default async function ProfilePage({
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
    redirect(`/${locale}/account`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, phone')
    .eq('id', user.id)
    .maybeSingle();

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
            Mi Perfil
          </h1>
        </header>

        <ProfileForm
          email={user.email ?? ''}
          initialName={profile?.name ?? ''}
          initialPhone={profile?.phone ?? ''}
        />

        <div className="mt-10 pt-8 border-t border-gray-200">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-black mb-3">
            Contraseña
          </h2>
          <p className="text-[11px] text-gray-400 mb-5 max-w-md">
            Para cambiar tu contraseña te enviaremos un enlace de recuperación a tu correo.
          </p>
          <Link
            href={`/${locale}/account/forgot-password`}
            className="inline-block border border-black text-black px-6 py-2.5 text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Cambiar contraseña
          </Link>
        </div>
      </div>
    </AccountShell>
  );
}
