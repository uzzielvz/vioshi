import Link from "next/link";
import clsx from "clsx";

export interface UnderlineTab {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}

// Text tabs: the active one is ink, 600 and underlined 2px. No pills.
// `inset` sits inside an already padded column and leaves the bottom rule to
// the list below it.
export default function UnderlineTabs({
  tabs,
  label,
  inset = false,
  className,
}: {
  tabs: UnderlineTab[];
  label: string;
  inset?: boolean;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={clsx(
        "flex max-w-full gap-[18px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        inset ? "px-4 md:px-0" : "border-b border-line px-4 md:px-8",
        className
      )}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={clsx(
            "-mb-px inline-flex h-[42px] flex-none items-center gap-[5px] whitespace-nowrap border-b-2 px-px text-[13px]",
            tab.active ? "border-ink font-semibold text-ink" : "border-transparent font-medium text-muted hover:text-ink"
          )}
        >
          {tab.label}
          {tab.count !== undefined && <small className="text-[12px] tabular-nums">{tab.count}</small>}
        </Link>
      ))}
    </nav>
  );
}
