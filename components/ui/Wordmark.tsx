import clsx from "clsx";
import { brand } from "@/lib/brand";

/**
 * Platform wordmark: the brand name in lowercase with the first "i" drawn
 * dotless and its dot painted in the accent blue. Names without an "i"
 * render as plain text, so renaming the platform by env keeps working.
 */
export default function Wordmark({ className }: { className?: string }) {
  const name = brand.name.toLowerCase();
  const i = name.indexOf("i");

  return (
    <span
      className={clsx("inline-flex items-end font-extrabold leading-none tracking-[-0.05em]", className)}
      style={{ fontVariationSettings: "'opsz' 32" }}
      aria-label={brand.name}
    >
      {i === -1 ? (
        name
      ) : (
        <>
          {name.slice(0, i)}
          <span className="relative inline-block" aria-hidden="true">
            ı
            <span className="absolute left-1/2 top-[0.09em] h-[0.18em] w-[0.18em] -translate-x-1/2 rounded-full bg-accent" />
          </span>
          {name.slice(i + 1)}
        </>
      )}
    </span>
  );
}
