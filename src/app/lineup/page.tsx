import { AppShell } from "@/components/app-shell";
import { LineupForm } from "@/components/action-forms";
import { MetricCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale } from "@/lib/i18n";

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
          caption="Role balance and complementary starters lift this number."
        />
        <MetricCard
          label={t.lineup.strength}
          value={String(snapshot.favoriteTeamStrength)}
          caption="Chemistry is already included in the sim projection."
        />
        <MetricCard
          label={t.lineup.payrollRoom}
          value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
          caption="Cap room matters when adding new contracts."
        />
      </section>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard title={t.lineup.rotationBuilder}>
          <LineupForm players={players} currentLineup={snapshot.favoriteLineup} />
        </SectionCard>

        <SectionCard title={t.lineup.quickRules}>
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
