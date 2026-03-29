import Link from "next/link";

export function MetricCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-slate-950/75 p-5 shadow-lg shadow-slate-950/20">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{caption}</p>
    </article>
  );
}

export function SectionCard({
  title,
  children,
  actionLabel,
  actionHref,
}: {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-950/75 p-6 shadow-lg shadow-slate-950/20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {actionLabel && actionHref ? (
          <Link href={actionHref} className="text-sm font-medium text-amber-300 transition hover:text-amber-200">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
        <span>{label}</span>
        <span className="text-slate-200">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-amber-300" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
