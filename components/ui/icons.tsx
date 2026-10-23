// Stroke icons used across the storefront. Size and color come from the parent (currentColor).
type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
} as const;

export function SearchIcon({ className }: IconProps) {
  return <svg {...base} className={className}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>;
}
export function CameraIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>;
}
export function BagIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>;
}
export function HeartIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" /></svg>;
}
export function HomeIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M4 11l8-6 8 6v9h-5v-6H9v6H4z" /></svg>;
}
export function SellIcon({ className }: IconProps) {
  return <svg {...base} className={className}><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M12 8v8M8 12h8" /></svg>;
}
export function UserIcon({ className }: IconProps) {
  return <svg {...base} className={className}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.7-3.6 3.6-5.6 7-5.6s6.3 2 7 5.6" /></svg>;
}
export function MenuIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}
export function CloseIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>;
}
export function ChevronIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M9 6l6 6-6 6" /></svg>;
}
export function InstagramIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
