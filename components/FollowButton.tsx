"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useFollow } from "@/hooks/useFollow";
import type { FollowKind } from "@/lib/social/actions";
import { CheckIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/styles";

/**
 * «Seguir» from the prototype: a small blue button; once followed it turns
 * into muted text with a check. `block` is the full-width store version.
 */
export function FollowToggle({
  following,
  pending,
  onToggle,
  name,
  variant = "small",
  className,
}: {
  following: boolean;
  pending: boolean;
  onToggle: () => void;
  name: string;
  variant?: "small" | "block";
  className?: string;
}) {
  const t = useTranslations("ui.social");
  const label = following ? t("following") : t("follow");

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={following}
      aria-label={following ? t("unfollow_aria", { name }) : t("follow_aria", { name })}
      className={
        variant === "block"
          ? buttonClass(following ? "line" : "primary", "sm", clsx("w-full", className))
          : clsx(
              "inline-flex h-[30px] flex-none items-center gap-[5px] rounded-btn border text-[12px] font-semibold transition-colors disabled:opacity-60",
              following
                ? "border-transparent bg-transparent px-1 text-muted"
                : "border-accent bg-accent px-3 text-paper hover:bg-accent-press",
              className
            )
      }
    >
      {following && <CheckIcon className={variant === "block" ? "h-4 w-4" : "h-3 w-3"} />}
      {label}
    </button>
  );
}

// Renders nothing until the state loads, or at all while the social tables
// are unavailable (migration not applied).
export default function FollowButton({
  kind,
  id,
  name,
  variant,
  initialFollowing,
  className,
}: {
  kind: FollowKind;
  id: string;
  name: string;
  variant?: "small" | "block";
  initialFollowing?: boolean;
  className?: string;
}) {
  const { ready, available, following, pending, toggle } = useFollow(kind, id, initialFollowing);
  if (!ready || !available) return null;
  return (
    <FollowToggle
      following={following}
      pending={pending}
      onToggle={toggle}
      name={name}
      variant={variant}
      className={className}
    />
  );
}
