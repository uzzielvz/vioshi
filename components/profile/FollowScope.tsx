'use client';

import { createContext, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { FollowToggle } from '@/components/FollowButton';
import { useFollow } from '@/hooks/useFollow';
import type { FollowKind } from '@/lib/social/actions';
import { ProfileStat } from './ProfileStat';

type FollowValue = ReturnType<typeof useFollow>;

const FollowContext = createContext<FollowValue | null>(null);

function useScopedFollow(): FollowValue {
  const value = useContext(FollowContext);
  if (!value) throw new Error('FollowScope missing');
  return value;
}

// The follower count and «Seguir» sit in different slots of a profile; one
// scope reads the follow state once for both.
export function FollowScope({ kind, id, children }: { kind: FollowKind; id: string; children: React.ReactNode }) {
  const follow = useFollow(kind, id);
  return <FollowContext.Provider value={follow}>{children}</FollowContext.Provider>;
}

/** «Seguidores N»; nothing without the social tables. */
export function FollowerStat() {
  const t = useTranslations('ui.social');
  const { available, count } = useScopedFollow();
  if (!available || count === null) return null;
  return <ProfileStat label={t('followers_label')} value={count} />;
}

/** «Seguir» next to the numbers. Holds its place while the state loads. */
export function FollowAction({ name }: { name: string }) {
  const { ready, available, following, pending, toggle } = useScopedFollow();
  if (ready && !available) return null;

  return (
    <div className="w-[128px]">
      {ready ? (
        <FollowToggle following={following} pending={pending} onToggle={toggle} name={name} variant="block" />
      ) : (
        <span className="block h-10" />
      )}
    </div>
  );
}
