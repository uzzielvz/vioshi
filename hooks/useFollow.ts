"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import {
  getFollowStateAction,
  setFollowAction,
  type FollowKind,
  type FollowState,
} from "@/lib/social/actions";

// Follow state is read on the client so cached catalog pages stay cached.
// `initialFollowing` skips the read on lists that already know the answer.
export function useFollow(kind: FollowKind, id: string, initialFollowing?: boolean) {
  const router = useRouter();
  const { locale } = useLocaleContext();
  const [state, setState] = useState<FollowState | null>(
    initialFollowing === undefined
      ? null
      : { available: true, signedIn: true, following: initialFollowing, count: null }
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (initialFollowing !== undefined) return;
    let active = true;
    getFollowStateAction(kind, id)
      .then((next) => {
        if (active) setState(next);
      })
      .catch(() => {
        if (active) setState({ available: false, signedIn: false, following: false, count: null });
      });
    return () => {
      active = false;
    };
  }, [kind, id, initialFollowing]);

  const toggle = useCallback(() => {
    if (!state?.available) return;
    if (!state.signedIn) {
      router.push(`/${locale}/account`);
      return;
    }
    const follow = !state.following;
    const previous = state;
    setState({
      ...state,
      following: follow,
      count: state.count === null ? null : Math.max(0, state.count + (follow ? 1 : -1)),
    });
    startTransition(async () => {
      const result = await setFollowAction(kind, id, follow);
      if (!result.ok) {
        setState(previous);
        if (result.reason === "auth") router.push(`/${locale}/account`);
      }
    });
  }, [state, kind, id, locale, router]);

  return {
    ready: state !== null,
    available: state?.available ?? false,
    following: state?.following ?? false,
    count: state?.count ?? null,
    pending,
    toggle,
  };
}
