import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale } from "@/lib/i18n";

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
          <SectionCard key={round} title={`Round ${round}`}>
            <div className="grid gap-3">
              {matches.map((match) => (
                <article key={match.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-white">
                      {match.awayTeam.abbreviation}
                      {match.played ? ` ${match.awayScore}` : ""} at {match.homeTeam.abbreviation}
                      {match.played ? ` ${match.homeScore}` : ""}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {match.played ? t.schedule.final : t.schedule.upcoming}
                    </p>
                  </div>
                  {match.played ? (
                    <div className="mt-3 grid gap-4 text-sm text-slate-300">
                      <div className="grid gap-2 md:grid-cols-3">
                        <p>{match.summary}</p>
                        <p>{match.homeTopPerformer}</p>
                        <p>{match.awayTopPerformer}</p>
                      </div>

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
                                  <th className="px-3 py-2">PTS</th>
                                  <th className="px-3 py-2">REB</th>
                                  <th className="px-3 py-2">AST</th>
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
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </AppShell>
  );
}
