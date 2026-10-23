import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getProducts } from '@/lib/products';
import { createClient } from '@/lib/supabase/server';
import SavedPieces from '@/components/SavedPieces';
import { screenTitleClass } from '@/components/ui/styles';

export default async function WishlistPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // With an account, saved pieces are the first tab of the profile.
  if (user) redirect(`/${locale}/account`);

  const [products, t] = await Promise.all([getProducts(), getTranslations('ui.saved')]);

  return (
    <div className="mx-auto w-full max-w-[1280px] pb-10 pt-5 md:px-8 md:pt-8">
      <h1 className={`px-4 pb-3 md:px-0 ${screenTitleClass}`}>{t('title')}</h1>
      <SavedPieces products={products} />
    </div>
  );
}
