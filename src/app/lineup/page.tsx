import { AppShell } from "@/components/app-shell";
import { LineupForm } from "@/components/action-forms";
import { MetricCard, SectionCard } from "@/components/ui";
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
      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Chemistry"
          value={String(snapshot.favoriteChemistry.score)}
          caption="Role balance and complementary starters lift this number."
        />
        <MetricCard
          label="Team Strength"
          value={String(snapshot.favoriteTeamStrength)}
          caption="Chemistry is already included in the sim projection."
        />
        <MetricCard
          label="Payroll Room"
          value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
          caption="Cap room matters when adding new contracts."
        />
      </section>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard title="Rotation Builder">
          <LineupForm players={players} currentLineup={snapshot.favoriteLineup} />
        </SectionCard>

        <SectionCard title="Quick Rules">
          <div className="space-y-3 text-sm text-slate-300">
            <p>Starters must be a true PG, SG, SF, PF, and C.</p>
            <p>Bench slots can use any remaining player on the roster.</p>
            <p>Balanced creators, wings, and interior anchors raise chemistry and team strength.</p>
            {snapshot.favoriteChemistry.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
