import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";

export default async function StandingsPage() {
  const snapshot = await getGameSnapshot();
  const standings = [...snapshot.teams].sort((left, right) => {
    const winDiff = right.wins - left.wins;
    if (winDiff !== 0) {
      return winDiff;
    }

    const pointDiff = right.pointsFor - right.pointsAgainst - (left.pointsFor - left.pointsAgainst);
    if (pointDiff !== 0) {
      return pointDiff;
    }

    return right.pointsFor - left.pointsFor;
  });

  return (
    <AppShell
      title="League Standings"
      subtitle="Wins decide placement first, then point differential, then total points scored."
    >
      <SectionCard title={`${snapshot.profile.season.name} Table`}>
        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Record</th>
                <th className="px-4 py-3">PF</th>
                <th className="px-4 py-3">PA</th>
                <th className="px-4 py-3">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/60 text-slate-100">
              {standings.map((team, index) => {
                const diff = team.pointsFor - team.pointsAgainst;
                return (
                  <tr key={team.id} className="transition hover:bg-white/5">
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4 font-medium text-white">{team.name}</td>
                    <td className="px-4 py-4">
                      {team.wins}-{team.losses}
                    </td>
                    <td className="px-4 py-4">{team.pointsFor}</td>
                    <td className="px-4 py-4">{team.pointsAgainst}</td>
                    <td className={`px-4 py-4 ${diff >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                      {diff >= 0 ? "+" : ""}
                      {diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
