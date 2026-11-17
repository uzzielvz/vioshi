import { Fragment } from "react";
import clsx from "clsx";
import { brand } from "@/lib/brand";
import { isMarketplace } from "@/lib/mode";

/**
 * Brand wordmark: the name in lowercase with every "i" drawn dotless and the
 * same round dot painted on top (accent blue on the platform, ink on the
 * single store). Names without an "i" render as plain text, so renaming by env
 * keeps working.
 */
export default function Wordmark({ className }: { className?: string }) {
  const parts = brand.name.toLowerCase().split("i");

  return (
    <span
      className={clsx("inline-flex items-end font-extrabold leading-none tracking-[-0.05em]", className)}
      style={{ fontVariationSettings: "'opsz' 32" }}
      aria-label={brand.name}
    >
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span className="relative inline-block" aria-hidden="true">
              ı
              <span
                className={clsx(
                  "absolute left-1/2 top-[0.09em] h-[0.18em] w-[0.18em] -translate-x-1/2 rounded-full",
                  isMarketplace ? "bg-accent" : "bg-ink"
                )}
              />
            </span>
          )}
          {part}
        </Fragment>
      ))}
    </span>
  );
}
