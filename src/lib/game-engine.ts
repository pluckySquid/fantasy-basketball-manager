import type { MatchState, PlayerState, Position, TeamState, LineupState, LineupSlots } from "./league-models";
import { parseLineupSlots, starterPositionBySlot } from "./league-models";

type TeamWithRoster = TeamState & {
  players: PlayerState[];
  lineup: LineupState | null;
};

export function validateLineup(team: TeamWithRoster, lineup: LineupSlots) {
  const rosterIds = new Set(team.players.map((player) => player.id));
  const selectedIds = Object.values(lineup);

  if (selectedIds.some((id) => !rosterIds.has(id))) {
    return "Every selected player must belong to your roster.";
  }

  if (new Set(selectedIds).size !== selectedIds.length) {
    return "Each lineup slot must use a different player.";
  }

  for (const [slot, expectedPosition] of Object.entries(starterPositionBySlot)) {
    const starter = team.players.find(
      (player) => player.id === lineup[slot as keyof typeof starterPositionBySlot],
    );
    if (!starter || starter.position !== expectedPosition) {
      return `Your ${slot.replace("Id", "").toUpperCase()} starter must play ${expectedPosition}.`;
    }
  }

  return null;
}

function playerImpact(player: PlayerState) {
  return (
    player.overall * 0.38 +
    player.scoring * 0.22 +
    player.playmaking * 0.14 +
    player.rebounding * 0.12 +
    player.defense * 0.1 +
    player.stamina * 0.04
  );
}

export function teamStrength(team: TeamWithRoster) {
  if (!team.lineup) {
    return 0;
  }

  const lineup = parseLineupSlots(team.lineup.slotsJson);
  const starters = Object.keys(starterPositionBySlot).map((slot) =>
    team.players.find((player) => player.id === lineup[slot as keyof typeof starterPositionBySlot]),
  );
  const benchIds = [lineup.benchOneId, lineup.benchTwoId, lineup.benchThreeId];
  const bench = team.players.filter((player) => benchIds.includes(player.id));
  const starterImpact = starters.reduce((sum, player) => sum + (player ? playerImpact(player) : 0), 0);
  const benchImpact = bench.reduce((sum, player) => sum + playerImpact(player) * 0.36, 0);
  const staminaBonus =
    starters.reduce((sum, player) => sum + (player ? player.stamina : 0), 0) / Math.max(starters.length, 1);
  const moraleBonus =
    team.players.reduce((sum, player) => sum + player.morale, 0) / Math.max(team.players.length, 1);
  const staffBonus = team.trainingLevel * 4 + team.medicalLevel * 3 + team.scoutingLevel * 2;

  return starterImpact + benchImpact + staminaBonus * 0.16 + moraleBonus * 0.08 + staffBonus;
}

function randomSwing(size: number) {
  return (Math.random() * 2 - 1) * size;
}

function buildTopPerformer(players: PlayerState[], preferredPositions: Position[]) {
  const sorted = [...players].sort((left, right) => {
    const leftBias = preferredPositions.includes(left.position) ? 8 : 0;
    const rightBias = preferredPositions.includes(right.position) ? 8 : 0;
    return playerImpact(right) + rightBias - (playerImpact(left) + leftBias);
  });
  const player = sorted[0];
  const points = Math.max(10, Math.round(player.scoring * 0.34 + randomSwing(4)));
  const rebounds = Math.max(2, Math.round(player.rebounding * 0.16 + randomSwing(2)));
  const assists = Math.max(1, Math.round(player.playmaking * 0.15 + randomSwing(2)));
  return `${player.firstName} ${player.lastName}: ${points} PTS, ${rebounds} REB, ${assists} AST`;
}

export function simulateMatch(match: MatchState, homeTeam: TeamWithRoster, awayTeam: TeamWithRoster) {
  const homeStrength = teamStrength(homeTeam) * 1.03 + randomSwing(8);
  const awayStrength = teamStrength(awayTeam) + randomSwing(8);
  const pace = 95 + Math.round(Math.random() * 12);
  const homeScore = Math.max(78, Math.round(66 + homeStrength * 0.42 + pace * 0.28));
  const awayScore = Math.max(74, Math.round(64 + awayStrength * 0.42 + pace * 0.26));

  return {
    matchId: match.id,
    homeScore,
    awayScore,
    homeTopPerformer: buildTopPerformer(homeTeam.players, ["SG", "SF", "PG"]),
    awayTopPerformer: buildTopPerformer(awayTeam.players, ["SG", "SF", "PG"]),
    summary:
      homeScore >= awayScore
        ? `${homeTeam.abbreviation} controlled the fourth quarter and defended home court.`
        : `${awayTeam.abbreviation} stole a road win with a stronger late-game push.`,
  };
}
