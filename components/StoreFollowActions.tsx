"use client";

import { useTranslations } from "next-intl";
import { useFollow } from "@/hooks/useFollow";
import { FollowToggle } from "@/components/FollowButton";
import { InstagramIcon } from "@/components/ui/icons";

// Store header from the prototype: «N seguidores · N piezas», then «Seguir»
// next to the Instagram button. Without the social tables only the pieces
// count and Instagram show.
export default function StoreFollowActions({
  storeId,
  storeName,
  pieces,
  instagramHref,
  children,
}: {
  storeId: string;
  storeName: string;
  pieces: number;
  instagramHref: string | null;
  /** The bio, between the counts and the buttons as in the prototype. */
  children?: React.ReactNode;
}) {
  const t = useTranslations("ui.social");
  const tStore = useTranslations("ui.store");
  const { available, following, count, pending, toggle } = useFollow("store", storeId);

  const bold = (chunks: React.ReactNode) => <b className="font-bold tabular-nums">{chunks}</b>;

  return (
    <div className="mt-1 grid gap-2.5">
      <p className="text-[13px] text-ink">
        {available && count !== null && (
          <>
            {t.rich("followers", { count, b: bold })}
            <span className="text-muted"> · </span>
          </>
        )}
        <span className={available && count !== null ? "" : "text-muted"}>{tStore("pieces", { count: pieces })}</span>
      </p>
      {children}
      {(available || instagramHref) && (
        <div className="grid grid-cols-[1fr_40px] gap-2 md:max-w-[360px]">
          {available ? (
            <FollowToggle following={following} pending={pending} onToggle={toggle} name={storeName} variant="block" />
          ) : (
            <span />
          )}
          {instagramHref && (
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tStore("instagram")}
              className="grid h-10 w-10 place-items-center rounded-btn border border-ink text-ink"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
