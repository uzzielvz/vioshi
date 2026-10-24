import clsx from "clsx";

export default function EmptyState({
  icon,
  title,
  body,
  children,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mx-auto grid max-w-[360px] justify-items-center gap-3 px-4 py-14 text-center", className)}>
      {icon && (
        <span className="mb-1 grid h-16 w-16 place-items-center rounded-full bg-carton text-ink [&>svg]:h-7 [&>svg]:w-7">
          {icon}
        </span>
      )}
      <h2 className="text-[18px] font-bold tracking-[-0.01em] text-ink [text-wrap:balance]">{title}</h2>
      {body && <p className="text-[13.5px] leading-[1.45] text-muted">{body}</p>}
      {children && <div className="mt-2 grid w-full gap-2">{children}</div>}
    </div>
  );
}
