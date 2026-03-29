import { AppShell } from "@/components/app-shell";
import { OpenPackButton, SignPlayerButton } from "@/components/action-forms";
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
        <MetricCard
          label="Reserve Pool"
          value={String(snapshot.reserveCount)}
          caption="Pack inventory still waiting in the hidden reserve pool."
        />
        <MetricCard
          label="Cap Room"
          value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
          caption={`You cannot sign players if salary pushes payroll over $${snapshot.favoriteTeam.budget.toLocaleString()}.`}
        />
      </section>

      <SectionCard title="Card Packs">
        <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[24px] border border-cyan-300/20 bg-[linear-gradient(160deg,rgba(34,211,238,0.18),rgba(255,255,255,0.04))] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">Standard Pack</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Roster Booster</h3>
            <p className="mt-2 text-sm text-slate-200">
              A cheaper way to add fresh talent. Good for depth and rotation upgrades.
            </p>
            <div className="mt-5">
              <OpenPackButton packType="standard" label="Open Standard Pack" cost={260} />
            </div>
          </article>

          <article className="rounded-[24px] border border-amber-300/20 bg-[linear-gradient(160deg,rgba(251,191,36,0.18),rgba(255,255,255,0.04))] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-100">Elite Pack</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Premium Drop</h3>
            <p className="mt-2 text-sm text-slate-200">
              Better odds at top-end cards and higher immediate upside for your club.
            </p>
            <div className="mt-5">
              <OpenPackButton packType="elite" label="Open Elite Pack" cost={520} />
            </div>
          </article>
          </div>

          <article className="card-reveal rounded-[24px] border border-white/10 bg-[linear-gradient(155deg,rgba(250,204,21,0.16),rgba(34,211,238,0.1),rgba(15,23,42,0.95))] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Latest Reveal</p>
            {snapshot.lastPackReveal?.player ? (
              <div className="mt-4 grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                  <p className="text-sm text-slate-300">
                    {snapshot.lastPackReveal.packType === "elite" ? "Elite drop" : "Standard drop"} opened on{" "}
                    {new Date(snapshot.lastPackReveal.openedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <PlayerShowcaseCard
                  player={snapshot.lastPackReveal.player}
                  href={`/players/${snapshot.lastPackReveal.player.id}`}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/50 p-5 text-sm text-slate-300">
                Open your first pack to reveal a new card here.
              </div>
            )}
          </article>
        </div>
      </SectionCard>

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
