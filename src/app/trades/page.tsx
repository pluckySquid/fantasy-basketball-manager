import { AppShell } from "@/components/app-shell";
import { ExecuteTradeButton } from "@/components/action-forms";
import { MetricCard, PlayerShowcaseCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";

export default async function TradesPage() {
  const snapshot = await getGameSnapshot();

  return (
    <AppShell
      title="Trade Center"
      subtitle="Browse AI-generated swap ideas, compare asset value, and reshape your roster without touching free agency."
    >
      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Tradeable Cap Room"
          value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
          caption="Incoming contracts still have to fit under your salary limit."
        />
        <MetricCard
          label="Chemistry"
          value={String(snapshot.favoriteChemistry.score)}
          caption="Use trades to fix role overlap and weak lineup fit."
        />
        <MetricCard
          label="Live Proposals"
          value={String(snapshot.tradeBoard.length)}
          caption="Fresh ideas built from roster value and cap rules."
        />
      </section>

      <SectionCard title="AI Trade Board">
        <div className="grid gap-5">
          {snapshot.tradeBoard.length === 0 ? (
            <p className="text-sm text-slate-300">No clean one-for-one trades are available right now. Improve cap flexibility or finish the season for roster movement.</p>
          ) : (
            snapshot.tradeBoard.map((proposal) => (
              <article key={proposal.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-violet-200">{proposal.partnerTeam.name}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{proposal.summary}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Value delta: {proposal.delta >= 0 ? "+" : ""}
                      {proposal.delta}
                    </p>
                  </div>
                  <div className="w-full max-w-sm">
                    <ExecuteTradeButton
                      givePlayerId={proposal.givePlayer.id}
                      receivePlayerId={proposal.receivePlayer.id}
                      label={`Trade ${proposal.givePlayer.lastName} for ${proposal.receivePlayer.lastName}`}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  <div className="grid gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">You Send</p>
                    <PlayerShowcaseCard player={proposal.givePlayer} href={`/players/${proposal.givePlayer.id}`} />
                  </div>
                  <div className="grid gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">You Receive</p>
                    <PlayerShowcaseCard player={proposal.receivePlayer} href={`/players/${proposal.receivePlayer.id}`} />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </SectionCard>
    </AppShell>
  );
}
