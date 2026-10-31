/** One number of a profile, Grailed style: the label on top, the number below. */
export function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-0.5">
      <dt className="whitespace-nowrap text-[11.5px] text-muted">{label}</dt>
      <dd className="text-[15px] font-semibold leading-tight tabular-nums text-ink">{value.toLocaleString('es-MX')}</dd>
    </div>
  );
}
