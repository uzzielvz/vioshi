import Link from 'next/link';
import { ChevronIcon } from '@/components/ui/icons';
import { screenTitleClass } from '@/components/ui/styles';

// Pages one level below the profile (edit profile, an order): a back link
// and, when the content has no heading of its own, a screen title.
export default function AccountSubpage({
  backHref,
  backLabel,
  title,
  children,
}: {
  backHref: string;
  backLabel: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-12 pt-4 md:pt-8">
      <Link href={backHref} className="inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-ink">
        <ChevronIcon className="h-4 w-4 rotate-180" />
        {backLabel}
      </Link>
      {title && <h1 className={`mt-3 ${screenTitleClass}`}>{title}</h1>}
      <div className="mt-4">{children}</div>
    </div>
  );
}
