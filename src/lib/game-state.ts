import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { simulateMatch, teamStrength, validateLineup } from "./game-engine";
import {
  lineupOrder,
  parseLineupSlots,
  stringifyLineupSlots,
  type LeagueState,
  type LineupSlotKey,
  type LineupSlots,
  type PlayerState,
  type Position,
} from "./league-models";

const statePath = resolve(process.cwd(), "data", "league-state.json");

const firstNames = ["Mason", "Julian", "Theo", "Noah", "Kai", "Elliot", "Roman", "Miles", "Luca", "Grant", "Owen", "Jaylen", "Caleb", "Evan", "Felix", "Nico"];
const lastNames = ["Carter", "Vance", "Brooks", "Mercer", "Hayes", "Bennett", "Porter", "Wells", "Sutton", "Reed", "Cross", "Coleman", "Foster", "Quinn", "Maddox", "Sawyer"];
const teamBlueprint = [
  ["Lakeview", "Falcons", "LVF"],
  ["Northport", "Pilots", "NPP"],
  ["Goldhaven", "Comets", "GHC"],
  ["Redwood", "Forge", "RWF"],
  ["Riverton", "Kings", "RVK"],
  ["Summit", "Storm", "SMS"],
  ["Harbor", "Sharks", "HBS"],
  ["Westfield", "Volt", "WFV"],
] as const;
const rosterBlueprint: Position[] = ["PG", "SG", "SF", "PF", "C", "PG", "SF", "PF"];

function valueAround(base: number, variance: number) {
  const delta = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
  return Math.max(48, Math.min(99, base + delta));
}

function generatePlayer(teamIndex: number, rosterIndex: number, position: Position, teamId: string): PlayerState {
  const base = 67 + Math.floor(Math.random() * 14) + (rosterIndex < 5 ? 4 : 0) + (teamIndex === 0 ? 2 : 0);
  const scoringBias = position === "SG" || position === "SF" ? 4 : 0;
  const playmakingBias = position === "PG" ? 6 : 0;
  const reboundingBias = position === "PF" || position === "C" ? 6 : 0;
  const defenseBias = rosterIndex % 2 === 0 ? 3 : 0;
  const overall = valueAround(base, 5);
  const scoring = valueAround(base + scoringBias, 8);
  const playmaking = valueAround(base + playmakingBias, 9);
  const rebounding = valueAround(base + reboundingBias, 7);
  const defense = valueAround(base + defenseBias, 7);

  const archetype =
    Math.max(scoring, playmaking, rebounding, defense) === playmaking
      ? "Floor General"
      : Math.max(scoring, playmaking, rebounding, defense) === defense
        ? "Lockdown Wing"
        : Math.max(scoring, playmaking, rebounding, defense) === rebounding
          ? "Glass Cleaner"
          : "Shot Creator";
  const rarity =
    overall >= 88 ? "Platinum" : overall >= 82 ? "Gold" : overall >= 75 ? "Silver" : "Bronze";

  return {
    id: randomUUID(),
    teamId,
    firstName: firstNames[(teamIndex * 2 + rosterIndex) % firstNames.length],
    lastName: lastNames[(teamIndex * 3 + rosterIndex) % lastNames.length],
    age: 20 + ((teamIndex + rosterIndex) % 12),
    position,
    overall,
    scoring,
    playmaking,
    rebounding,
    defense,
    stamina: valueAround(base + 2, 6),
    salary: 650 + base * 18 + rosterIndex * 20,
    morale: valueAround(74, 10),
    rarity,
    archetype,
    potential: Math.max(overall + 2, valueAround(base + 8, 6)),
  };
}

function buildDefaultLineup(playerIds: string[]): LineupSlots {
  return {
    pgId: playerIds[0],
    sgId: playerIds[1],
    sfId: playerIds[2],
    pfId: playerIds[3],
    cId: playerIds[4],
    benchOneId: playerIds[5],
    benchTwoId: playerIds[6],
    benchThreeId: playerIds[7],
  };
}

function buildSchedule(teamIds: string[]) {
  const rotation = [...teamIds];
  const rounds: Array<Array<{ homeTeamId: string; awayTeamId: string }>> = [];

  for (let round = 0; round < rotation.length - 1; round += 1) {
    const fixtures = [];
    for (let index = 0; index < rotation.length / 2; index += 1) {
      const home = rotation[index];
      const away = rotation[rotation.length - 1 - index];
      fixtures.push(round % 2 === 0 ? { homeTeamId: home, awayTeamId: away } : { homeTeamId: away, awayTeamId: home });
    }
    rounds.push(fixtures);

    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop()!);
    rotation.splice(0, rotation.length, fixed, ...rest);
  }

  return [...rounds, ...rounds.map((fixtures) => fixtures.map((fixture) => ({ homeTeamId: fixture.awayTeamId, awayTeamId: fixture.homeTeamId })))];
}

function buildInitialState(): LeagueState {
  const seasonId = randomUUID();
  const teams = teamBlueprint.map(([city, nickname, abbreviation]) => ({
    id: randomUUID(),
    city,
    name: `${city} ${nickname}`,
    abbreviation,
    budget: 18000,
    trainingLevel: 1,
    medicalLevel: 1,
    scoutingLevel: 1,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
  }));

  const players = teams.flatMap((team, teamIndex) =>
    rosterBlueprint.map((position, rosterIndex) => generatePlayer(teamIndex, rosterIndex, position, team.id)),
  );
  const marketPlayers = Array.from({ length: 12 }, (_, index) =>
    generatePlayer(teams.length + index, index % rosterBlueprint.length, rosterBlueprint[index % rosterBlueprint.length], "MARKET"),
  ).map((player, index) => ({
    ...player,
    teamId: "MARKET",
    salary: player.salary + 150,
    potential: Math.max(player.potential, player.overall + 4 + (index % 4)),
  }));

  const lineups = teams.map((team) => {
    const roster = players.filter((player) => player.teamId === team.id);
    return {
      id: randomUUID(),
      teamId: team.id,
      slotsJson: stringifyLineupSlots(buildDefaultLineup(roster.map((player) => player.id))),
    };
  });

  const matches = buildSchedule(teams.map((team) => team.id)).flatMap((fixtures, roundIndex) =>
    fixtures.map((fixture) => ({
      id: randomUUID(),
      seasonId,
      round: roundIndex + 1,
      homeTeamId: fixture.homeTeamId,
      awayTeamId: fixture.awayTeamId,
      played: false,
      homeScore: null,
      awayScore: null,
      homeTopPerformer: null,
      awayTopPerformer: null,
      summary: null,
    })),
  );

  return {
    season: { id: seasonId, name: "Fictional League Season 1", currentRound: 1, totalRounds: 14, status: "IN_PROGRESS" },
    profile: { id: randomUUID(), managerName: "Solo Manager", favoriteTeamId: teams[0].id, seasonId, credits: 1200 },
    teams,
    players,
    marketPlayers,
    lineups,
    matches,
  };
}

async function writeLeagueState(state: LeagueState) {
  await mkdir(resolve(process.cwd(), "data"), { recursive: true });
  await writeFile(statePath, JSON.stringify(state, null, 2), "utf8");
}

async function readLeagueState() {
  const raw = await readFile(statePath, "utf8");
  return JSON.parse(raw) as LeagueState;
}

function enrichTeam(state: LeagueState, teamId: string) {
  const team = state.teams.find((entry) => entry.id === teamId)!;
  return {
    ...team,
    players: state.players
      .filter((player) => player.teamId === teamId)
      .sort((left, right) => right.overall - left.overall || left.lastName.localeCompare(right.lastName)),
    lineup: state.lineups.find((lineup) => lineup.teamId === teamId) ?? null,
  };
}

export async function resetLeague() {
  const state = buildInitialState();
  await writeLeagueState(state);
  return { ok: true as const, message: "League reset with a fresh fictional season." };
}

export async function ensureLeagueReady() {
  try {
    const state = await readLeagueState();
    const favoriteTeam = state.teams[0];
    if (
      state.profile.credits === undefined ||
      favoriteTeam?.trainingLevel === undefined ||
      favoriteTeam?.medicalLevel === undefined ||
      favoriteTeam?.scoutingLevel === undefined ||
      state.marketPlayers === undefined ||
      state.players[0]?.rarity === undefined ||
      state.players[0]?.archetype === undefined ||
      state.players[0]?.potential === undefined
    ) {
      await resetLeague();
    }
  } catch {
    await resetLeague();
  }
}

export async function getGameSnapshot() {
  await ensureLeagueReady();
  const state = await readLeagueState();
  const favoriteTeam = enrichTeam(state, state.profile.favoriteTeamId);
  const teams = state.teams.map((team) => enrichTeam(state, team.id));
  const matches = state.matches
    .map((match) => ({
      ...match,
      homeTeam: state.teams.find((team) => team.id === match.homeTeamId)!,
      awayTeam: state.teams.find((team) => team.id === match.awayTeamId)!,
    }))
    .sort((left, right) => left.round - right.round);

  return {
    profile: { ...state.profile, season: state.season },
    favoriteTeam,
    favoriteLineup: parseLineupSlots(favoriteTeam.lineup!.slotsJson),
    favoriteTeamStrength: Math.round(teamStrength(favoriteTeam)),
    teams,
    matches,
    pendingRound: matches.find((match) => !match.played)?.round ?? state.season.totalRounds,
    recentMatches: matches.filter((match) => match.played).slice(-5).reverse(),
    nextMatches: matches.filter((match) => !match.played).slice(0, 4),
    marketPlayers: [...state.marketPlayers].sort((left, right) => right.overall - left.overall),
  };
}

function staffUpgradeCost(level: number) {
  return 300 + level * 220;
}

export async function saveFavoriteLineup(formData: FormData) {
  await ensureLeagueReady();
  const state = await readLeagueState();
  const favoriteTeam = enrichTeam(state, state.profile.favoriteTeamId);
  const lineup = lineupOrder.reduce((result, slot) => {
    result[slot] = String(formData.get(slot) ?? "");
    return result;
  }, {} as Record<LineupSlotKey, string>) as LineupSlots;
  const validationError = validateLineup(favoriteTeam, lineup);

  if (validationError) {
    return { ok: false as const, message: validationError };
  }

  state.lineups = state.lineups.map((entry) =>
    entry.teamId === state.profile.favoriteTeamId ? { ...entry, slotsJson: stringifyLineupSlots(lineup) } : entry,
  );
  await writeLeagueState(state);
  return { ok: true as const, message: "Lineup saved." };
}

export async function simulateNextRound() {
  await ensureLeagueReady();
  const state = await readLeagueState();
  const nextRound = state.matches.find((match) => !match.played);

  if (!nextRound) {
    return { ok: false as const, message: "The season is already complete." };
  }

  const roundMatches = state.matches.filter((match) => match.round === nextRound.round);
  let favoriteTeamCredits = 0;

  for (const match of roundMatches) {
    const homeTeam = enrichTeam(state, match.homeTeamId);
    const awayTeam = enrichTeam(state, match.awayTeamId);
    const outcome = simulateMatch(match, homeTeam, awayTeam);
    const homeWin = outcome.homeScore >= outcome.awayScore;

    Object.assign(match, {
      played: true,
      homeScore: outcome.homeScore,
      awayScore: outcome.awayScore,
      homeTopPerformer: outcome.homeTopPerformer,
      awayTopPerformer: outcome.awayTopPerformer,
      summary: outcome.summary,
    });

    state.teams = state.teams.map((team) => {
      if (team.id === match.homeTeamId) {
        return { ...team, wins: team.wins + (homeWin ? 1 : 0), losses: team.losses + (homeWin ? 0 : 1), pointsFor: team.pointsFor + outcome.homeScore, pointsAgainst: team.pointsAgainst + outcome.awayScore };
      }
      if (team.id === match.awayTeamId) {
        return { ...team, wins: team.wins + (homeWin ? 0 : 1), losses: team.losses + (homeWin ? 1 : 0), pointsFor: team.pointsFor + outcome.awayScore, pointsAgainst: team.pointsAgainst + outcome.homeScore };
      }
      return team;
    });

    if (match.homeTeamId === state.profile.favoriteTeamId || match.awayTeamId === state.profile.favoriteTeamId) {
      const favoriteWon =
        (match.homeTeamId === state.profile.favoriteTeamId && homeWin) ||
        (match.awayTeamId === state.profile.favoriteTeamId && !homeWin);
      favoriteTeamCredits += favoriteWon ? 140 : 80;
    }
  }

  const remaining = state.matches.filter((match) => !match.played).length;
  state.season.currentRound = remaining === 0 ? nextRound.round : nextRound.round + 1;
  state.season.status = remaining === 0 ? "COMPLETE" : "IN_PROGRESS";
  state.profile.credits += favoriteTeamCredits;
  await writeLeagueState(state);
  return { ok: true as const, message: `Round ${nextRound.round} simulated.` };
}

export async function upgradeStaffDepartment(department: "training" | "medical" | "scouting") {
  await ensureLeagueReady();
  const state = await readLeagueState();
  const team = state.teams.find((entry) => entry.id === state.profile.favoriteTeamId)!;
  const currentLevel =
    department === "training"
      ? team.trainingLevel
      : department === "medical"
        ? team.medicalLevel
        : team.scoutingLevel;
  const cost = staffUpgradeCost(currentLevel);

  if (state.profile.credits < cost) {
    return { ok: false as const, message: `Not enough credits. ${department} upgrade costs ${cost}.` };
  }

  state.profile.credits -= cost;
  state.teams = state.teams.map((entry) => {
    if (entry.id !== state.profile.favoriteTeamId) {
      return entry;
    }

    if (department === "training") {
      return { ...entry, trainingLevel: entry.trainingLevel + 1 };
    }

    if (department === "medical") {
      return { ...entry, medicalLevel: entry.medicalLevel + 1 };
    }

    return { ...entry, scoutingLevel: entry.scoutingLevel + 1 };
  });

  await writeLeagueState(state);
  return { ok: true as const, message: `${department} staff upgraded to level ${currentLevel + 1}.` };
}

function normalizePlayerOverall(player: PlayerState) {
  const weighted = Math.round(
    player.scoring * 0.3 +
      player.playmaking * 0.18 +
      player.rebounding * 0.16 +
      player.defense * 0.18 +
      player.stamina * 0.18,
  );
  return Math.max(player.overall, Math.min(player.potential, weighted));
}

export async function trainPlayer(playerId: string, focus: "scoring" | "playmaking" | "rebounding" | "defense" | "stamina") {
  await ensureLeagueReady();
  const state = await readLeagueState();
  const player = state.players.find((entry) => entry.id === playerId && entry.teamId === state.profile.favoriteTeamId);
  const team = state.teams.find((entry) => entry.id === state.profile.favoriteTeamId)!;

  if (!player) {
    return { ok: false as const, message: "That player is not on your roster." };
  }

  const cost = 140 + team.trainingLevel * 40;
  if (state.profile.credits < cost) {
    return { ok: false as const, message: `Not enough credits. Training costs ${cost}.` };
  }

  state.profile.credits -= cost;
  state.players = state.players.map((entry) => {
    if (entry.id !== playerId) {
      return entry;
    }

    const nextValue = Math.min(entry.potential + 2, entry[focus] + 2 + team.trainingLevel);
    const updated = {
      ...entry,
      [focus]: nextValue,
      morale: Math.min(99, entry.morale + 2),
    };
    updated.overall = normalizePlayerOverall(updated);
    return updated;
  });

  await writeLeagueState(state);
  return { ok: true as const, message: `${player.firstName} ${player.lastName} improved ${focus}.` };
}

export async function signMarketPlayer(playerId: string) {
  await ensureLeagueReady();
  const state = await readLeagueState();
  const player = state.marketPlayers.find((entry) => entry.id === playerId);
  const team = state.teams.find((entry) => entry.id === state.profile.favoriteTeamId)!;

  if (!player) {
    return { ok: false as const, message: "That player is no longer on the market." };
  }

  const price = player.salary + team.scoutingLevel * 80;
  if (state.profile.credits < price) {
    return { ok: false as const, message: `Not enough credits. Signing costs ${price}.` };
  }

  state.profile.credits -= price;
  state.marketPlayers = state.marketPlayers.filter((entry) => entry.id !== playerId);
  state.players.push({ ...player, teamId: state.profile.favoriteTeamId, morale: Math.min(99, player.morale + 5) });

  await writeLeagueState(state);
  return { ok: true as const, message: `${player.firstName} ${player.lastName} joined your club.` };
}

export function getStaffDepartments(team: LeagueState["teams"][number]) {
  return [
    {
      key: "training",
      label: "Training",
      level: team.trainingLevel,
      impact: "Improves squad development and overall readiness.",
      cost: staffUpgradeCost(team.trainingLevel),
    },
    {
      key: "medical",
      label: "Medical",
      level: team.medicalLevel,
      impact: "Raises stamina contribution inside the simulation engine.",
      cost: staffUpgradeCost(team.medicalLevel),
    },
    {
      key: "scouting",
      label: "Scouting",
      level: team.scoutingLevel,
      impact: "Boosts evaluation and tactical preparation before games.",
      cost: staffUpgradeCost(team.scoutingLevel),
    },
  ] as const;
}

export async function getPlayerById(playerId: string) {
  await ensureLeagueReady();
  const state = await readLeagueState();
  const player = state.players.find((entry) => entry.id === playerId) ?? state.marketPlayers.find((entry) => entry.id === playerId);
  if (!player) {
    return null;
  }

  return {
    ...player,
    team:
      state.teams.find((team) => team.id === player.teamId) ??
      {
        id: "MARKET",
        name: "Free Agent Market",
        city: "Open",
        abbreviation: "FA",
        budget: 0,
        trainingLevel: 0,
        medicalLevel: 0,
        scoutingLevel: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      },
  };
}
