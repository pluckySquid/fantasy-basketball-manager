import { AppShell } from "@/components/app-shell";
import { ExecuteTradeButton } from "@/components/action-forms";
import { MetricCard, PlayerShowcaseCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale, translateChemistryNote } from "@/lib/i18n";

function translateTradeSummary(summary: string, locale: "en" | "zh") {
  if (locale === "en") {
    return summary;
  }

  return summary
    .replace(/^([A-Z]{2,4}) is open to a talent-upside swap if you move (.+)\.$/, "$1 愿意接受一笔更看重潜力的交易，只要你送出 $2。")
    .replace(/^([A-Z]{2,4}) will take your cheaper piece to balance roles and salary\.$/, "$1 愿意接手你薪资更低的球员，以平衡阵容角色和薪资结构。");
}

export default async function TradesPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();
  const labels =
    locale === "zh"
      ? {
          capCaption: "新加入的合同仍然必须符合你的薪资限制。",
          chemistryCaption: "通过交易修正角色重叠和阵容适配问题。",
          proposalCaption: "这些方案会根据阵容价值和工资帽规则实时生成。",
          valueDelta: "价值差",
          tradeFor: "交易",
          swapWord: "换",
          rankFitFallback: "化学反应调整中",
        }
      : {
          capCaption: "Incoming contracts still have to fit under your salary limit.",
          chemistryCaption: "Use trades to fix role overlap and weak lineup fit.",
          proposalCaption: "Fresh ideas built from roster value and cap rules.",
          valueDelta: "Value delta",
          tradeFor: "Trade",
          swapWord: "for",
          rankFitFallback: "Lineup fit still evolving",
        };

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
          caption={labels.capCaption}
        />
        <MetricCard
          label={t.trades.chemistry}
          value={String(snapshot.favoriteChemistry.score)}
          caption={snapshot.favoriteChemistry.notes[0] ? translateChemistryNote(snapshot.favoriteChemistry.notes[0], locale) : labels.chemistryCaption}
        />
        <MetricCard
          label={t.trades.liveProposals}
          value={String(snapshot.tradeBoard.length)}
          caption={labels.proposalCaption}
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
                    <p className="mt-2 text-lg font-semibold text-white">{translateTradeSummary(proposal.summary, locale)}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {labels.valueDelta}: {proposal.delta >= 0 ? "+" : ""}
                      {proposal.delta}
                    </p>
                  </div>
                  <div className="w-full max-w-sm">
                    <ExecuteTradeButton
                      givePlayerId={proposal.givePlayer.id}
                      receivePlayerId={proposal.receivePlayer.id}
                      label={`${labels.tradeFor} ${proposal.givePlayer.lastName} ${labels.swapWord} ${proposal.receivePlayer.lastName}`}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  <div className="grid gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.trades.send}</p>
                    <PlayerShowcaseCard player={proposal.givePlayer} href={`/players/${proposal.givePlayer.id}`} locale={locale} />
                  </div>
                  <div className="grid gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t.trades.receive}</p>
                    <PlayerShowcaseCard player={proposal.receivePlayer} href={`/players/${proposal.receivePlayer.id}`} locale={locale} />
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
