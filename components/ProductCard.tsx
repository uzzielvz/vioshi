"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/formatters";
import {
  GARMENT_TYPE_LABELS,
  GARMENT_TYPE_LABELS_EN,
  type GarmentType,
} from "@/lib/garments";
import { HeartIcon } from "@/components/ui/icons";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  soldOut?: boolean;
  isNew?: boolean;
  size?: string;
  availability?: "disponible" | "apartada" | "vendida";
  brand?: { name: string };
  garmentType?: GarmentType;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  slug,
  soldOut,
  size,
  availability,
  brand,
  garmentType,
}: ProductCardProps) {
  const { locale } = useLocaleContext();
  const t = useTranslations("ui.card");
  const { has, toggle } = useWishlist();
  const saved = has(id);

  const estado = availability ?? (soldOut ? "vendida" : "disponible");
  const sold = estado === "vendida";
  const reserved = estado === "apartada";

  const typeLabel = garmentType
    ? (locale === "en" ? GARMENT_TYPE_LABELS_EN : GARMENT_TYPE_LABELS)[garmentType]
    : undefined;
  const title = brand?.name
    ? typeLabel
      ? `${brand.name} ${typeLabel}`
      : brand.name
    : name;

  return (
    <article className="min-w-0">
      <Link href={`/${locale}/products/${slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-carton">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className={clsx(
                "object-cover mix-blend-multiply",
                sold && "opacity-45 grayscale"
              )}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : null}

          {reserved && (
            <span className="absolute left-2 top-2 border border-ink bg-paper px-1.5 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-ink">
              {t("reserved")}
            </span>
          )}
          {sold && (
            <span className="absolute left-2 top-2 bg-ink px-1.5 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-paper">
              {t("sold")}
            </span>
          )}
        </div>
      </Link>

      <div className="mt-[9px] flex items-center justify-between gap-2 px-2.5 md:px-0">
        <p className="min-w-0 truncate text-[13px] leading-tight text-ink">
          {brand?.name ? (
            <>
              <span className="font-semibold">{brand.name}</span>
              {typeLabel ? <span className="font-normal"> {typeLabel}</span> : null}
            </>
          ) : (
            <span className="font-semibold">{name}</span>
          )}
        </p>
        {size ? (
          <span className="flex-none text-[13px] font-medium tabular-nums text-ink">{size}</span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2 px-2.5 md:px-0">
        <p
          className={clsx(
            "text-[13px] font-bold tabular-nums",
            sold ? "text-muted line-through" : "text-ink"
          )}
        >
          {formatPrice(price, locale, false)}
        </p>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? t("unsave", { name: title }) : t("save", { name: title })}
          onClick={() => toggle(id)}
          className="grid h-9 w-9 flex-none place-items-center"
        >
          <HeartIcon
            className={clsx(
              "h-[18px] w-[18px]",
              saved ? "fill-accent text-accent" : "fill-none text-ink"
            )}
          />
        </button>
      </div>
    </article>
  );
}
