import { AppShell } from "@/components/app-shell";
import { LineupForm } from "@/components/action-forms";
import { SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";

export default async function LineupPage() {
  const snapshot = await getGameSnapshot();
  const players = snapshot.favoriteTeam.players.map((player) => ({
    id: player.id,
    fullName: `${player.firstName} ${player.lastName}`,
    position: player.position,
    overall: player.overall,
  }));

  return (
    <AppShell
      title="Lineup Management"
      subtitle="Set your five starters and three bench spots. Starters must match position, and no player can fill two roles."
    >
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Rotation Builder">
          <LineupForm players={players} currentLineup={snapshot.favoriteLineup} />
        </SectionCard>

        <SectionCard title="Quick Rules">
          <div className="space-y-3 text-sm text-slate-300">
            <p>Starters must be a true PG, SG, SF, PF, and C.</p>
            <p>Bench slots can use any remaining player on the roster.</p>
            <p>Better lineups raise team strength, which improves your simulated win odds across the season.</p>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
