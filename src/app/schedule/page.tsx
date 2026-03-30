import { AppShell } from "@/components/app-shell";
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
                      <p className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {match.played ? t.schedule.final : t.schedule.upcoming}
                      </p>
                    </div>
                    {match.played ? (
                      <div className="mt-3 grid gap-4 text-sm text-slate-300">
                        <div className="live-center-shell rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200">
                                {locale === "zh" ? "比赛直播中心" : "Live Match Center"}
                              </p>
                              <p className="mt-2 text-sm text-slate-200">
                                {locale === "zh"
                                  ? `${match.homeTeam.abbreviation} 与 ${match.awayTeam.abbreviation} 的比赛节奏、关键回合和末节走势汇总如下。`
                                  : `A quick look at the pace, swing moments, and closing stretch between ${match.homeTeam.abbreviation} and ${match.awayTeam.abbreviation}.`}
                              </p>
                            </div>
                            <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-emerald-100">
                              {locale === "zh" ? "实时风格回放" : "Live-style recap"}
                            </div>
                          </div>
                        </div>

                        <div className="match-summary-banner rounded-[22px] px-4 py-3">
                          <p className="text-sm text-slate-100">{translateMatchSummary(match.summary, locale)}</p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          {[
                            {
                              label: locale === "zh" ? "主队关键先生" : "Home star",
                              value: match.homeTopPerformer,
                            },
                            {
                              label: locale === "zh" ? "客队关键先生" : "Away star",
                              value: match.awayTopPerformer,
                            },
                            {
                              label: locale === "zh" ? "分差" : "Margin",
                              value: `${Math.abs((match.homeScore ?? 0) - (match.awayScore ?? 0))}`,
                            },
                          ].map((panel) => (
                            <div key={panel.label} className="rounded-[20px] border border-white/10 bg-slate-950/55 px-4 py-3">
                              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{panel.label}</p>
                              <p className="mt-2 text-sm text-slate-100">{panel.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                          <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                                {locale === "zh" ? "关键回合" : "Play-by-play"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {locale === "zh" ? "模拟直播文本" : "Simulated live feed"}
                              </p>
                            </div>
                            <div className="mt-4 grid gap-3">
                              {buildPlayByPlay({
                                locale,
                                homeTeam: match.homeTeam,
                                awayTeam: match.awayTeam,
                                homeScore: match.homeScore ?? 0,
                                awayScore: match.awayScore ?? 0,
                                homeTopPerformer: match.homeTopPerformer,
                                awayTopPerformer: match.awayTopPerformer,
                                summary: match.summary,
                              }).map((event, index) => (
                                <div
                                  key={`${match.id}-event-${index}`}
                                  className="live-event rounded-[18px] border border-white/8 bg-white/5 px-4 py-3"
                                  style={{ animationDelay: `${index * 120}ms` }}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="mt-0.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-100">
                                      {locale === "zh" ? `片段 ${index + 1}` : `Clip ${index + 1}`}
                                    </span>
                                    <p className="text-sm text-slate-200">{event}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                              {locale === "zh" ? "比赛走势" : "Momentum"}
                            </p>
                            <div className="mt-4 grid gap-3">
                              {buildMomentumStops(match.homeScore ?? 0, match.awayScore ?? 0).map((swing, index) => {
                                const positive = swing >= 0;
                                const width = Math.min(100, Math.max(12, Math.abs(swing) * 2.4));
                                return (
                                  <div key={`${match.id}-momentum-${index}`} className="grid gap-2">
                                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                      <span>{["Q1", "Q2", "Q3", "Q4"][index]}</span>
                                      <span className={positive ? "text-cyan-200" : "text-amber-200"}>
                                        {positive ? match.homeTeam.abbreviation : match.awayTeam.abbreviation}
                                      </span>
                                    </div>
                                    <div className="h-3 rounded-full bg-white/8">
                                      <div
                                        className={`h-3 rounded-full ${positive ? "bg-[linear-gradient(90deg,rgba(34,211,238,0.95),rgba(59,130,246,0.75))]" : "bg-[linear-gradient(90deg,rgba(251,191,36,0.95),rgba(249,115,22,0.78))]"}`}
                                        style={{ width: `${width}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {quarters ? (
                          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/55">
                            <div className="grid grid-cols-6 border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                              <div className="px-3 py-2">{locale === "zh" ? "球队" : "Team"}</div>
                              {["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
                                <div key={quarter} className="px-3 py-2">
                                  {quarter}
                                </div>
                              ))}
                              <div className="px-3 py-2">{locale === "zh" ? "总分" : "Final"}</div>
                            </div>
                            {[
                              {
                                team: match.homeTeam.abbreviation,
                                scores: quarters.home,
                                final: match.homeScore,
                              },
                              {
                                team: match.awayTeam.abbreviation,
                                scores: quarters.away,
                                final: match.awayScore,
                              },
                            ].map((row) => (
                              <div key={`${match.id}-${row.team}-quarters`} className="grid grid-cols-6 border-t border-white/8 text-sm text-slate-100">
                                <div className="px-3 py-3 font-semibold text-white">{row.team}</div>
                                {row.scores.map((score, index) => (
                                  <div key={`${row.team}-${index}`} className="px-3 py-3">
                                    {score}
                                  </div>
                                ))}
                                <div className="px-3 py-3 font-semibold text-amber-200">{row.final}</div>
                              </div>
                            ))}
                          </div>
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
