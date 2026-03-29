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
  type TeamState,
} from "./league-models";

const statePath = resolve(process.cwd(), "data", "league-state.json");

const teamBlueprint = [
  ["Boston", "Celtics", "BOS"],
  ["New York", "Knicks", "NYK"],
  ["Milwaukee", "Bucks", "MIL"],
  ["Miami", "Heat", "MIA"],
  ["Denver", "Nuggets", "DEN"],
  ["Dallas", "Mavericks", "DAL"],
  ["Oklahoma City", "Thunder", "OKC"],
  ["Los Angeles", "Lakers", "LAL"],
] as const;
const rosterBlueprint: Position[] = ["PG", "SG", "SF", "PF", "C", "PG", "SF", "PF"];

type TeamWithRoster = TeamState & {
  players: PlayerState[];
  lineup: LeagueState["lineups"][number] | null;
};

type PlayerGameLine = {
  playerId: string;
  points: number;
  rebounds: number;
  assists: number;
};

type RealPlayerSeed = {
  firstName: string;
  lastName: string;
  age: number;
  position: Position;
  overall: number;
  potential: number;
  archetype:
    | "Floor General"
    | "Shot Creator"
    | "Pure Scorer"
    | "Two-Way Wing"
    | "Athletic Slasher"
    | "Glass Cleaner"
    | "Rim Protector"
    | "Playmaking Big";
};

const realPlayerSeeds: RealPlayerSeed[] = [
  { firstName: "Nikola", lastName: "Jokic", age: 31, position: "C", overall: 97, potential: 99, archetype: "Playmaking Big" },
  { firstName: "Giannis", lastName: "Antetokounmpo", age: 31, position: "PF", overall: 96, potential: 98, archetype: "Athletic Slasher" },
  { firstName: "Luka", lastName: "Doncic", age: 27, position: "PG", overall: 96, potential: 98, archetype: "Shot Creator" },
  { firstName: "Shai", lastName: "Gilgeous-Alexander", age: 28, position: "PG", overall: 96, potential: 98, archetype: "Shot Creator" },
  { firstName: "Jayson", lastName: "Tatum", age: 28, position: "SF", overall: 94, potential: 96, archetype: "Two-Way Wing" },
  { firstName: "Anthony", lastName: "Edwards", age: 25, position: "SG", overall: 93, potential: 97, archetype: "Athletic Slasher" },
  { firstName: "Victor", lastName: "Wembanyama", age: 22, position: "C", overall: 94, potential: 99, archetype: "Rim Protector" },
  { firstName: "Stephen", lastName: "Curry", age: 38, position: "PG", overall: 92, potential: 93, archetype: "Pure Scorer" },
  { firstName: "LeBron", lastName: "James", age: 41, position: "SF", overall: 90, potential: 90, archetype: "Floor General" },
  { firstName: "Anthony", lastName: "Davis", age: 33, position: "PF", overall: 91, potential: 92, archetype: "Rim Protector" },
  { firstName: "Donovan", lastName: "Mitchell", age: 30, position: "SG", overall: 91, potential: 93, archetype: "Pure Scorer" },
  { firstName: "Jalen", lastName: "Brunson", age: 30, position: "PG", overall: 91, potential: 93, archetype: "Shot Creator" },
  { firstName: "Tyrese", lastName: "Haliburton", age: 26, position: "PG", overall: 91, potential: 94, archetype: "Floor General" },
  { firstName: "Paolo", lastName: "Banchero", age: 24, position: "PF", overall: 89, potential: 95, archetype: "Shot Creator" },
  { firstName: "Franz", lastName: "Wagner", age: 25, position: "SF", overall: 88, potential: 93, archetype: "Two-Way Wing" },
  { firstName: "Evan", lastName: "Mobley", age: 25, position: "PF", overall: 89, potential: 94, archetype: "Rim Protector" },
  { firstName: "Jaren", lastName: "Jackson Jr.", age: 27, position: "PF", overall: 88, potential: 92, archetype: "Rim Protector" },
  { firstName: "Tyrese", lastName: "Maxey", age: 26, position: "PG", overall: 88, potential: 92, archetype: "Pure Scorer" },
  { firstName: "Joel", lastName: "Embiid", age: 32, position: "C", overall: 90, potential: 91, archetype: "Playmaking Big" },
  { firstName: "Ja", lastName: "Morant", age: 27, position: "PG", overall: 89, potential: 94, archetype: "Athletic Slasher" },
  { firstName: "Jalen", lastName: "Williams", age: 25, position: "SF", overall: 89, potential: 94, archetype: "Two-Way Wing" },
  { firstName: "Trae", lastName: "Young", age: 28, position: "PG", overall: 88, potential: 91, archetype: "Floor General" },
  { firstName: "Devin", lastName: "Booker", age: 29, position: "SG", overall: 90, potential: 93, archetype: "Pure Scorer" },
  { firstName: "Kevin", lastName: "Durant", age: 38, position: "SF", overall: 89, potential: 90, archetype: "Pure Scorer" },
  { firstName: "LaMelo", lastName: "Ball", age: 25, position: "PG", overall: 87, potential: 92, archetype: "Floor General" },
  { firstName: "Zion", lastName: "Williamson", age: 26, position: "PF", overall: 88, potential: 93, archetype: "Athletic Slasher" },
  { firstName: "Chet", lastName: "Holmgren", age: 24, position: "C", overall: 88, potential: 95, archetype: "Rim Protector" },
  { firstName: "Kyrie", lastName: "Irving", age: 34, position: "PG", overall: 88, potential: 89, archetype: "Shot Creator" },
  { firstName: "De'Aaron", lastName: "Fox", age: 29, position: "PG", overall: 87, potential: 90, archetype: "Athletic Slasher" },
  { firstName: "Domantas", lastName: "Sabonis", age: 30, position: "C", overall: 88, potential: 90, archetype: "Playmaking Big" },
  { firstName: "Bam", lastName: "Adebayo", age: 29, position: "C", overall: 87, potential: 90, archetype: "Rim Protector" },
  { firstName: "Damian", lastName: "Lillard", age: 36, position: "PG", overall: 87, potential: 88, archetype: "Pure Scorer" },
  { firstName: "Kawhi", lastName: "Leonard", age: 35, position: "SF", overall: 87, potential: 88, archetype: "Two-Way Wing" },
  { firstName: "James", lastName: "Harden", age: 37, position: "PG", overall: 86, potential: 87, archetype: "Floor General" },
  { firstName: "Rudy", lastName: "Gobert", age: 34, position: "C", overall: 86, potential: 87, archetype: "Rim Protector" },
  { firstName: "Karl-Anthony", lastName: "Towns", age: 31, position: "C", overall: 87, potential: 89, archetype: "Playmaking Big" },
  { firstName: "Jaylen", lastName: "Brown", age: 30, position: "SG", overall: 88, potential: 91, archetype: "Two-Way Wing" },
  { firstName: "Derrick", lastName: "White", age: 32, position: "SG", overall: 84, potential: 86, archetype: "Two-Way Wing" },
  { firstName: "Scottie", lastName: "Barnes", age: 25, position: "SF", overall: 87, potential: 93, archetype: "Two-Way Wing" },
  { firstName: "Jamal", lastName: "Murray", age: 29, position: "PG", overall: 86, potential: 89, archetype: "Shot Creator" },
  { firstName: "Alperen", lastName: "Sengun", age: 24, position: "C", overall: 87, potential: 93, archetype: "Playmaking Big" },
  { firstName: "Darius", lastName: "Garland", age: 27, position: "PG", overall: 86, potential: 89, archetype: "Floor General" },
  { firstName: "Jarrett", lastName: "Allen", age: 28, position: "C", overall: 84, potential: 86, archetype: "Rim Protector" },
  { firstName: "Jalen", lastName: "Johnson", age: 24, position: "PF", overall: 85, potential: 92, archetype: "Athletic Slasher" },
  { firstName: "Jalen", lastName: "Duren", age: 23, position: "C", overall: 83, potential: 90, archetype: "Glass Cleaner" },
  { firstName: "Mikal", lastName: "Bridges", age: 30, position: "SF", overall: 84, potential: 86, archetype: "Two-Way Wing" },
  { firstName: "OG", lastName: "Anunoby", age: 29, position: "SF", overall: 84, potential: 86, archetype: "Two-Way Wing" },
  { firstName: "Desmond", lastName: "Bane", age: 28, position: "SG", overall: 85, potential: 88, archetype: "Pure Scorer" },
  { firstName: "Pascal", lastName: "Siakam", age: 32, position: "PF", overall: 86, potential: 88, archetype: "Two-Way Wing" },
  { firstName: "Myles", lastName: "Turner", age: 30, position: "C", overall: 84, potential: 86, archetype: "Rim Protector" },
  { firstName: "Lauri", lastName: "Markkanen", age: 29, position: "PF", overall: 85, potential: 88, archetype: "Pure Scorer" },
  { firstName: "CJ", lastName: "McCollum", age: 35, position: "SG", overall: 82, potential: 83, archetype: "Pure Scorer" },
  { firstName: "Jrue", lastName: "Holiday", age: 36, position: "PG", overall: 83, potential: 84, archetype: "Two-Way Wing" },
  { firstName: "Bradley", lastName: "Beal", age: 33, position: "SG", overall: 82, potential: 84, archetype: "Pure Scorer" },
  { firstName: "DeMar", lastName: "DeRozan", age: 37, position: "SF", overall: 84, potential: 85, archetype: "Pure Scorer" },
  { firstName: "Julius", lastName: "Randle", age: 31, position: "PF", overall: 84, potential: 86, archetype: "Shot Creator" },
  { firstName: "Kristaps", lastName: "Porzingis", age: 31, position: "C", overall: 84, potential: 86, archetype: "Rim Protector" },
  { firstName: "Anfernee", lastName: "Simons", age: 27, position: "SG", overall: 82, potential: 85, archetype: "Pure Scorer" },
  { firstName: "Cade", lastName: "Cunningham", age: 25, position: "PG", overall: 89, potential: 95, archetype: "Floor General" },
  { firstName: "Cameron", lastName: "Thomas", age: 25, position: "SG", overall: 82, potential: 86, archetype: "Pure Scorer" },
  { firstName: "Austin", lastName: "Reaves", age: 28, position: "SG", overall: 83, potential: 87, archetype: "Shot Creator" },
  { firstName: "Amen", lastName: "Thompson", age: 23, position: "SG", overall: 84, potential: 94, archetype: "Athletic Slasher" },
  { firstName: "Jabari", lastName: "Smith Jr.", age: 23, position: "PF", overall: 82, potential: 89, archetype: "Two-Way Wing" },
  { firstName: "Tari", lastName: "Eason", age: 25, position: "PF", overall: 81, potential: 87, archetype: "Two-Way Wing" },
  { firstName: "Fred", lastName: "VanVleet", age: 32, position: "PG", overall: 82, potential: 84, archetype: "Floor General" },
  { firstName: "Tyler", lastName: "Herro", age: 26, position: "SG", overall: 84, potential: 87, archetype: "Pure Scorer" },
  { firstName: "Jalen", lastName: "Green", age: 25, position: "SG", overall: 83, potential: 89, archetype: "Athletic Slasher" },
  { firstName: "Klay", lastName: "Thompson", age: 36, position: "SG", overall: 80, potential: 81, archetype: "Pure Scorer" },
  { firstName: "Draymond", lastName: "Green", age: 36, position: "PF", overall: 81, potential: 82, archetype: "Playmaking Big" },
  { firstName: "Brook", lastName: "Lopez", age: 38, position: "C", overall: 80, potential: 81, archetype: "Rim Protector" },
  { firstName: "Nic", lastName: "Claxton", age: 27, position: "C", overall: 81, potential: 85, archetype: "Rim Protector" },
  { firstName: "Josh", lastName: "Giddey", age: 24, position: "SG", overall: 82, potential: 88, archetype: "Floor General" },
  { firstName: "RJ", lastName: "Barrett", age: 26, position: "SF", overall: 82, potential: 86, archetype: "Athletic Slasher" },
  { firstName: "Brandon", lastName: "Ingram", age: 29, position: "SF", overall: 85, potential: 88, archetype: "Shot Creator" },
  { firstName: "Dejounte", lastName: "Murray", age: 30, position: "PG", overall: 84, potential: 87, archetype: "Two-Way Wing" },
  { firstName: "Jalen", lastName: "Suggs", age: 25, position: "SG", overall: 83, potential: 88, archetype: "Two-Way Wing" },
  { firstName: "Jakob", lastName: "Poeltl", age: 31, position: "C", overall: 80, potential: 82, archetype: "Glass Cleaner" },
  { firstName: "Walker", lastName: "Kessler", age: 25, position: "C", overall: 82, potential: 88, archetype: "Rim Protector" },
  { firstName: "Andrew", lastName: "Nembhard", age: 26, position: "PG", overall: 81, potential: 85, archetype: "Floor General" },
  { firstName: "Aaron", lastName: "Gordon", age: 31, position: "PF", overall: 83, potential: 85, archetype: "Athletic Slasher" },
  { firstName: "Michael", lastName: "Porter Jr.", age: 28, position: "SF", overall: 83, potential: 85, archetype: "Pure Scorer" },
  { firstName: "Herbert", lastName: "Jones", age: 28, position: "SF", overall: 82, potential: 85, archetype: "Two-Way Wing" },
  { firstName: "Norman", lastName: "Powell", age: 33, position: "SG", overall: 82, potential: 83, archetype: "Pure Scorer" },
  { firstName: "Deni", lastName: "Avdija", age: 25, position: "SF", overall: 82, potential: 87, archetype: "Two-Way Wing" },
  { firstName: "Ivica", lastName: "Zubac", age: 29, position: "C", overall: 82, potential: 84, archetype: "Glass Cleaner" },
];

function clampRating(value: number) {
  return Math.max(55, Math.min(99, value));
}

function rarityFromOverall(overall: number): PlayerState["rarity"] {
  if (overall >= 90) {
    return "Platinum";
  }
  if (overall >= 85) {
    return "Gold";
  }
  if (overall >= 79) {
    return "Silver";
  }
  return "Bronze";
}

function createPlayerFromSeed(seed: RealPlayerSeed, teamId: string, index: number): PlayerState {
  const variance = (index % 5) - 2;
  const templates = {
    "Floor General": { scoring: -2, playmaking: 7, rebounding: -4, defense: 0, stamina: 2 },
    "Shot Creator": { scoring: 6, playmaking: 2, rebounding: -2, defense: -1, stamina: 1 },
    "Pure Scorer": { scoring: 8, playmaking: 0, rebounding: -3, defense: -2, stamina: 0 },
    "Two-Way Wing": { scoring: 2, playmaking: 0, rebounding: 0, defense: 6, stamina: 2 },
    "Athletic Slasher": { scoring: 4, playmaking: 1, rebounding: 1, defense: 1, stamina: 5 },
    "Glass Cleaner": { scoring: -4, playmaking: -4, rebounding: 8, defense: 2, stamina: 2 },
    "Rim Protector": { scoring: -3, playmaking: -4, rebounding: 5, defense: 9, stamina: 2 },
    "Playmaking Big": { scoring: 1, playmaking: 5, rebounding: 5, defense: 1, stamina: 1 },
  } as const;
  const template = templates[seed.archetype];

  return {
    id: randomUUID(),
    teamId,
    firstName: seed.firstName,
    lastName: seed.lastName,
    age: seed.age,
    position: seed.position,
    overall: seed.overall,
    scoring: clampRating(seed.overall + template.scoring + variance),
    playmaking: clampRating(seed.overall + template.playmaking - variance),
    rebounding: clampRating(seed.overall + template.rebounding + (index % 3) - 1),
    defense: clampRating(seed.overall + template.defense - (index % 2)),
    stamina: clampRating(seed.overall + template.stamina + 1),
    salary: 800 + seed.overall * 24,
    morale: clampRating(72 + (index % 10)),
    rarity: rarityFromOverall(seed.overall),
    archetype: seed.archetype,
    potential: seed.potential,
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

function buildTeamLookup(state: LeagueState) {
  return new Map(state.teams.map((team) => [team.id, team]));
}

function buildPlayerLookup(state: LeagueState) {
  return new Map(
    [...state.players, ...state.marketPlayers, ...state.reservePlayers].map((player) => [player.id, player]),
  );
}

function createStatSheet(players: PlayerState[]) {
  return players.map((player) => ({
    playerId: player.id,
    games: 0,
    points: 0,
    rebounds: 0,
    assists: 0,
  }));
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

  const rosterSeedCount = teams.length * rosterBlueprint.length;
  const rosterSeeds = realPlayerSeeds.slice(0, rosterSeedCount);
  const marketSeeds = realPlayerSeeds.slice(rosterSeedCount, rosterSeedCount + 8);
  const reserveSeeds = realPlayerSeeds.slice(rosterSeedCount + 8);

  const players = teams.flatMap((team, teamIndex) =>
    rosterBlueprint.map((position, rosterIndex) => {
      const seed = rosterSeeds[teamIndex * rosterBlueprint.length + rosterIndex];
      const resolvedSeed =
        seed.position === position ? seed : { ...seed, position };
      return createPlayerFromSeed(resolvedSeed, team.id, teamIndex * rosterBlueprint.length + rosterIndex);
    }),
  );

  const marketPlayers = marketSeeds.map((seed, index) => ({
    ...createPlayerFromSeed(seed, "MARKET", rosterSeedCount + index),
    teamId: "MARKET",
    salary: 950 + seed.overall * 26,
  }));
  const reservePlayers = reserveSeeds.map((seed, index) => ({
    ...createPlayerFromSeed(seed, "RESERVE", rosterSeedCount + marketSeeds.length + index),
    teamId: "RESERVE",
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
      homeBoxScoreJson: null,
      awayBoxScoreJson: null,
      summary: null,
    })),
  );

  return {
    season: { id: seasonId, name: "Pro Hoops Season 1", currentRound: 1, totalRounds: 14, status: "IN_PROGRESS" },
    profile: { id: randomUUID(), managerName: "Solo Manager", favoriteTeamId: teams[0].id, seasonId, credits: 1200 },
    teams,
    players,
    marketPlayers,
    reservePlayers,
    playerStats: createStatSheet([...players, ...marketPlayers, ...reservePlayers]),
    lastPackReveal: null,
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

function ensurePlayerStatEntries(state: LeagueState, players: PlayerState[]) {
  const known = new Set(state.playerStats.map((entry) => entry.playerId));
  for (const player of players) {
    if (!known.has(player.id)) {
      state.playerStats.push({
        playerId: player.id,
        games: 0,
        points: 0,
        rebounds: 0,
        assists: 0,
      });
    }
  }
}

function ensureCompleteState(state: LeagueState) {
  if (!state.marketPlayers) {
    state.marketPlayers = [];
  }
  if (!state.reservePlayers) {
    state.reservePlayers = [];
  }
  if (!state.playerStats) {
    state.playerStats = [];
  }
  if (state.lastPackReveal === undefined) {
    state.lastPackReveal = null;
  }
  ensurePlayerStatEntries(state, [...state.players, ...state.marketPlayers, ...state.reservePlayers]);
}

function parseTopPerformer(line: PlayerGameLine, playerLookup: Map<string, PlayerState>) {
  const player = playerLookup.get(line.playerId)!;
  return `${player.firstName} ${player.lastName}: ${line.points} PTS, ${line.rebounds} REB, ${line.assists} AST`;
}

function buildTeamBoxScore(team: TeamWithRoster, score: number): PlayerGameLine[] {
  const lineup = team.lineup
    ? parseLineupSlots(team.lineup.slotsJson)
    : buildDefaultLineup(team.players.map((player) => player.id));
  const orderedIds = [
    lineup.pgId,
    lineup.sgId,
    lineup.sfId,
    lineup.pfId,
    lineup.cId,
    lineup.benchOneId,
    lineup.benchTwoId,
    lineup.benchThreeId,
  ];
  const orderedPlayers = orderedIds
    .map((id) => team.players.find((player) => player.id === id))
    .filter((player): player is PlayerState => Boolean(player));

  const weights = orderedPlayers.map((player, index) => {
    const usageBonus = index < 5 ? 1.24 : 0.72;
    return player.scoring * 0.52 + player.playmaking * 0.12 + player.rebounding * 0.06 + usageBonus * 10;
  });
  const totalWeight = weights.reduce((sum, value) => sum + value, 0) || 1;
  const rawPoints = orderedPlayers.map((player, index) => ({
    player,
    points: Math.max(4, Math.round(score * (weights[index] / totalWeight) + (index % 2 === 0 ? 1 : -1))),
  }));
  const pointTotal = rawPoints.reduce((sum, entry) => sum + entry.points, 0);
  rawPoints[0].points += score - pointTotal;

  return rawPoints.map(({ player, points }, index) => ({
    playerId: player.id,
    points: Math.max(3, points),
    rebounds: Math.max(1, Math.round(player.rebounding * (index < 5 ? 0.12 : 0.08) + (player.position === "C" ? 3 : 0))),
    assists: Math.max(1, Math.round(player.playmaking * (index < 5 ? 0.09 : 0.05) + (player.position === "PG" ? 3 : 0))),
  }));
}

function updatePlayerStats(state: LeagueState, lines: PlayerGameLine[]) {
  const statsByPlayer = new Map(state.playerStats.map((entry) => [entry.playerId, entry]));
  for (const line of lines) {
    let stat = statsByPlayer.get(line.playerId);
    if (!stat) {
      stat = { playerId: line.playerId, games: 0, points: 0, rebounds: 0, assists: 0 };
      state.playerStats.push(stat);
      statsByPlayer.set(line.playerId, stat);
    }
    stat.games += 1;
    stat.points += line.points;
    stat.rebounds += line.rebounds;
    stat.assists += line.assists;
  }
}

function buildFreeAgentTeam() {
  return {
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
  };
}

function averagePerGame(total: number, games: number) {
  return games === 0 ? 0 : total / games;
}

function standingsSorter(left: TeamWithRoster, right: TeamWithRoster) {
  const winDiff = right.wins - left.wins;
  if (winDiff !== 0) {
    return winDiff;
  }
  const pointDiff = right.pointsFor - right.pointsAgainst - (left.pointsFor - left.pointsAgainst);
  if (pointDiff !== 0) {
    return pointDiff;
  }
  return right.pointsFor - left.pointsFor;
}

export async function resetLeague() {
  const state = buildInitialState();
  await writeLeagueState(state);
  return { ok: true as const, message: "League reset with a fresh pro hoops season." };
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
      state.reservePlayers === undefined ||
      state.playerStats === undefined ||
      state.lastPackReveal === undefined ||
      state.matches[0]?.homeBoxScoreJson === undefined ||
      state.matches[0]?.awayBoxScoreJson === undefined ||
      state.players[0]?.rarity === undefined ||
      state.players[0]?.archetype === undefined ||
      state.players[0]?.potential === undefined
    ) {
      await resetLeague();
      return;
    }
    ensureCompleteState(state);
    await writeLeagueState(state);
  } catch {
    await resetLeague();
  }
}

export async function getGameSnapshot() {
  await ensureLeagueReady();
  const state = await readLeagueState();
  ensureCompleteState(state);
  const playerLookup = buildPlayerLookup(state);
  const teamLookup = buildTeamLookup(state);
  const favoriteTeam = enrichTeam(state, state.profile.favoriteTeamId);
  const teams = state.teams.map((team) => enrichTeam(state, team.id)).sort(standingsSorter);
  const matches = state.matches
    .map((match) => ({
      ...match,
      homeTeam: teamLookup.get(match.homeTeamId)!,
      awayTeam: teamLookup.get(match.awayTeamId)!,
      homeBoxScore: match.homeBoxScoreJson
        ? (JSON.parse(match.homeBoxScoreJson) as PlayerGameLine[]).map((line) => ({
            ...line,
            player: playerLookup.get(line.playerId)!,
          }))
        : [],
      awayBoxScore: match.awayBoxScoreJson
        ? (JSON.parse(match.awayBoxScoreJson) as PlayerGameLine[]).map((line) => ({
            ...line,
            player: playerLookup.get(line.playerId)!,
          }))
        : [],
    }))
    .sort((left, right) => left.round - right.round);

  const leaderPool = state.playerStats
    .map((stat) => {
      const player = playerLookup.get(stat.playerId);
      if (!player) {
        return null;
      }

      const team = teamLookup.get(player.teamId) ?? buildFreeAgentTeam();
      return {
        ...stat,
        player,
        team,
        ppg: averagePerGame(stat.points, stat.games),
        rpg: averagePerGame(stat.rebounds, stat.games),
        apg: averagePerGame(stat.assists, stat.games),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.games > 0);

  const scoringLeaders = [...leaderPool].sort((left, right) => right.ppg - left.ppg).slice(0, 5);
  const reboundLeaders = [...leaderPool].sort((left, right) => right.rpg - left.rpg).slice(0, 5);
  const assistLeaders = [...leaderPool].sort((left, right) => right.apg - left.apg).slice(0, 5);
  const mvpLadder = [...leaderPool]
    .map((entry) => {
      const teamGames = entry.team.wins + entry.team.losses;
      const teamWinRate = teamGames === 0 ? 0.5 : entry.team.wins / teamGames;
      return {
        ...entry,
        mvpScore:
          entry.ppg * 1.2 +
          entry.rpg * 0.8 +
          entry.apg +
          teamWinRate * 18 +
          entry.player.overall * 0.12 +
          entry.games * 0.08,
      };
    })
    .sort((left, right) => right.mvpScore - left.mvpScore)
    .slice(0, 5);

  const lastPackReveal = state.lastPackReveal
    ? {
        ...state.lastPackReveal,
        player: playerLookup.get(state.lastPackReveal.playerId) ?? null,
      }
    : null;

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
    reserveCount: state.reservePlayers.length,
    lastPackReveal,
    scoringLeaders,
    reboundLeaders,
    assistLeaders,
    mvpLadder,
  };
}

function staffUpgradeCost(level: number) {
  return 300 + level * 220;
}

function packCost(type: "standard" | "elite") {
  return type === "elite" ? 520 : 260;
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
  ensureCompleteState(state);
  const playerLookup = buildPlayerLookup(state);
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
    const homeBoxScore = buildTeamBoxScore(homeTeam, outcome.homeScore);
    const awayBoxScore = buildTeamBoxScore(awayTeam, outcome.awayScore);
    const homeStar = [...homeBoxScore].sort((left, right) => right.points - left.points)[0];
    const awayStar = [...awayBoxScore].sort((left, right) => right.points - left.points)[0];

    updatePlayerStats(state, homeBoxScore);
    updatePlayerStats(state, awayBoxScore);

    Object.assign(match, {
      played: true,
      homeScore: outcome.homeScore,
      awayScore: outcome.awayScore,
      homeTopPerformer: parseTopPerformer(homeStar, playerLookup),
      awayTopPerformer: parseTopPerformer(awayStar, playerLookup),
      homeBoxScoreJson: JSON.stringify(homeBoxScore),
      awayBoxScoreJson: JSON.stringify(awayBoxScore),
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
  ensureCompleteState(state);
  const player = state.marketPlayers.find((entry) => entry.id === playerId);
  const team = state.teams.find((entry) => entry.id === state.profile.favoriteTeamId)!;

  if (!player) {
    return { ok: false as const, message: "That player is no longer on the market." };
  }
  if (state.players.filter((entry) => entry.teamId === state.profile.favoriteTeamId).length >= 12) {
    return { ok: false as const, message: "Your roster is full. Sell a player before signing another." };
  }

  const price = player.salary + team.scoutingLevel * 80;
  if (state.profile.credits < price) {
    return { ok: false as const, message: `Not enough credits. Signing costs ${price}.` };
  }

  state.profile.credits -= price;
  state.marketPlayers = state.marketPlayers.filter((entry) => entry.id !== playerId);
  state.players.push({ ...player, teamId: state.profile.favoriteTeamId, morale: Math.min(99, player.morale + 5) });
  ensurePlayerStatEntries(state, [player]);

  await writeLeagueState(state);
  return { ok: true as const, message: `${player.firstName} ${player.lastName} joined your club.` };
}

export async function sellRosterPlayer(playerId: string) {
  await ensureLeagueReady();
  const state = await readLeagueState();
  ensureCompleteState(state);
  const player = state.players.find((entry) => entry.id === playerId && entry.teamId === state.profile.favoriteTeamId);

  if (!player) {
    return { ok: false as const, message: "That player is not on your roster." };
  }

  const roster = state.players.filter((entry) => entry.teamId === state.profile.favoriteTeamId);
  if (roster.length <= 8) {
    return { ok: false as const, message: "Keep at least 8 players so your lineup remains valid." };
  }

  const payout = Math.round(player.salary * 0.75 + player.overall * 12);
  state.profile.credits += payout;
  state.players = state.players.filter((entry) => entry.id !== playerId);
  state.marketPlayers.unshift({ ...player, teamId: "MARKET", morale: Math.max(55, player.morale - 6) });

  const lineup = state.lineups.find((entry) => entry.teamId === state.profile.favoriteTeamId);
  if (lineup) {
    const parsed = parseLineupSlots(lineup.slotsJson);
    const rosterIds = state.players
      .filter((entry) => entry.teamId === state.profile.favoriteTeamId)
      .map((entry) => entry.id);
    const used = new Set<string>();
    const normalized = {} as LineupSlots;
    for (const slot of lineupOrder) {
      const current = parsed[slot];
      if (current !== playerId && rosterIds.includes(current) && !used.has(current)) {
        normalized[slot] = current;
        used.add(current);
        continue;
      }

      const replacement = rosterIds.find((candidate) => !used.has(candidate)) ?? rosterIds[0];
      normalized[slot] = replacement;
      used.add(replacement);
    }
    lineup.slotsJson = stringifyLineupSlots(normalized);
  }

  await writeLeagueState(state);
  return { ok: true as const, message: `${player.firstName} ${player.lastName} was sold for ${payout} credits.` };
}

export async function openPack(type: "standard" | "elite") {
  await ensureLeagueReady();
  const state = await readLeagueState();
  ensureCompleteState(state);
  const rosterSize = state.players.filter((entry) => entry.teamId === state.profile.favoriteTeamId).length;
  if (rosterSize >= 12) {
    return { ok: false as const, message: "Your roster is full. Sell a player before opening a pack." };
  }

  const cost = packCost(type);
  if (state.profile.credits < cost) {
    return { ok: false as const, message: `Not enough credits. ${type} pack costs ${cost}.` };
  }
  if (state.reservePlayers.length === 0) {
    return { ok: false as const, message: "No more player packs are available in this build." };
  }

  state.profile.credits -= cost;
  const player = state.reservePlayers.shift()!;
  const boosted =
    type === "elite"
      ? {
          ...player,
          overall: Math.min(94, player.overall + 5),
          scoring: Math.min(98, player.scoring + 4),
          playmaking: Math.min(98, player.playmaking + 4),
          rebounding: Math.min(98, player.rebounding + 4),
          defense: Math.min(98, player.defense + 4),
          stamina: Math.min(98, player.stamina + 3),
          rarity: (player.overall >= 86 ? "Platinum" : "Gold") as PlayerState["rarity"],
          potential: Math.min(99, player.potential + 4),
        }
      : player;
  const finalPlayer = {
    ...boosted,
    teamId: state.profile.favoriteTeamId,
    overall: Math.min(boosted.potential, normalizePlayerOverall(boosted)),
  };
  state.players.push(finalPlayer);
  ensurePlayerStatEntries(state, [finalPlayer]);
  state.lastPackReveal = {
    playerId: finalPlayer.id,
    packType: type,
    openedAt: new Date().toISOString(),
  };
  await writeLeagueState(state);
  return {
    ok: true as const,
    message: `${finalPlayer.firstName} ${finalPlayer.lastName} joined your roster from a ${type} pack.`,
  };
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
  ensureCompleteState(state);
  const player =
    state.players.find((entry) => entry.id === playerId) ??
    state.marketPlayers.find((entry) => entry.id === playerId) ??
    state.reservePlayers.find((entry) => entry.id === playerId);
  if (!player) {
    return null;
  }

  const statLine = state.playerStats.find((entry) => entry.playerId === player.id) ?? {
    playerId: player.id,
    games: 0,
    points: 0,
    rebounds: 0,
    assists: 0,
  };

  return {
    ...player,
    team: state.teams.find((team) => team.id === player.teamId) ?? buildFreeAgentTeam(),
    seasonStats: {
      games: statLine.games,
      ppg: averagePerGame(statLine.points, statLine.games),
      rpg: averagePerGame(statLine.rebounds, statLine.games),
      apg: averagePerGame(statLine.assists, statLine.games),
    },
  };
}
