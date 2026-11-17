import clsx from "clsx";
import { formatPrice } from "@/lib/formatters";
import type { Locale } from "@/i18n";

/**
 * Shared price. Red (`text-sale`) is only the reduced figure.
 * A sold piece stays muted and struck, with no sale color.
 */
export default function Price({
  price,
  compareAt,
  locale,
  sold = false,
  className,
  compareClassName,
}: {
  price: number;
  compareAt?: number;
  locale: Locale;
  sold?: boolean;
  className?: string;
  compareClassName?: string;
}) {
  const onSale = !sold && compareAt != null && compareAt > price;

  return (
    <span className={clsx("inline-flex flex-wrap items-baseline gap-x-1.5", className)}>
      {onSale ? (
        <span className={clsx("font-semibold text-muted line-through", compareClassName)}>
          {formatPrice(compareAt, locale, false)}
        </span>
      ) : null}
      <span className={sold ? "text-muted line-through" : onSale ? "text-sale" : "text-ink"}>
        {formatPrice(price, locale, false)}
      </span>
    </span>
  );
}
