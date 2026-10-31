"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ProductData as Product } from "@/lib/products";
import { useCart } from "@/store/cartStore";
import { generateId } from "@/lib/utils";
import { formatPrice } from "@/lib/formatters";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { useWishlist } from "@/hooks/useWishlist";
import { rememberProduct } from "@/lib/search/recent";
import ProductGrid from "@/components/ProductGrid";
import FollowButton from "@/components/FollowButton";
import ConditionScale from "@/components/product/ConditionScale";
import { CheckIcon, HeartIcon } from "@/components/ui/icons";
import {
  CONDITION_LABELS,
  CONDITION_LABELS_EN,
  MEASUREMENT_LABELS,
  MEASUREMENT_LABELS_EN,
  requiredMeasurements,
  type MeasurementKey,
} from "@/lib/garments";

interface ProductContentProps {
  product: Product;
  more: Product[];
  payThreshold: string;
}

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group border-b border-line"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-[13px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden
          className={clsx(
            "h-[7px] w-[7px] border-b-[1.5px] border-r-[1.5px] border-current",
            open ? "translate-y-[1px] rotate-[225deg]" : "-translate-y-[1px] rotate-45"
          )}
        />
      </summary>
      <div className="pb-3.5 text-[13px] leading-relaxed text-ink">{children}</div>
    </details>
  );
}

export default function ProductContent({ product, more, payThreshold }: ProductContentProps) {
  const t = useTranslations("product");
  const tUi = useTranslations("ui.product");
  const tSocial = useTranslations("ui.social");
  const { locale } = useLocaleContext();
  const [isAdding, setIsAdding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem, openCart, cart } = useCart();
  const { has, toggle } = useWishlist();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saved = has(product.id);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // «Vistos hace poco» on the search screen.
  useEffect(() => {
    if (!product.image) return;
    rememberProduct({
      id: product.id,
      slug: product.slug,
      image: product.image,
      brand: product.brand?.name ?? null,
      name: product.name,
    });
  }, [product.id, product.slug, product.image, product.brand?.name, product.name]);

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const measurementLabels = locale === "en" ? MEASUREMENT_LABELS_EN : MEASUREMENT_LABELS;
  const conditionLabels = locale === "en" ? CONDITION_LABELS_EN : CONDITION_LABELS;
  const estado = product.availability ?? (product.soldOut ? "vendida" : "disponible");
  const inBag = cart.items.some((item) => item.productId === product.id);

  const measurementEntries = requiredMeasurements(product.garmentType)
    .map((key) => [key, product.measurements?.[key]] as const)
    .filter((entry): entry is readonly [MeasurementKey, number] => typeof entry[1] === "number");

  const handleAddToCart = () => {
    if (inBag) return;
    setIsAdding(true);
    addItem({
      id: generateId(),
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
      image: product.image,
      slug: product.slug,
      size: product.size,
    });

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 500);
  };

  const initial = product.store?.name.trim().charAt(0).toUpperCase() || "";

  return (
    <div>
      <div className="md:grid md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-start md:gap-11 md:px-8 md:pt-7">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden bg-carton md:hidden">
            <div
              className="flex h-full transition-transform duration-300"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {galleryImages.map((img, index) => (
                <div key={index} className="relative h-full min-w-full">
                  {img ? (
                    <Image
                      src={img}
                      alt={product.name}
                      fill
                      className={clsx(
                        "object-cover mix-blend-multiply",
                        estado === "vendida" && "opacity-45 grayscale"
                      )}
                      priority={index === 0}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            {galleryImages.length > 1 && (
              <span className="absolute bottom-2.5 right-2.5 bg-paper px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-ink">
                {tUi("photo", { n: currentImageIndex + 1, total: galleryImages.length })}
              </span>
            )}

            {galleryImages.length > 1 && currentImageIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentImageIndex((index) => index - 1)}
                className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink"
                aria-label={tUi("prev_photo")}
              >
                <span aria-hidden className="h-[7px] w-[7px] rotate-[135deg] border-r-[1.5px] border-t-[1.5px] border-current" />
              </button>
            )}
            {galleryImages.length > 1 && currentImageIndex < galleryImages.length - 1 && (
              <button
                type="button"
                onClick={() => setCurrentImageIndex((index) => index + 1)}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink"
                aria-label={tUi("next_photo")}
              >
                <span aria-hidden className="h-[7px] w-[7px] -rotate-45 border-r-[1.5px] border-t-[1.5px] border-current" />
              </button>
            )}
          </div>

          <div className={clsx("hidden md:grid md:gap-1.5", galleryImages.length > 1 ? "md:grid-cols-2" : "md:max-w-[560px] md:grid-cols-1")}>
            {galleryImages.map((img, index) => (
              <div key={index} className="relative aspect-[3/4] overflow-hidden bg-carton">
                {img ? (
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    className={clsx(
                      "object-cover mix-blend-multiply",
                      estado === "vendida" && "opacity-45 grayscale"
                    )}
                    priority={index === 0}
                    sizes="40vw"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-2.5 px-3.5 py-4 md:px-0 md:py-0">
          {product.brand?.name && (
            <div className="flex items-center justify-between gap-3">
              <Link
                href={`/${locale}/search?brand=${encodeURIComponent(product.brand.name)}`}
                aria-label={tSocial("brand_link", { brand: product.brand.name })}
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink"
              >
                {product.brand.name}
              </Link>
              {product.brand.id && (
                <FollowButton kind="brand" id={product.brand.id} name={product.brand.name} quiet />
              )}
            </div>
          )}

          <h1 className="text-balance text-[20px] font-bold leading-tight tracking-[-0.01em] text-ink md:text-[28px]">
            {product.name}
          </h1>

          {(product.size || product.condition) && (
            <p className="text-[13px] text-muted">
              {product.size ? tUi("size", { size: product.size }) : null}
              {product.size && product.condition ? " · " : null}
              {product.condition ? conditionLabels[product.condition] : null}
            </p>
          )}

          <p className="text-[24px] font-bold tabular-nums text-ink md:text-[30px]">
            {formatPrice(product.price, locale, false)}
          </p>

          {estado === "vendida" ? (
            <div className="grid gap-2.5">
              <button
                type="button"
                disabled
                className="h-12 w-full cursor-not-allowed rounded-btn bg-carton text-[14px] font-semibold text-muted"
              >
                {t("sold_out")}
              </button>
              <p className="text-[13px] leading-relaxed text-muted">{t("sold_note")}</p>
              <Link
                href={`/${locale}/collections/all`}
                className="flex h-12 items-center justify-center rounded-btn border border-ink text-[14px] font-semibold text-ink"
              >
                {t("see_others")}
              </Link>
            </div>
          ) : estado === "apartada" ? (
            <div className="grid gap-2.5">
              <button
                type="button"
                disabled
                className="h-12 w-full cursor-not-allowed rounded-btn border border-ink bg-paper text-[14px] font-semibold text-ink"
              >
                {t("reserved")}
              </button>
              <p className="text-[13px] leading-relaxed text-muted">{t("reserved_note")}</p>
            </div>
          ) : inBag && !isAdding ? (
            // Already in the bag: the button opens it instead of sitting disabled.
            <button
              type="button"
              onClick={openCart}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn border border-ink bg-paper text-[14px] font-semibold text-ink"
            >
              <CheckIcon className="h-4 w-4" />
              {tUi("in_bag_open")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              className="h-12 w-full rounded-btn bg-accent text-[14px] font-semibold text-paper hover:bg-accent-press disabled:opacity-80"
            >
              {isAdding ? tUi("adding") : tUi("add_to_bag")}
            </button>
          )}

          <button
            type="button"
            aria-pressed={saved}
            onClick={() => toggle(product.id)}
            className="-my-1.5 inline-flex w-fit items-center gap-1.5 py-1.5 text-[13px] font-semibold text-ink"
          >
            <HeartIcon
              className={clsx("h-4 w-4", saved ? "fill-accent text-accent" : "fill-none text-ink")}
            />
            {saved ? tUi("saved") : tUi("save")}
          </button>

          {product.store && (
            <div className="mt-1 flex items-center gap-3 border-y border-line py-3.5">
              <Link href={`/${locale}/tienda/${product.store.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-ink text-[17px] font-bold text-paper">
                  {initial}
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                    {tUi("sold_by")}
                  </span>
                  <span className="block truncate text-[14px] font-semibold text-ink">
                    {product.store.name}
                  </span>
                </span>
              </Link>
              <FollowButton kind="store" id={product.store.id} name={product.store.name} quiet />
            </div>
          )}

          {product.condition && (
            <ConditionScale condition={product.condition} defectNotes={product.defectNotes} locale={locale} />
          )}

          <div className={product.store ? "" : "mt-1 border-t border-line"}>
            {/* Caps, bags and other «otro» pieces have no measurements to show. */}
            {measurementEntries.length > 0 && (
              <Accordion title={tUi("measurements")} defaultOpen>
                <dl className="mb-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
                  {measurementEntries.map(([key, value]) => (
                    <Fragment key={key}>
                      <dt className="text-muted">{measurementLabels[key]}</dt>
                      <dd className="tabular-nums">{value} cm</dd>
                    </Fragment>
                  ))}
                </dl>
                <p className="text-[12px] text-muted">{t("measurement_note")}</p>
              </Accordion>
            )}

            {(product.description || (product.attributes && product.attributes.length > 0)) && (
              <Accordion title={tUi("details")}>
                {product.description && <p>{product.description}</p>}
                {product.attributes && product.attributes.length > 0 && (
                  <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
                    {product.attributes.map(({ key, value }) => (
                      <Fragment key={key}>
                        <dt className="text-muted">{key}</dt>
                        <dd>{value}</dd>
                      </Fragment>
                    ))}
                  </dl>
                )}
              </Accordion>
            )}

            <Accordion title={tUi("delivery")}>
              <p>{tUi("delivery_body")}</p>
              <p className="mt-2 text-muted">{tUi("pay_threshold", { threshold: payThreshold })}</p>
            </Accordion>
          </div>
        </div>
      </div>

      {more.length > 0 && product.store && (
        <section className="px-0 py-6 md:px-8">
          <div className="mb-3 flex items-baseline justify-between gap-3 px-3.5 md:px-0">
            <h2 className="text-[17px] font-bold text-ink">
              {tUi("more_from", { store: product.store.name })}
            </h2>
            <Link
              href={`/${locale}/tienda/${product.store.slug}`}
              className="text-[13px] font-semibold text-ink"
            >
              {tUi("see_profile")}
            </Link>
          </div>
          <ProductGrid products={more} />
        </section>
      )}
    </div>
  );
}
