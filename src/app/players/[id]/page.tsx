import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RatingBar, SectionCard } from "@/components/ui";
import { getPlayerById } from "@/lib/game-state";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerById(id);

  if (!player) {
    notFound();
  }

  return (
    <AppShell
      title={`${player.firstName} ${player.lastName}`}
      subtitle={`Detailed player card for ${player.team.name}. Use this page to inspect role fit, salary, and attribute profile.`}
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <SectionCard title="Player Snapshot">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Profile</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              <p>Position: {player.position}</p>
              <p>Age: {player.age}</p>
              <p>Overall: {player.overall}</p>
              <p>Salary: ${player.salary.toLocaleString()}</p>
              <p>Morale: {player.morale}</p>
              <p>Team: {player.team.abbreviation}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Ratings Breakdown">
          <div className="grid gap-4">
            <RatingBar label="Scoring" value={player.scoring} />
            <RatingBar label="Playmaking" value={player.playmaking} />
            <RatingBar label="Rebounding" value={player.rebounding} />
            <RatingBar label="Defense" value={player.defense} />
            <RatingBar label="Stamina" value={player.stamina} />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
