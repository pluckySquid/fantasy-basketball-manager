import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ResetLeagueButton, SimulateRoundButton } from "@/components/action-forms";
import { MetricCard, SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";

export default async function Home() {
  const snapshot = await getGameSnapshot();
  const record = `${snapshot.favoriteTeam.wins}-${snapshot.favoriteTeam.losses}`;
  const nextRoundLabel =
    snapshot.profile.season.status === "COMPLETE"
      ? "Season complete"
      : `Round ${snapshot.pendingRound} is next`;

  return (
    <AppShell
      title={`${snapshot.favoriteTeam.city} Front Office`}
      subtitle="Run a fictional basketball club through a full season: manage the roster, set the lineup, simulate rounds, and track the table."
    >
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-5">
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Record" value={record} caption="League place updates after each simulated round." />
            <MetricCard label="Team Strength" value={String(snapshot.favoriteTeamStrength)} caption="Weighted from your active lineup, stamina, and morale." />
            <MetricCard label="Season Status" value={nextRoundLabel} caption={`${snapshot.profile.season.name} • ${snapshot.profile.managerName}`} />
          </section>

          <SectionCard title="Recent Results" actionLabel="Full schedule" actionHref="/schedule">
            <div className="grid gap-3">
              {snapshot.recentMatches.length === 0 ? (
                <p className="text-sm text-slate-300">No games played yet. Simulate round 1 to begin the season.</p>
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

          <SectionCard title="Roster Core" actionLabel="View roster" actionHref="/roster">
            <div className="grid gap-3 md:grid-cols-2">
              {snapshot.favoriteTeam.players.slice(0, 4).map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-300/40 hover:bg-white/8"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="text-sm text-slate-300">
                        {player.position} • Age {player.age}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-amber-300/15 px-3 py-2 text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-amber-200">OVR</p>
                      <p className="text-xl font-semibold text-white">{player.overall}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-5">
          <SectionCard title="League Controls">
            <div className="grid gap-4">
              <SimulateRoundButton disabled={snapshot.profile.season.status === "COMPLETE"} />
              <ResetLeagueButton />
            </div>
          </SectionCard>

          <SectionCard title="Next Fixtures">
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

          <SectionCard title="Standings Snapshot" actionLabel="View standings" actionHref="/standings">
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
        </div>
      </div>
    </AppShell>
  );
}
