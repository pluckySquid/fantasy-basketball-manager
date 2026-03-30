import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LiveMatchCenter } from "@/components/live-match-center";
import { SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale, translateMatchSummary, type Locale } from "@/lib/i18n";

function buildQuarterLines(homeScore: number, awayScore: number) {
  const weights = [0.22, 0.26, 0.24, 0.28];
  const homeBase = weights.slice(0, 3).map((weight) => Math.round(homeScore * weight));
  const awayBase = weights.slice(0, 3).map((weight) => Math.round(awayScore * weight));

  return {
    home: [...homeBase, homeScore - homeBase.reduce((sum, value) => sum + value, 0)],
    away: [...awayBase, awayScore - awayBase.reduce((sum, value) => sum + value, 0)],
  };
}

function buildMomentumStops(homeScore: number, awayScore: number) {
  const margin = homeScore - awayScore;
  const swingA = Math.max(-16, Math.min(16, Math.round(margin * 0.25)));
  const swingB = Math.max(-18, Math.min(18, Math.round(margin * 0.55) - 4));
  const swingC = Math.max(-22, Math.min(22, Math.round(margin * 0.85) + 3));
  return [swingA, swingB, swingC, margin];
}

function buildPlayByPlay(params: {
  locale: Locale;
  homeTeam: { abbreviation: string };
  awayTeam: { abbreviation: string };
  homeScore: number;
  awayScore: number;
  homeTopPerformer: string | null;
  awayTopPerformer: string | null;
  summary: string | null;
}) {
  const { locale, homeTeam, awayTeam, homeScore, awayScore, homeTopPerformer, awayTopPerformer, summary } = params;
  const winner = homeScore >= awayScore ? homeTeam.abbreviation : awayTeam.abbreviation;
  const closer = homeScore >= awayScore ? awayTeam.abbreviation : homeTeam.abbreviation;
  const margin = Math.abs(homeScore - awayScore);
  const homeStar = homeTopPerformer ?? "";
  const awayStar = awayTopPerformer ?? "";

  if (locale === "zh") {
    return [
      `首节节奏很快，${awayTeam.abbreviation} 与 ${homeTeam.abbreviation} 一上来就打成对攻。`,
      `${homeStar || `${homeTeam.abbreviation} 核心球员`}在第二节开始接管回合，比赛强度明显提升。`,
      `${awayStar || `${awayTeam.abbreviation} 核心球员`}在第三节连续回应，比分一直没有被彻底拉开。`,
      `末节进入决胜阶段后，${winner} 顶住了 ${closer} 的反扑，最终以 ${margin} 分优势收下比赛。`,
      translateMatchSummary(summary, locale) ?? `${winner} 在最后阶段守住了胜势。`,
    ];
  }

  return [
    `${awayTeam.abbreviation} and ${homeTeam.abbreviation} traded quick scores in the opening quarter.`,
    `${homeStar || `${homeTeam.abbreviation}'s lead creator`} pushed the pace in the second period and kept pressure on the defense.`,
    `${awayStar || `${awayTeam.abbreviation}'s closer`} answered in the third and kept the game within striking distance.`,
    `${winner} survived the late swing from ${closer} and closed the night by ${margin}.`,
    translateMatchSummary(summary, locale) ?? `${winner} controlled the final stretch.`,
  ];
}

export default async function SchedulePage() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();
  const grouped = snapshot.matches.reduce(
    (result, match) => {
      const key = String(match.round);
      result[key] ??= [];
      result[key].push(match);
      return result;
    },
    {} as Record<string, typeof snapshot.matches>,
  );

  return (
    <AppShell
      title={t.schedule.title}
      subtitle={t.schedule.subtitle}
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <div className="grid gap-5">
        {Object.entries(grouped).map(([round, matches]) => (
          <SectionCard key={round} title={locale === "zh" ? `第${round}轮` : `Round ${round}`}>
            <div className="grid gap-3">
              {matches.map((match) => {
                const quarters =
                  match.homeScore !== null && match.awayScore !== null
                    ? buildQuarterLines(match.homeScore, match.awayScore)
                    : null;

                return (
                  <article
                    key={match.id}
                    className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.74),rgba(2,6,23,0.82))] p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold text-white">
                        {match.awayTeam.abbreviation}
                        {match.played ? ` ${match.awayScore}` : ""} {locale === "zh" ? "对阵" : "at"} {match.homeTeam.abbreviation}
                        {match.played ? ` ${match.homeScore}` : ""}
                      </p>
                      <div className="flex items-center gap-2">
                        {match.played ? (
                          <Link
                            href={`/live/${match.id}`}
                            className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/18"
                          >
                            {locale === "zh" ? "进入直播" : "Open Live"}
                          </Link>
                        ) : null}
                        <p className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                          {match.played ? t.schedule.final : t.schedule.upcoming}
                        </p>
                      </div>
                    </div>
                    {match.played ? (
                      <div className="mt-3 grid gap-4 text-sm text-slate-300">
                        {quarters ? (
                          <LiveMatchCenter
                            locale={locale}
                            homeTeam={match.homeTeam}
                            awayTeam={match.awayTeam}
                            homeScore={match.homeScore ?? 0}
                            awayScore={match.awayScore ?? 0}
                            homeTopPerformer={match.homeTopPerformer}
                            awayTopPerformer={match.awayTopPerformer}
                            summary={translateMatchSummary(match.summary, locale) ?? ""}
                            events={buildPlayByPlay({
                              locale,
                              homeTeam: match.homeTeam,
                              awayTeam: match.awayTeam,
                              homeScore: match.homeScore ?? 0,
                              awayScore: match.awayScore ?? 0,
                              homeTopPerformer: match.homeTopPerformer,
                              awayTopPerformer: match.awayTopPerformer,
                              summary: match.summary,
                            })}
                            momentumStops={buildMomentumStops(match.homeScore ?? 0, match.awayScore ?? 0)}
                            quarters={quarters}
                          />
                        ) : null}

                        <div className="grid gap-4 lg:grid-cols-2">
                          {[
                            { label: match.homeTeam.abbreviation, rows: match.homeBoxScore },
                            { label: match.awayTeam.abbreviation, rows: match.awayBoxScore },
                          ].map((box) => (
                            <div key={`${match.id}-${box.label}`} className="overflow-hidden rounded-2xl border border-white/10">
                              <table className="min-w-full divide-y divide-white/10 text-left text-xs">
                                <thead className="bg-white/5 uppercase tracking-[0.2em] text-slate-400">
                                  <tr>
                                    <th className="px-3 py-2">{box.label}</th>
                                    <th className="px-3 py-2">{locale === "zh" ? "得分" : "PTS"}</th>
                                    <th className="px-3 py-2">{locale === "zh" ? "篮板" : "REB"}</th>
                                    <th className="px-3 py-2">{locale === "zh" ? "助攻" : "AST"}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10 bg-slate-950/60">
                                  {box.rows.map((line) => (
                                    <tr key={`${match.id}-${box.label}-${line.playerId}`}>
                                      <td className="px-3 py-2 text-white">
                                        {line.player.firstName} {line.player.lastName}
                                      </td>
                                      <td className="px-3 py-2">{line.points}</td>
                                      <td className="px-3 py-2">{line.rebounds}</td>
                                      <td className="px-3 py-2">{line.assists}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </SectionCard>
        ))}
      </div>
    </AppShell>
  );
}
