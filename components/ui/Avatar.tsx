import clsx from "clsx";

// Every account is the same kind of profile, so every avatar is round.
export default function Avatar({
  name,
  src,
  className,
  tone = "carton",
}: {
  name: string;
  src?: string | null;
  className?: string;
  tone?: "carton" | "ink";
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "·";

  return (
    <span
      className={clsx(
        "grid flex-none place-items-center overflow-hidden rounded-full font-bold",
        tone === "ink" ? "bg-ink text-paper" : "bg-carton text-ink",
        className
      )}
      aria-hidden="true"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
