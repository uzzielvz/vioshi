import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-black text-white",
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-yellow-600 text-white",
  };

  return (
    <span
      className={cn(
        "inline-block px-2 py-1 text-xs uppercase tracking-wide font-normal",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

