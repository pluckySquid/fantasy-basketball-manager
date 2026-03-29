import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ExtendContractButton, SellPlayerButton } from "@/components/action-forms";
import { MetricCard, PlayerShowcaseCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale } from "@/lib/i18n";

export default async function RosterPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();

  return (
    <AppShell
      title={t.roster.title}
      subtitle={t.roster.subtitle}
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <MetricCard
          label={t.roster.payroll}
          value={`$${snapshot.favoritePayroll.toLocaleString()}`}
          caption={t.common.rosterPayrollCaption}
        />
        <MetricCard
          label={t.roster.averageOvr}
          value={String(Math.round(snapshot.favoriteTeam.players.reduce((sum, player) => sum + player.overall, 0) / snapshot.favoriteTeam.players.length))}
          caption={t.common.rosterAverageCaption}
        />
        <MetricCard
          label={t.roster.topPlayer}
          value={`${snapshot.favoriteTeam.players[0].firstName} ${snapshot.favoriteTeam.players[0].lastName}`}
          caption={t.common.rosterTopPlayerCaption}
        />
        <MetricCard
          label={t.roster.capRoom}
          value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
          caption={`${t.common.rosterBudgetCaption}: $${snapshot.favoriteTeam.budget.toLocaleString()}`}
        />
        <MetricCard
          label={t.roster.chemistry}
          value={String(snapshot.favoriteChemistry.score)}
          caption={snapshot.favoriteChemistry.notes[0] ?? t.common.rosterChemistryCaption}
        />
      </section>

      <SectionCard title={`${snapshot.favoriteTeam.name} ${t.roster.cards}`}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.favoriteTeam.players.map((player) => (
            <div key={player.id} className="grid gap-3">
              <PlayerShowcaseCard player={player} href={`/players/${player.id}`} locale={locale} />
              <SellPlayerButton
                playerId={player.id}
                value={Math.round(player.salary * 0.75 + player.overall * 12)}
                labels={{
                  idle: t.actions.sellFor,
                  pending: locale === "zh" ? "出售中..." : "Selling...",
                }}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t.roster.contractDesk}>
        <div className="grid gap-4 lg:grid-cols-2">
          {snapshot.expiringContracts.length === 0 ? (
            <p className="text-sm text-slate-300">{t.roster.contractEmpty}</p>
          ) : (
            snapshot.expiringContracts.map((player) => (
              <article key={`contract-${player.id}`} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {player.position} | {t.common.ovrShort} {player.overall} | {player.contractYears} {t.common.contractRemaining}
                    </p>
                  </div>
                  <div className="rounded-full border border-amber-300/25 bg-amber-300/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
                    {t.roster.actionNeeded}
                  </div>
                </div>
                <div className="mt-4">
                  <ExtendContractButton
                    playerId={player.id}
                    cost={player.extensionCost}
                    labels={{
                      idle: t.actions.extendContract,
                      pending: t.actions.negotiating,
                    }}
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard title={t.roster.tableView}>
        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">{t.common.player}</th>
                <th className="px-4 py-3">{t.common.position}</th>
                <th className="px-4 py-3">{t.common.ovrShort}</th>
                <th className="px-4 py-3">{t.common.scoring}</th>
                <th className="px-4 py-3">{t.common.playmaking}</th>
                <th className="px-4 py-3">{t.common.rebounding}</th>
                <th className="px-4 py-3">{t.common.defense}</th>
                <th className="px-4 py-3">{t.roster.contract}</th>
                <th className="px-4 py-3">{t.roster.salary}</th>
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
                  <td className="px-4 py-4">{player.contractYears}{locale === "zh" ? "年" : "Y"}</td>
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
