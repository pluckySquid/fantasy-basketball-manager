import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SellPlayerButton } from "@/components/action-forms";
import { MetricCard, PlayerShowcaseCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";

export default async function RosterPage() {
  const snapshot = await getGameSnapshot();

  return (
    <AppShell
      title="Team Roster"
      subtitle="Scout every contract on your roster, compare role fit, and jump into player cards for more detail."
    >
      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Payroll"
          value={`$${snapshot.favoritePayroll.toLocaleString()}`}
          caption="Total salary commitment across the active roster."
        />
        <MetricCard
          label="Average OVR"
          value={String(Math.round(snapshot.favoriteTeam.players.reduce((sum, player) => sum + player.overall, 0) / snapshot.favoriteTeam.players.length))}
          caption="Quick read on roster quality."
        />
        <MetricCard
          label="Top Player"
          value={`${snapshot.favoriteTeam.players[0].firstName} ${snapshot.favoriteTeam.players[0].lastName}`}
          caption="Current leader by overall rating."
        />
        <MetricCard
          label="Cap Room"
          value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
          caption={`Budget ceiling: $${snapshot.favoriteTeam.budget.toLocaleString()}`}
        />
        <MetricCard
          label="Chemistry"
          value={String(snapshot.favoriteChemistry.score)}
          caption={snapshot.favoriteChemistry.notes[0] ?? "Balanced roles improve team strength."}
        />
      </section>

      <SectionCard title={`${snapshot.favoriteTeam.name} Cards`}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.favoriteTeam.players.map((player) => (
            <div key={player.id} className="grid gap-3">
              <PlayerShowcaseCard player={player} href={`/players/${player.id}`} />
              <SellPlayerButton
                playerId={player.id}
                value={Math.round(player.salary * 0.75 + player.overall * 12)}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Table View">
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
                <th className="px-4 py-3">Contract</th>
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
                  <td className="px-4 py-4">{player.contractYears}Y</td>
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
