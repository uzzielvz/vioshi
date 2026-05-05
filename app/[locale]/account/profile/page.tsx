import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
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

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href={`/${locale}/account`}
            className="text-sm uppercase tracking-wider text-gray-600 hover:text-black transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Mi Cuenta
          </Link>
          <h1 className="text-3xl font-bold uppercase tracking-wider mt-4">
            Mi Perfil
          </h1>
        </div>

        <ProfileForm
          email={user.email ?? ''}
          initialName={profile?.name ?? ''}
          initialPhone={profile?.phone ?? ''}
        />

        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 mt-6">
          <h2 className="text-sm uppercase tracking-wider font-medium mb-4">
            Contraseña
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Para cambiar tu contraseña te enviaremos un enlace de recuperación a tu correo.
          </p>
          <Link
            href={`/${locale}/account/forgot-password`}
            className="inline-block border-2 border-black text-black px-6 py-3 rounded uppercase tracking-wider font-medium hover:bg-black hover:text-white transition-colors text-sm"
          >
            Cambiar contraseña
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Link
            href={`/${locale}/account/orders`}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors"
          >
            <h3 className="text-sm uppercase tracking-wider font-medium mb-2">
              Mis Pedidos
            </h3>
            <p className="text-sm text-gray-600">
              Ver historial de compras y tracking
            </p>
          </Link>
          <Link
            href={`/${locale}/account/addresses`}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-colors"
          >
            <h3 className="text-sm uppercase tracking-wider font-medium mb-2">
              Mis Direcciones
            </h3>
            <p className="text-sm text-gray-600">
              Gestiona tus direcciones de envío
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
