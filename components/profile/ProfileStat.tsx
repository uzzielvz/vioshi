/** One «**N** label» item of a profile's numbers row. */
export function ProfileStat({ children }: { children: React.ReactNode }) {
  return <span className="whitespace-nowrap">{children}</span>;
}

/** The `b` tag for rich stat messages. */
export const boldStat = (chunks: React.ReactNode) => <b className="font-bold tabular-nums">{chunks}</b>;
