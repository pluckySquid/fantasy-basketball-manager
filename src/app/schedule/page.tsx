import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/ui";
import { getGameSnapshot } from "@/lib/game-state";

export default async function SchedulePage() {
  const snapshot = await getGameSnapshot();
  const grouped = snapshot.matches.reduce(
    (result, match) => {
      const key = String(match.round);
      result[key] ??= [];
      result[key].push(match);
      return result;
    },
    {} as Record<string, typeof snapshot.matches>,
  );

  return (
    <AppShell
      title="Schedule and Results"
      subtitle="Track every round, spot the fixtures still ahead, and review simulated results with top-performer summaries."
    >
      <div className="grid gap-5">
        {Object.entries(grouped).map(([round, matches]) => (
          <SectionCard key={round} title={`Round ${round}`}>
            <div className="grid gap-3">
              {matches.map((match) => (
                <article key={match.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-white">
                      {match.awayTeam.abbreviation}
                      {match.played ? ` ${match.awayScore}` : ""} at {match.homeTeam.abbreviation}
                      {match.played ? ` ${match.homeScore}` : ""}
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {match.played ? "Final" : "Upcoming"}
                    </p>
                  </div>
                  {match.played ? (
                    <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
                      <p>{match.summary}</p>
                      <p>{match.homeTopPerformer}</p>
                      <p>{match.awayTopPerformer}</p>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </AppShell>
  );
}
