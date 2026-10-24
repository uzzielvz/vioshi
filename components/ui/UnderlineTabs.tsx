import Link from "next/link";
import clsx from "clsx";

export interface UnderlineTab {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}

// Text tabs: the active one is ink, 600 and underlined 2px. No pills.
export default function UnderlineTabs({
  tabs,
  label,
  className,
}: {
  tabs: UnderlineTab[];
  label: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={clsx(
        "flex max-w-full gap-[18px] overflow-x-auto border-b border-line px-4 [scrollbar-width:none] md:px-8 [&::-webkit-scrollbar]:hidden",
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
