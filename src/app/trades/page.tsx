import { AppShell } from "@/components/app-shell";
import { ExecuteTradeButton } from "@/components/action-forms";
import { MetricCard, PlayerShowcaseCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale } from "@/lib/i18n";

export default async function TradesPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();

  return (
    <AppShell
      title={t.trades.title}
      subtitle={t.trades.subtitle}
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <MetricCard
          label={t.trades.tradeableCapRoom}
          value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
          caption="Incoming contracts still have to fit under your salary limit."
        />
        <MetricCard
          label={t.trades.chemistry}
          value={String(snapshot.favoriteChemistry.score)}
          caption="Use trades to fix role overlap and weak lineup fit."
        />
        <MetricCard
          label={t.trades.liveProposals}
          value={String(snapshot.tradeBoard.length)}
          caption="Fresh ideas built from roster value and cap rules."
        />
      </section>

      <SectionCard title={t.trades.board}>
        <div className="grid gap-5">
          {snapshot.tradeBoard.length === 0 ? (
            <p className="text-sm text-slate-300">{t.trades.empty}</p>
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
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.trades.send}</p>
                    <PlayerShowcaseCard player={proposal.givePlayer} href={`/players/${proposal.givePlayer.id}`} />
                  </div>
                  <div className="grid gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.trades.receive}</p>
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
