import { AppShell } from "@/components/app-shell";
import { SignPlayerButton } from "@/components/action-forms";
import { MetricCard, PlayerShowcaseCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";

export default async function MarketPage() {
  const snapshot = await getGameSnapshot();

  return (
    <AppShell
      title="Transfer Market"
      subtitle="Scout free agents, compare rarities and archetypes, and spend credits to strengthen your squad."
    >
      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Club Credits"
          value={String(snapshot.profile.credits)}
          caption="Use credits to sign free agents and train your roster."
        />
        <MetricCard
          label="Open Slots"
          value={String(Math.max(0, 12 - snapshot.favoriteTeam.players.length))}
          caption="You can carry up to 12 players in this MVP."
        />
        <MetricCard
          label="Scouting Level"
          value={String(snapshot.favoriteTeam.scoutingLevel)}
          caption="Higher scouting makes it easier to build a deeper roster."
        />
      </section>

      <SectionCard title="Available Free Agents">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.marketPlayers.map((player) => {
            const price = player.salary + snapshot.favoriteTeam.scoutingLevel * 80;
            return (
              <div key={player.id} className="grid gap-3">
                <PlayerShowcaseCard player={player} href={`/players/${player.id}`} />
                <SignPlayerButton playerId={player.id} price={price} />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </AppShell>
  );
}
