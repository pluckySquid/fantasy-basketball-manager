import Link from "next/link";

function playerTier(overall: number) {
  if (overall >= 88) {
    return { label: "Legend", styles: "bg-amber-300/20 text-amber-100 border-amber-300/30" };
  }
  if (overall >= 82) {
    return { label: "Elite", styles: "bg-cyan-300/20 text-cyan-100 border-cyan-300/30" };
  }
  if (overall >= 76) {
    return { label: "Starter", styles: "bg-emerald-300/20 text-emerald-100 border-emerald-300/30" };
  }
  return { label: "Rotation", styles: "bg-slate-300/10 text-slate-100 border-white/10" };
}

function rarityStyles(rarity: "Bronze" | "Silver" | "Gold" | "Platinum") {
  switch (rarity) {
    case "Platinum":
      return "from-cyan-300/30 via-slate-100/10 to-indigo-400/25 border-cyan-200/30";
    case "Gold":
      return "from-amber-300/30 via-slate-100/10 to-orange-400/25 border-amber-200/30";
    case "Silver":
      return "from-slate-300/25 via-slate-100/10 to-sky-200/20 border-slate-200/20";
    default:
      return "from-orange-800/30 via-slate-100/10 to-amber-900/20 border-orange-300/20";
  }
}

function playerArchetype({
  scoring,
  playmaking,
  rebounding,
  defense,
}: {
  scoring: number;
  playmaking: number;
  rebounding: number;
  defense: number;
}) {
  const highest = Math.max(scoring, playmaking, rebounding, defense);
  if (highest === playmaking) {
    return "Floor General";
  }
  if (highest === defense) {
    return "Stopper";
  }
  if (highest === rebounding) {
    return "Glass Cleaner";
  }
  return "Shot Creator";
}

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

export function PlayerShowcaseCard({
  player,
  href,
}: {
  player: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    age: number;
    overall: number;
    scoring: number;
    playmaking: number;
    rebounding: number;
    defense: number;
    stamina: number;
    salary: number;
    rarity: "Bronze" | "Silver" | "Gold" | "Platinum";
    archetype: string;
    potential: number;
  };
  href: string;
}) {
  const tier = playerTier(player.overall);
  const archetype = playerArchetype(player);

  return (
    <Link
      href={href}
      className={`group rounded-[28px] border bg-[linear-gradient(160deg,var(--tw-gradient-stops))] p-5 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:border-amber-300/40 ${rarityStyles(player.rarity)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{player.position}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {player.firstName} {player.lastName}
          </h3>
          <p className="mt-1 text-sm text-slate-300">
            {archetype} | Age {player.age}
          </p>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${tier.styles}`}>
          {tier.label}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-300">
        <span>{player.rarity}</span>
        <span>{player.archetype}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Overall</p>
          <p className="mt-1 text-3xl font-semibold text-white">{player.overall}</p>
        </div>
        <div className="rounded-2xl bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Salary</p>
          <p className="mt-2 text-lg font-semibold text-white">${player.salary.toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <RatingBar label="Scoring" value={player.scoring} />
        <RatingBar label="Playmaking" value={player.playmaking} />
        <RatingBar label="Rebounding" value={player.rebounding} />
        <RatingBar label="Defense" value={player.defense} />
        <RatingBar label="Potential" value={player.potential} />
      </div>
    </Link>
  );
}
