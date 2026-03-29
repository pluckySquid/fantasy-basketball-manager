import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";

export default async function StatsPage() {
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
      title="Season Leaders"
      subtitle="Track the strongest individual seasons across the league and compare who is driving the MVP race."
    >
      <section className="mb-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <SectionCard title="Season Awards">
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

        <SectionCard title="Contract Watch">
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
