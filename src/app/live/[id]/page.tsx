import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LiveMatchBroadcast } from "@/components/live-match-broadcast";
import { getGameSnapshot } from "@/lib/game-state";
import { buildNav, copy, getLocale } from "@/lib/i18n";
import { parseLineupSlots } from "@/lib/league-models";

function buildQuarterLines(homeScore: number, awayScore: number) {
  const weights = [0.22, 0.26, 0.24, 0.28];
  const homeBase = weights.slice(0, 3).map((weight) => Math.round(homeScore * weight));
  const awayBase = weights.slice(0, 3).map((weight) => Math.round(awayScore * weight));

  return {
    home: [...homeBase, homeScore - homeBase.reduce((sum, value) => sum + value, 0)],
    away: [...awayBase, awayScore - awayBase.reduce((sum, value) => sum + value, 0)],
  };
}

export default async function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const t = copy[locale];
  const snapshot = await getGameSnapshot();
  const match = snapshot.matches.find((entry) => entry.id === id);

  if (!match || !match.played || match.homeScore === null || match.awayScore === null) {
    notFound();
  }

  const homeTeam = snapshot.teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = snapshot.teams.find((team) => team.id === match.awayTeamId);

  if (!homeTeam || !awayTeam || !homeTeam.lineup || !awayTeam.lineup) {
    notFound();
  }

  const homeLineup = parseLineupSlots(homeTeam.lineup.slotsJson);
  const awayLineup = parseLineupSlots(awayTeam.lineup.slotsJson);
  const quarterLines = buildQuarterLines(match.homeScore, match.awayScore);
  const favoriteInvolved =
    snapshot.profile.favoriteTeamId === homeTeam.id || snapshot.profile.favoriteTeamId === awayTeam.id;
  const controlSide =
    snapshot.profile.favoriteTeamId === awayTeam.id ? "away" : favoriteInvolved ? "home" : "home";

  const mapTeam = (
    team: typeof homeTeam,
    lineup: typeof homeLineup,
  ) => ({
    id: team.id,
    name: team.name,
    abbreviation: team.abbreviation,
    players: team.players.map((player) => ({
      id: player.id,
      name: `${player.firstName} ${player.lastName}`,
      position: player.position,
      overall: player.overall,
      scoring: player.scoring,
      playmaking: player.playmaking,
      rebounding: player.rebounding,
      defense: player.defense,
      stamina: player.stamina,
    })),
    starters: [lineup.pgId, lineup.sgId, lineup.sfId, lineup.pfId, lineup.cId],
    bench: [lineup.benchOneId, lineup.benchTwoId, lineup.benchThreeId],
  });

  return (
    <AppShell
      title={locale === "zh" ? "比赛直播" : "Live Match"}
      subtitle={
        locale === "zh"
          ? "这是可交互的比赛直播第一版：比赛会自动推进，你可以暂停、换人、调整战术，并观察体力消耗。"
          : "First interactive live-match build: the game advances automatically while you pause, substitute, switch tactics, and track stamina."
      }
      locale={locale}
      nav={buildNav(locale)}
      languageLabels={t.language}
      appName={t.appName}
    >
      <LiveMatchBroadcast
        locale={locale}
        homeTeam={mapTeam(homeTeam, homeLineup)}
        awayTeam={mapTeam(awayTeam, awayLineup)}
        quarterLines={quarterLines}
        controlSide={controlSide}
      />
    </AppShell>
  );
}
