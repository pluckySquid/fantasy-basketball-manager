import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TrainPlayerForm } from "@/components/action-forms";
import { PlayerPortrait, RatingBar, SectionCard } from "@/components/ui";
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
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))] p-5">
            <PlayerPortrait
              name={`${player.firstName} ${player.lastName}`}
              rarity={player.rarity}
              className="mb-5 h-64 w-full"
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Profile</p>
                <p className="mt-3 text-3xl font-semibold text-white">{player.overall}</p>
                <p className="text-sm text-slate-300">Overall rating</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                {player.rarity} | {player.archetype}
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
              <p>Position: {player.position}</p>
              <p>Age: {player.age}</p>
              <p>Overall: {player.overall}</p>
              <p>Salary: ${player.salary.toLocaleString()}</p>
              <p>Morale: {player.morale}</p>
              <p>Team: {player.team.abbreviation}</p>
              <p>Potential: {player.potential}</p>
              <p>Archetype: {player.archetype}</p>
            </div>
            <div className="mt-5 grid gap-3 rounded-[20px] border border-white/10 bg-slate-950/55 p-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Games</p>
                <p className="mt-1 text-xl font-semibold text-white">{player.seasonStats.games}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">PPG</p>
                <p className="mt-1 text-xl font-semibold text-white">{player.seasonStats.ppg.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">RPG</p>
                <p className="mt-1 text-xl font-semibold text-white">{player.seasonStats.rpg.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">APG</p>
                <p className="mt-1 text-xl font-semibold text-white">{player.seasonStats.apg.toFixed(1)}</p>
              </div>
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
            <RatingBar label="Potential" value={player.potential} />
          </div>
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <SectionCard title="Card Notes">
          <div className="space-y-3 text-sm text-slate-300">
            <p>{player.firstName} is tagged as a {player.archetype.toLowerCase()} and carries {player.rarity.toLowerCase()} card status in this MVP.</p>
            <p>Training raises one key attribute at a time and can push the overall rating toward the player&apos;s potential cap.</p>
            <p>High-morale players hold their value better and contribute more consistently during season simulations.</p>
          </div>
        </SectionCard>

        <SectionCard title="Training Facility">
          <TrainPlayerForm playerId={player.id} />
        </SectionCard>
      </div>
    </AppShell>
  );
}
