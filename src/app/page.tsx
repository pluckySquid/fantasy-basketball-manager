import { AppShell } from "@/components/app-shell";
import { ResetLeagueButton, SimulateRoundButton, StaffUpgradeButton, StartNextSeasonButton } from "@/components/action-forms";
import { MetricCard, PlayerShowcaseCard, SectionCard } from "@/components/ui";
import { getGameSnapshot, getStaffDepartments } from "@/lib/game-state";
import { buildNav, copy, getLocale } from "@/lib/i18n";

export default async function Home() {
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();
  const record = `${snapshot.favoriteTeam.wins}-${snapshot.favoriteTeam.losses}`;
  const nextRoundLabel =
    snapshot.profile.season.status === "COMPLETE"
      ? "Season complete"
      : `Round ${snapshot.pendingRound} is next`;
  const staffDepartments = getStaffDepartments(snapshot.favoriteTeam);

  return (
    <AppShell
      title={`${snapshot.favoriteTeam.city} ${t.home.titleSuffix}`}
      subtitle={t.home.subtitle}
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-5">
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label={t.home.record} value={record} caption="League place updates after each simulated round." />
            <MetricCard label={t.home.strength} value={String(snapshot.favoriteTeamStrength)} caption="Weighted from your active lineup, stamina, and morale." />
            <MetricCard label={t.home.credits} value={String(snapshot.profile.credits)} caption={`${snapshot.profile.season.name} | ${snapshot.profile.managerName} | ${nextRoundLabel}`} />
            <MetricCard
              label={t.home.chemistry}
              value={`${snapshot.favoriteChemistry.score}`}
              caption={snapshot.favoriteChemistry.notes[0] ?? "Build a balanced starting five."}
            />
            <MetricCard
              label={t.home.payrollRoom}
              value={`${snapshot.favoriteCapRoom >= 0 ? "+" : ""}$${snapshot.favoriteCapRoom.toLocaleString()}`}
              caption={`Cap line: $${snapshot.favoriteTeam.budget.toLocaleString()} | Payroll: $${snapshot.favoritePayroll.toLocaleString()}`}
            />
          </section>

          <SectionCard title={t.home.recentResults} actionLabel={t.home.fullSchedule} actionHref="/schedule">
            <div className="grid gap-3">
              {snapshot.recentMatches.length === 0 ? (
                <p className="text-sm text-slate-300">{t.home.noGames}</p>
              ) : (
                snapshot.recentMatches.map((match) => (
                  <article key={match.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-white">
                        Round {match.round}: {match.awayTeam.abbreviation} {match.awayScore} at {match.homeTeam.abbreviation} {match.homeScore}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{match.summary}</p>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                      <p>{match.homeTopPerformer}</p>
                      <p>{match.awayTopPerformer}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="League News" actionLabel={t.nav.trades} actionHref="/trades">
            <div className="grid gap-3">
              {snapshot.newsFeed.map((item) => (
                <article key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                  {item}
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t.home.rosterCore} actionLabel={t.home.viewRoster} actionHref="/roster">
            <div className="grid gap-3 md:grid-cols-2">
              {snapshot.favoriteTeam.players.slice(0, 4).map((player) => (
                <PlayerShowcaseCard key={player.id} player={player} href={`/players/${player.id}`} />
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-5">
          <SectionCard title={t.home.leagueControls}>
            <div className="grid gap-4">
              <SimulateRoundButton disabled={snapshot.profile.season.status === "COMPLETE"} />
              <StartNextSeasonButton disabled={snapshot.profile.season.status !== "COMPLETE"} />
              <ResetLeagueButton />
            </div>
          </SectionCard>

          {snapshot.profile.season.status === "COMPLETE" ? (
            <SectionCard title={t.home.seasonComplete}>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  Champion: {snapshot.seasonAwards.champion?.name ?? "TBD"}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  MVP: {snapshot.seasonAwards.mvp ? `${snapshot.seasonAwards.mvp.player.firstName} ${snapshot.seasonAwards.mvp.player.lastName}` : "TBD"}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  Renew expiring deals, then roll into the next campaign with a fresh schedule and updated contracts.
                </div>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title={t.home.clubStaff}>
            <div className="grid gap-4">
              {staffDepartments.map((department) => (
                <article key={department.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{department.label}</p>
                      <p className="mt-1 text-sm text-slate-300">Level {department.level}</p>
                      <p className="mt-2 text-sm text-slate-400">{department.impact}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <StaffUpgradeButton
                      department={department.key}
                      label={department.label}
                      cost={department.cost}
                    />
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t.home.chemistryNotes} actionLabel={t.home.tuneLineup} actionHref="/lineup">
            <div className="grid gap-3">
              {snapshot.favoriteChemistry.notes.map((note) => (
                <div key={note} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {note}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t.home.nextFixtures}>
            <div className="grid gap-3">
              {snapshot.nextMatches.map((match) => (
                <article key={match.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">Round {match.round}</p>
                  <p className="mt-2">
                    {match.awayTeam.name} at {match.homeTeam.name}
                  </p>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t.home.standingsSnapshot} actionLabel={t.home.viewStandings} actionHref="/standings">
            <div className="space-y-3">
              {snapshot.teams.slice(0, 5).map((team, index) => (
                <div key={team.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <p className="text-white">
                    {index + 1}. {team.name}
                  </p>
                  <p className="text-slate-300">
                    {team.wins}-{team.losses}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={t.home.franchiseHistory} actionLabel={t.home.fullAwards} actionHref="/stats">
            <div className="grid gap-3">
              {snapshot.seasonHistory.length === 0 ? (
                <p className="text-sm text-slate-300">{t.home.historyEmpty}</p>
              ) : (
                snapshot.seasonHistory.slice(0, 3).map((entry) => (
                  <div key={entry.seasonId} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <p className="font-semibold text-white">{entry.seasonName}</p>
                    <p className="mt-1 text-slate-300">Champion: {entry.championTeamName}</p>
                    <p className="mt-1 text-slate-300">Your record: {entry.favoriteTeamRecord}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
