import { AppShell } from "@/components/app-shell";
import { MetricCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale } from "@/lib/i18n";

export default async function StandingsPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();
  const standings = [...snapshot.teams];
  const scoringLeader = snapshot.scoringLeaders[0];
  const assistLeader = snapshot.assistLeaders[0];
  const reboundLeader = snapshot.reboundLeaders[0];

  return (
    <AppShell
      title={t.standings.title}
      subtitle={t.standings.subtitle}
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <section className="mb-5 grid gap-4 lg:grid-cols-3">
        <MetricCard
          label={t.standings.scoringLeader}
          value={scoringLeader ? `${scoringLeader.player.firstName} ${scoringLeader.player.lastName}` : "No games yet"}
          caption={scoringLeader ? `${scoringLeader.ppg.toFixed(1)} PPG | ${scoringLeader.team.abbreviation}` : "Simulate a round to unlock leaders."}
        />
        <MetricCard
          label={t.standings.assistLeader}
          value={assistLeader ? `${assistLeader.player.firstName} ${assistLeader.player.lastName}` : "No games yet"}
          caption={assistLeader ? `${assistLeader.apg.toFixed(1)} APG | ${assistLeader.team.abbreviation}` : "Ball movement crowns this category."}
        />
        <MetricCard
          label={t.standings.reboundLeader}
          value={reboundLeader ? `${reboundLeader.player.firstName} ${reboundLeader.player.lastName}` : "No games yet"}
          caption={reboundLeader ? `${reboundLeader.rpg.toFixed(1)} RPG | ${reboundLeader.team.abbreviation}` : "Interior play starts here."}
        />
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <SectionCard title={t.standings.mvpLadder}>
          <div className="grid gap-3">
            {snapshot.mvpLadder.length === 0 ? (
              <p className="text-sm text-slate-300">No MVP race yet. Simulate the opening round to seed the leaderboard.</p>
            ) : (
              snapshot.mvpLadder.map((entry, index) => (
                <article key={entry.player.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-200">#{index + 1} MVP Candidate</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {entry.player.firstName} {entry.player.lastName}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {entry.team.name} | {entry.ppg.toFixed(1)} PPG | {entry.rpg.toFixed(1)} RPG | {entry.apg.toFixed(1)} APG
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-100">MVP Score</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{entry.mvpScore.toFixed(1)}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title={t.standings.categoryLeaders}>
          <div className="grid gap-4">
            {[
              { label: "Points", rows: snapshot.scoringLeaders, stat: "ppg" as const, suffix: "PPG" },
              { label: "Assists", rows: snapshot.assistLeaders, stat: "apg" as const, suffix: "APG" },
              { label: "Rebounds", rows: snapshot.reboundLeaders, stat: "rpg" as const, suffix: "RPG" },
            ].map((section) => (
              <div key={section.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{section.label}</p>
                <div className="mt-3 grid gap-2">
                  {section.rows.slice(0, 3).map((entry) => (
                    <div key={`${section.label}-${entry.player.id}`} className="flex items-center justify-between text-sm">
                      <p className="text-white">
                        {entry.player.firstName} {entry.player.lastName}
                      </p>
                      <p className="text-slate-300">
                        {entry[section.stat].toFixed(1)} {section.suffix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard title={`${snapshot.profile.season.name} ${t.standings.table}`}>
        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Record</th>
                <th className="px-4 py-3">PF</th>
                <th className="px-4 py-3">PA</th>
                <th className="px-4 py-3">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/60 text-slate-100">
              {standings.map((team, index) => {
                const diff = team.pointsFor - team.pointsAgainst;
                return (
                  <tr key={team.id} className="transition hover:bg-white/5">
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4 font-medium text-white">{team.name}</td>
                    <td className="px-4 py-4">
                      {team.wins}-{team.losses}
                    </td>
                    <td className="px-4 py-4">{team.pointsFor}</td>
                    <td className="px-4 py-4">{team.pointsAgainst}</td>
                    <td className={`px-4 py-4 ${diff >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                      {diff >= 0 ? "+" : ""}
                      {diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
