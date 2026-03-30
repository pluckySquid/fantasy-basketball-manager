import { existsSync } from "node:fs";
import { resolve } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { copy, translateArchetype, translateRarity, type Locale } from "@/lib/i18n";

function playerTier(overall: number, locale: Locale) {
  const t = copy[locale].common;
  if (overall >= 88) {
    return { label: t.legend, styles: "bg-amber-300/20 text-amber-100 border-amber-300/30" };
  }
  if (overall >= 82) {
    return { label: t.elite, styles: "bg-cyan-300/20 text-cyan-100 border-cyan-300/30" };
  }
  if (overall >= 76) {
    return { label: t.starter, styles: "bg-emerald-300/20 text-emerald-100 border-emerald-300/30" };
  }
  return { label: t.rotation, styles: "bg-slate-300/10 text-slate-100 border-white/10" };
}

function roleBadge(archetype: string, locale: Locale) {
  const t = copy[locale].common;
  if (archetype.includes("Floor General")) {
    return { label: t.creator, styles: "border-sky-300/30 bg-sky-300/12 text-sky-100" };
  }
  if (archetype.includes("Rim") || archetype.includes("Glass") || archetype.includes("Big")) {
    return { label: t.anchor, styles: "border-emerald-300/30 bg-emerald-300/12 text-emerald-100" };
  }
  if (archetype.includes("Two-Way")) {
    return { label: t.twoWay, styles: "border-violet-300/30 bg-violet-300/12 text-violet-100" };
  }
  if (archetype.includes("Athletic")) {
    return { label: t.slasher, styles: "border-rose-300/30 bg-rose-300/12 text-rose-100" };
  }
  return { label: t.bucket, styles: "border-amber-300/30 bg-amber-300/12 text-amber-100" };
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

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function portraitPalette(seed: string) {
  const hash = hashString(seed);
  const skinTones = [
    ["#f1c7a2", "#d7a17b"],
    ["#d7a17b", "#b97852"],
    ["#a66d4a", "#7f4c31"],
    ["#7b523d", "#553427"],
  ];
  const jerseyTones = [
    ["#38bdf8", "#1d4ed8"],
    ["#f59e0b", "#b45309"],
    ["#22c55e", "#15803d"],
    ["#fb7185", "#be123c"],
    ["#a78bfa", "#6d28d9"],
  ];
  const backgroundTones = [
    ["#0f172a", "#1e293b"],
    ["#172554", "#1d4ed8"],
    ["#3f1d2e", "#7f1d1d"],
    ["#082f49", "#155e75"],
  ];

  return {
    skin: skinTones[hash % skinTones.length],
    jersey: jerseyTones[Math.floor(hash / 7) % jerseyTones.length],
    background: backgroundTones[Math.floor(hash / 17) % backgroundTones.length],
  };
}

function portraitSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function cardFrameStyles(rarity: "Bronze" | "Silver" | "Gold" | "Platinum") {
  switch (rarity) {
    case "Platinum":
      return "before:absolute before:inset-0 before:rounded-[28px] before:border before:border-cyan-200/30 before:shadow-[0_0_28px_rgba(34,211,238,0.18)]";
    case "Gold":
      return "before:absolute before:inset-0 before:rounded-[28px] before:border before:border-amber-200/30 before:shadow-[0_0_24px_rgba(251,191,36,0.16)]";
    case "Silver":
      return "before:absolute before:inset-0 before:rounded-[28px] before:border before:border-slate-200/20 before:shadow-[0_0_18px_rgba(226,232,240,0.12)]";
    default:
      return "before:absolute before:inset-0 before:rounded-[28px] before:border before:border-orange-300/20";
  }
}

export function PlayerPortrait({
  name,
  rarity,
  className = "h-44 w-full",
}: {
  name: string;
  rarity: "Bronze" | "Silver" | "Gold" | "Platinum";
  className?: string;
}) {
  const palette = portraitPalette(`${name}-${rarity}`);
  const hash = hashString(`${rarity}-${name}`);
  const faceWidth = 52 + (hash % 10);
  const eyeOffset = 12 + (hash % 3);
  const jawY = 108 + (hash % 6);
  const hairHeight = 28 + (hash % 10);
  const glow =
    rarity === "Platinum"
      ? "rgba(34,211,238,0.35)"
      : rarity === "Gold"
        ? "rgba(251,191,36,0.3)"
        : rarity === "Silver"
          ? "rgba(226,232,240,0.24)"
          : "rgba(217,119,6,0.2)";
  const slug = portraitSlug(name);
  const portraitPath = `/portraits/${slug}.png`;
  const localPortrait = resolve(process.cwd(), "public", "portraits", `${slug}.png`);

  return (
    <div className={`overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/60 ${className}`}>
      {existsSync(localPortrait) ? (
        <Image
          src={portraitPath}
          alt={`${name} portrait`}
          width={480}
          height={400}
          className="h-full w-full object-cover"
        />
      ) : (
      <svg viewBox="0 0 240 200" className="h-full w-full" role="img" aria-label={`${name} portrait`}>
        <defs>
          <linearGradient id={`bg-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.background[0]} />
            <stop offset="100%" stopColor={palette.background[1]} />
          </linearGradient>
          <linearGradient id={`skin-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.skin[0]} />
            <stop offset="100%" stopColor={palette.skin[1]} />
          </linearGradient>
          <linearGradient id={`jersey-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.jersey[0]} />
            <stop offset="100%" stopColor={palette.jersey[1]} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="240" height="200" fill={`url(#bg-${hash})`} />
        <circle cx="190" cy="36" r="30" fill={glow} />
        <rect x="0" y="146" width="240" height="54" fill="rgba(8,15,30,0.7)" />
        <ellipse cx="120" cy="198" rx="76" ry="18" fill="rgba(2,6,23,0.6)" />
        <ellipse cx="120" cy="84" rx={faceWidth} ry="58" fill={`url(#skin-${hash})`} />
        <path
          d={`M ${120 - faceWidth} 82 C ${120 - faceWidth + 5} ${44 + hairHeight}, ${120 + faceWidth - 5} ${44 + hairHeight}, ${120 + faceWidth} 82 L ${120 + faceWidth - 8} 62 C 156 ${36 + hairHeight / 2}, 84 ${36 + hairHeight / 2}, ${120 - faceWidth + 8} 62 Z`}
          fill="rgba(15,23,42,0.88)"
        />
        <circle cx={120 - eyeOffset} cy="86" r="4" fill="#0f172a" />
        <circle cx={120 + eyeOffset} cy="86" r="4" fill="#0f172a" />
        <path d={`M 110 102 Q 120 108 130 102`} stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={`M 94 ${jawY} Q 120 ${jawY + 18} 146 ${jawY}`} fill="rgba(15,23,42,0.08)" />
        <rect x="103" y="118" width="34" height="24" rx="14" fill={`url(#skin-${hash})`} />
        <path d="M 62 188 Q 92 136 120 142 Q 148 136 178 188" fill={`url(#jersey-${hash})`} />
        <path d="M 92 152 Q 120 168 148 152" fill="rgba(255,255,255,0.18)" />
      </svg>
      )}
    </div>
  );
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
    <article className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.84))] p-5 shadow-lg shadow-slate-950/20">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-16 rounded-full bg-white/6 blur-2xl" />
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
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.9),rgba(15,23,42,0.84))] p-6 shadow-lg shadow-slate-950/20">
      <div className="pointer-events-none absolute left-6 right-6 top-0 h-20 rounded-full bg-white/5 blur-3xl" />
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
        <div
          className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(251,191,36,0.84),rgba(34,211,238,0.7))]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function PlayerShowcaseCard({
  player,
  href,
  locale = "en",
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
    contractYears: number;
    rarity: "Bronze" | "Silver" | "Gold" | "Platinum";
    archetype: string;
    potential: number;
  };
  href: string;
  locale?: Locale;
}) {
  const t = copy[locale].common;
  const tier = playerTier(player.overall, locale);
  const translatedArchetype = translateArchetype(player.archetype, locale);
  const role = roleBadge(player.archetype, locale);
  const fullName = `${player.firstName} ${player.lastName}`;

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[30px] border bg-[linear-gradient(160deg,var(--tw-gradient-stops))] p-5 shadow-[0_22px_60px_rgba(2,6,23,0.35)] transition duration-200 hover:-translate-y-1.5 hover:border-amber-300/40 ${rarityStyles(player.rarity)} ${cardFrameStyles(player.rarity)}`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-3 h-20 rounded-full bg-white/8 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-10 bottom-10 h-24 rounded-full bg-amber-300/10 blur-3xl transition group-hover:bg-cyan-300/10" />
      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/35 p-3">
        <div className="absolute inset-x-0 top-0 h-14 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)]" />
        <PlayerPortrait name={fullName} rarity={player.rarity} className="h-56 w-full" />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full border border-black/10 bg-slate-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-100">
            {player.position}
          </span>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.08em] whitespace-nowrap ${tier.styles}`}>
            {tier.label}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="mt-2 text-xl font-semibold text-white">{fullName}</h3>
          <p className="mt-1 text-sm text-slate-300">
            {translatedArchetype} | {t.age} {player.age}
          </p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-slate-950/60 px-4 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">{t.overall}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{player.overall}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs tracking-[0.08em] text-slate-300">
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 whitespace-nowrap">{translateRarity(player.rarity, locale)}</span>
        <span className={`rounded-full border px-2.5 py-1 ${role.styles}`}>{role.label}</span>
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 whitespace-nowrap">
          {player.contractYears}{t.yearsDeal}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.salary}</p>
          <p className="mt-2 text-lg font-semibold text-white">${player.salary.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.fit}</p>
          <p className="mt-2 text-lg font-semibold text-white">{role.label}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <RatingBar label={t.scoring} value={player.scoring} />
        <RatingBar label={t.playmaking} value={player.playmaking} />
        <RatingBar label={t.rebounding} value={player.rebounding} />
        <RatingBar label={t.defense} value={player.defense} />
        <RatingBar label={t.potential} value={player.potential} />
      </div>
    </Link>
  );
}
