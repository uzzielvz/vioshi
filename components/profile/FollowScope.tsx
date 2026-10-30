'use client';

import { createContext, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { FollowToggle } from '@/components/FollowButton';
import { InstagramIcon } from '@/components/ui/icons';
import { useFollow } from '@/hooks/useFollow';
import type { FollowKind } from '@/lib/social/actions';
import { boldStat, ProfileStat } from './ProfileStat';

type FollowValue = ReturnType<typeof useFollow>;

const FollowContext = createContext<FollowValue | null>(null);

function useScopedFollow(): FollowValue {
  const value = useContext(FollowContext);
  if (!value) throw new Error('FollowScope missing');
  return value;
}

// The follower count and «Seguir» sit in different rows of a profile; one
// scope reads the follow state once for both.
export function FollowScope({ kind, id, children }: { kind: FollowKind; id: string; children: React.ReactNode }) {
  const follow = useFollow(kind, id);
  return <FollowContext.Provider value={follow}>{children}</FollowContext.Provider>;
}

/** «N seguidores»; nothing without the social tables. */
export function FollowerStat() {
  const t = useTranslations('ui.social');
  const { available, count } = useScopedFollow();
  if (!available || count === null) return null;
  return <ProfileStat>{t.rich('followers', { count, b: boldStat })}</ProfileStat>;
}

/** «Seguir» next to the Instagram button, as in the prototype. */
export function FollowActions({ name, instagramHref }: { name: string; instagramHref: string | null }) {
  const t = useTranslations('ui.store');
  const { available, following, pending, toggle } = useScopedFollow();
  if (!available && !instagramHref) return null;

  return (
    <div className="grid grid-cols-[1fr_40px] gap-2">
      {available ? (
        <FollowToggle following={following} pending={pending} onToggle={toggle} name={name} variant="block" />
      ) : (
        <span />
      )}
      {instagramHref && (
        <a
          href={instagramHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('instagram')}
          className="grid h-10 w-10 place-items-center rounded-btn border border-ink text-ink"
        >
          <InstagramIcon className="h-[18px] w-[18px]" />
        </a>
      )}
    </div>
  );
}
