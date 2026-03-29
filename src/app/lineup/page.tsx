import { AppShell } from "@/components/app-shell";
import { LineupForm } from "@/components/action-forms";
import { MetricCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale, translateChemistryNote } from "@/lib/i18n";

export default async function LineupPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();
  const players = snapshot.favoriteTeam.players.map((player) => ({
    id: player.id,
    fullName: `${player.firstName} ${player.lastName}`,
    position: player.position,
    overall: player.overall,
  }));

  return (
    <AppShell
      title={t.lineup.title}
      subtitle={t.lineup.subtitle}
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <section className="mb-5 grid gap-4 md:grid-cols-3">
        <MetricCard
          label={t.lineup.chemistry}
          value={String(snapshot.favoriteChemistry.score)}
          caption={locale === "zh" ? "角色平衡、首发互补都会提升这个数值。" : "Role balance and complementary starters lift this number."}
        />
        <MetricCard
          label={t.lineup.strength}
          value={String(snapshot.favoriteTeamStrength)}
          caption={locale === "zh" ? "模拟战力已经把化学反应一并计算进去。" : "Chemistry is already included in the sim projection."}
        />
        <MetricCard
          label={t.lineup.payrollRoom}
          value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
          caption={locale === "zh" ? "引入新合同之前，必须先考虑薪资空间。" : "Cap room matters when adding new contracts."}
        />
      </section>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard title={t.lineup.rotationBuilder}>
          <LineupForm
            players={players}
            currentLineup={snapshot.favoriteLineup}
            labels={{
              save: t.actions.saveLineup,
              saving: t.actions.saving,
              fieldLabels:
                locale === "zh"
                  ? ["首发控卫", "首发分卫", "首发小前", "首发大前", "首发中锋", "替补1", "替补2", "替补3"]
                  : undefined,
            }}
          />
        </SectionCard>

        <SectionCard title={t.lineup.quickRules}>
          <div className="space-y-3 text-sm text-slate-300">
            <p>{locale === "zh" ? "首发必须严格对应 PG、SG、SF、PF 和 C 五个位置。" : "Starters must be a true PG, SG, SF, PF, and C."}</p>
            <p>{locale === "zh" ? "替补席可以放入阵中任何剩余球员。" : "Bench slots can use any remaining player on the roster."}</p>
            <p>{locale === "zh" ? "组织点、锋线和内线支柱越平衡，化学反应和球队强度越高。" : "Balanced creators, wings, and interior anchors raise chemistry and team strength."}</p>
            {snapshot.favoriteChemistry.notes.map((note) => (
              <p key={note}>{translateChemistryNote(note, locale)}</p>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
