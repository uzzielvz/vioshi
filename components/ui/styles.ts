import clsx from "clsx";

// Class recipes for the approved rail components (docs/design/TOKENS.md).

type ButtonVariant = "primary" | "line" | "soft";
type ButtonSize = "md" | "sm";

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    size === "md" ? "h-12 px-[18px] text-[14px]" : "h-10 px-4 text-[13px]",
    variant === "primary" && "bg-accent text-paper hover:bg-accent-press",
    variant === "line" && "border border-ink bg-paper text-ink",
    variant === "soft" && "bg-carton text-ink",
    className
  );
}

export const inputClass =
  "h-[46px] w-full rounded-btn border border-line bg-paper px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-ink disabled:bg-carton disabled:text-muted";

export const labelClass = "text-[12px] font-semibold text-ink";

export const hintClass = "text-[12px] text-muted";

export const sectionLabelClass = "text-[12px] font-semibold uppercase tracking-[0.1em] text-muted";

export const textLinkClass = "font-semibold text-accent hover:text-accent-press";

export const noteClass = "bg-carton p-3 text-[12.5px] leading-[1.45] text-ink";

export const screenTitleClass = "text-[20px] font-bold tracking-[-0.015em] text-ink";
