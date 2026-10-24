import type { User } from '@supabase/supabase-js';
import type { Locale } from '@/i18n';
import type { ProductData } from '@/lib/products';
import SavedPieces from '@/components/SavedPieces';
import AccountShell from './AccountShell';

// Default tab of the profile: saved pieces, as in the prototype.
export default function AccountDashboard({
  user,
  profileName,
  locale,
  products,
}: {
  user: User;
  profileName: string | null;
  locale: Locale;
  products: ProductData[];
}) {
  return (
    <AccountShell locale={locale} user={user} profileName={profileName} active="saved">
      <SavedPieces products={products} />
    </AccountShell>
  );
}
