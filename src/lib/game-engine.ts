import type { MatchState, PlayerState, Position, TeamState, LineupState, LineupSlots } from "./league-models";
import { parseLineupSlots, starterPositionBySlot } from "./league-models";

type TeamWithRoster = TeamState & {
  players: PlayerState[];
  lineup: LineupState | null;
};

export function getPayroll(team: TeamWithRoster) {
  return team.players.reduce((sum, player) => sum + player.salary, 0);
}

export function analyzeLineupChemistry(team: TeamWithRoster) {
  if (!team.lineup) {
    return { score: 0, notes: ["No lineup configured."] };
  }

  const lineup = parseLineupSlots(team.lineup.slotsJson);
  const starters = Object.keys(starterPositionBySlot)
    .map((slot) => team.players.find((player) => player.id === lineup[slot as keyof typeof starterPositionBySlot]))
    .filter((player): player is PlayerState => Boolean(player));

  const notes: string[] = [];
  let score = 58;
  const positions = new Set(starters.map((player) => player.position));
  const twoWayCount = starters.filter((player) => player.defense >= 84 && player.scoring >= 82).length;
  const creators = starters.filter((player) => player.playmaking >= 85 || player.position === "PG").length;
  const rimPresence = starters.some((player) => player.position === "C" && (player.rebounding >= 86 || player.defense >= 86));
  const slashers = starters.filter((player) => player.archetype === "Athletic Slasher").length;
  const spacers = starters.filter((player) => player.scoring >= 88 && player.position !== "C").length;
  const archetypeVariety = new Set(starters.map((player) => player.archetype)).size;

  if (positions.size === 5) {
    score += 8;
    notes.push("Natural starter positions are filled.");
  } else {
    score -= 8;
    notes.push("Starter role overlap hurts spacing and balance.");
  }

  if (creators >= 2) {
    score += 7;
    notes.push("Multiple creators keep the offense flowing.");
  } else {
    score -= 5;
    notes.push("Only one reliable creator in the first unit.");
  }

  if (rimPresence) {
    score += 7;
    notes.push("Interior anchor stabilizes defense and rebounding.");
  } else {
    score -= 6;
    notes.push("No true interior anchor in the lineup.");
  }

  if (twoWayCount >= 2) {
    score += 6;
    notes.push("Two-way wings improve matchup flexibility.");
  }

  if (slashers > 0 && spacers > 1) {
    score += 5;
    notes.push("Slashing and spacing complement each other well.");
  }

  if (archetypeVariety >= 4) {
    score += 5;
    notes.push("The starters bring a healthy mix of roles.");
  } else {
    score -= 4;
    notes.push("Too many starters share the same role profile.");
  }

  return { score: Math.max(40, Math.min(99, score)), notes: notes.slice(0, 3) };
}

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
  const chemistry = analyzeLineupChemistry(team).score;
  const payrollPressure = Math.max(0, getPayroll(team) - team.budget);
  const contractStability =
    team.players.reduce((sum, player) => sum + Math.min(player.contractYears, 3), 0) / Math.max(team.players.length, 1);

  return (
    starterImpact +
    benchImpact +
    staminaBonus * 0.16 +
    moraleBonus * 0.08 +
    staffBonus +
    chemistry * 0.9 +
    contractStability * 3 -
    payrollPressure * 0.015
  );
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
