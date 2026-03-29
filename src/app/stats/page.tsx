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
