import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale } from "@/lib/i18n";

export default async function StatsPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();
  type LeaderRow = (typeof snapshot.scoringLeaders)[number] & { mvpScore?: number };

  const sections = [
    {
      title: "Scoring Leaders",
      rows: snapshot.scoringLeaders,
      suffix: "PPG",
      format: (entry: LeaderRow) => entry.ppg.toFixed(1),
    },
    {
      title: "Assist Leaders",
      rows: snapshot.assistLeaders,
      suffix: "APG",
      format: (entry: LeaderRow) => entry.apg.toFixed(1),
    },
    {
      title: "Rebound Leaders",
      rows: snapshot.reboundLeaders,
      suffix: "RPG",
      format: (entry: LeaderRow) => entry.rpg.toFixed(1),
    },
    {
      title: "MVP Ladder",
      rows: snapshot.mvpLadder as LeaderRow[],
      suffix: "Score",
      format: (entry: LeaderRow) => (entry.mvpScore ?? 0).toFixed(1),
    },
  ];

  return (
    <AppShell
      title={t.stats.title}
      subtitle={t.stats.subtitle}
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <section className="mb-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <SectionCard title={t.stats.seasonAwards}>
          <div className="grid gap-3">
            {[
              {
                label: "Champion",
                value: snapshot.seasonAwards.champion ? snapshot.seasonAwards.champion.name : "Season still in progress",
                detail: snapshot.seasonAwards.champion
                  ? `${snapshot.seasonAwards.champion.wins}-${snapshot.seasonAwards.champion.losses} final record`
                  : "Finish the regular season to crown the title winner.",
              },
              {
                label: "League MVP",
                value: snapshot.seasonAwards.mvp
                  ? `${snapshot.seasonAwards.mvp.player.firstName} ${snapshot.seasonAwards.mvp.player.lastName}`
                  : "No leader yet",
                detail: snapshot.seasonAwards.mvp
                  ? `${snapshot.seasonAwards.mvp.team.abbreviation} | ${snapshot.seasonAwards.mvp.ppg.toFixed(1)} PPG`
                  : "Simulate games to seed the race.",
              },
              {
                label: "Scoring Champion",
                value: snapshot.seasonAwards.scoringChampion
                  ? `${snapshot.seasonAwards.scoringChampion.player.firstName} ${snapshot.seasonAwards.scoringChampion.player.lastName}`
                  : "No leader yet",
                detail: snapshot.seasonAwards.scoringChampion
                  ? `${snapshot.seasonAwards.scoringChampion.ppg.toFixed(1)} PPG`
                  : "Scoring table is empty until games are played.",
              },
              {
                label: "Playmaking Award",
                value: snapshot.seasonAwards.assistChampion
                  ? `${snapshot.seasonAwards.assistChampion.player.firstName} ${snapshot.seasonAwards.assistChampion.player.lastName}`
                  : "No leader yet",
                detail: snapshot.seasonAwards.assistChampion
                  ? `${snapshot.seasonAwards.assistChampion.apg.toFixed(1)} APG`
                  : "Assist leader appears after the first round.",
              },
              {
                label: "Glass King",
                value: snapshot.seasonAwards.reboundChampion
                  ? `${snapshot.seasonAwards.reboundChampion.player.firstName} ${snapshot.seasonAwards.reboundChampion.player.lastName}`
                  : "No leader yet",
                detail: snapshot.seasonAwards.reboundChampion
                  ? `${snapshot.seasonAwards.reboundChampion.rpg.toFixed(1)} RPG`
                  : "Rebound leader appears after the first round.",
              },
            ].map((award) => (
              <article key={award.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200">{award.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{award.value}</p>
                <p className="mt-1 text-sm text-slate-300">{award.detail}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={t.stats.contractWatch}>
          <div className="grid gap-3">
            {snapshot.expiringContracts.length === 0 ? (
              <p className="text-sm text-slate-300">No one on your roster is down to a one-year deal.</p>
            ) : (
              snapshot.expiringContracts.map((player) => (
                <div key={`watch-${player.id}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="font-semibold text-white">
                    {player.firstName} {player.lastName}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {player.contractYears}Y left | Extension {player.extensionCost} cr
                  </p>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard title={t.stats.franchiseTimeline}>
        <div className="grid gap-3">
          {snapshot.seasonHistory.length === 0 ? (
            <p className="text-sm text-slate-300">No completed seasons yet. Finish your current campaign to start building history.</p>
          ) : (
            snapshot.seasonHistory.map((entry) => (
              <article key={entry.seasonId} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="text-lg font-semibold text-white">{entry.seasonName}</p>
                  <p className="text-sm text-slate-300">Champion: {entry.championTeamName}</p>
                </div>
                <div className="mt-2 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                  <p>Your club record: {entry.favoriteTeamRecord}</p>
                  <p>League MVP: {entry.mvpName}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-2">
        {sections.map((section) => (
          <SectionCard key={section.title} title={section.title}>
            <div className="overflow-hidden rounded-[24px] border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Games</th>
                    <th className="px-4 py-3">{section.suffix}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/60 text-slate-100">
                  {section.rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-300">
                        Simulate games to populate this leaderboard.
                      </td>
                    </tr>
                  ) : (
                    section.rows.map((entry, index) => (
                      <tr key={`${section.title}-${entry.player.id}`} className="transition hover:bg-white/5">
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4 font-medium text-white">
                          {entry.player.firstName} {entry.player.lastName}
                        </td>
                        <td className="px-4 py-4">{entry.team.abbreviation}</td>
                        <td className="px-4 py-4">{entry.games}</td>
                        <td className="px-4 py-4">
                          {section.format(entry)} {section.suffix}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ))}
      </div>
    </AppShell>
  );
}
