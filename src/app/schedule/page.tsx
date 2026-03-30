import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale, translateMatchSummary } from "@/lib/i18n";

function buildQuarterLines(homeScore: number, awayScore: number) {
  const weights = [0.22, 0.26, 0.24, 0.28];
  const homeBase = weights.slice(0, 3).map((weight) => Math.round(homeScore * weight));
  const awayBase = weights.slice(0, 3).map((weight) => Math.round(awayScore * weight));

  return {
    home: [...homeBase, homeScore - homeBase.reduce((sum, value) => sum + value, 0)],
    away: [...awayBase, awayScore - awayBase.reduce((sum, value) => sum + value, 0)],
  };
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
