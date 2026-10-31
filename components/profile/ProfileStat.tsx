/** One number of a profile, Grailed style: the label on top, the number below. */
export function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-1">
      <dt className="whitespace-nowrap text-[12.5px] text-muted">{label}</dt>
      <dd className="text-[18px] font-bold leading-none tabular-nums text-ink">{value.toLocaleString('es-MX')}</dd>
    </div>
  );
}
