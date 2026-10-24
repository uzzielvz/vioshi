import Link from 'next/link';
import Wordmark from '@/components/ui/Wordmark';
import { CloseIcon } from '@/components/ui/icons';
import { signInWithGoogleAction } from '../actions';

// Login, sign-up and password screens run without the store header, like the
// prototype's «Entrar» screen. The wordmark and the close button lead home.
export default function AuthScreen({
  locale,
  title,
  subtitle,
  closeLabel,
  children,
}: {
  locale: string;
  title: string;
  subtitle?: React.ReactNode;
  closeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto grid w-full max-w-[400px] gap-3.5 px-[22px] pb-12 pt-6 md:pt-16">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="text-ink">
            <Wordmark className="text-[34px]" />
          </Link>
          <Link
            href={`/${locale}`}
            aria-label={closeLabel}
            className="-mr-2 grid h-10 w-10 place-items-center text-ink"
          >
            <CloseIcon className="h-[22px] w-[22px]" />
          </Link>
        </div>
        <h1 className="mt-[18px] text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-ink [text-wrap:balance]">
          {title}
        </h1>
        {subtitle && <p className="mb-1.5 text-[14px] leading-[1.45] text-muted">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export function FormAlert({ tone = 'error', children }: { tone?: 'error' | 'ok'; children: React.ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={
        tone === 'error'
          ? 'rounded-btn border border-ink px-3 py-2.5 text-[13px] text-ink'
          : 'bg-carton p-3 text-[13px] text-ink'
      }
    >
      {children}
    </p>
  );
}

export function OrDivider({ label }: { label: string }) {
  return <p className="my-1 text-center text-[12px] text-muted">{label}</p>;
}

export function GoogleButton({ locale, label, className }: { locale: string; label: string; className: string }) {
  return (
    <form action={signInWithGoogleAction}>
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className={className}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px]">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {label}
      </button>
    </form>
  );
}
