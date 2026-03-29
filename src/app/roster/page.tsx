import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";

export default async function RosterPage() {
  const snapshot = await getGameSnapshot();

  return (
    <AppShell
      title="Team Roster"
      subtitle="Scout every contract on your roster, compare role fit, and jump into player cards for more detail."
    >
      <SectionCard title={`${snapshot.favoriteTeam.name} Roster`}>
        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Pos</th>
                <th className="px-4 py-3">OVR</th>
                <th className="px-4 py-3">Scoring</th>
                <th className="px-4 py-3">Playmaking</th>
                <th className="px-4 py-3">Rebounding</th>
                <th className="px-4 py-3">Defense</th>
                <th className="px-4 py-3">Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/60 text-slate-100">
              {snapshot.favoriteTeam.players.map((player) => (
                <tr key={player.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-4">
                    <Link href={`/players/${player.id}`} className="font-medium text-white hover:text-amber-200">
                      {player.firstName} {player.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{player.position}</td>
                  <td className="px-4 py-4">{player.overall}</td>
                  <td className="px-4 py-4">{player.scoring}</td>
                  <td className="px-4 py-4">{player.playmaking}</td>
                  <td className="px-4 py-4">{player.rebounding}</td>
                  <td className="px-4 py-4">{player.defense}</td>
                  <td className="px-4 py-4">${player.salary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
