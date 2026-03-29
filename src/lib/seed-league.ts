import type { Position, PrismaClient } from "@prisma/client";
import { stringifyLineupSlots, type LineupSlots } from "./game-types";

const firstNames = [
  "Mason",
  "Julian",
  "Theo",
  "Noah",
  "Kai",
  "Elliot",
  "Roman",
  "Miles",
  "Luca",
  "Grant",
  "Owen",
  "Jaylen",
  "Caleb",
  "Evan",
  "Felix",
  "Nico",
];

const lastNames = [
  "Carter",
  "Vance",
  "Brooks",
  "Mercer",
  "Hayes",
  "Bennett",
  "Porter",
  "Wells",
  "Sutton",
  "Reed",
  "Cross",
  "Coleman",
  "Foster",
  "Quinn",
  "Maddox",
  "Sawyer",
];

const teams = [
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

function buildSchedule(teamIds: string[]) {
  const rotation = [...teamIds];
  const rounds: Array<Array<{ homeTeamId: string; awayTeamId: string }>> = [];

  for (let round = 0; round < rotation.length - 1; round += 1) {
    const fixtures = [];
    for (let i = 0; i < rotation.length / 2; i += 1) {
      const home = rotation[i];
      const away = rotation[rotation.length - 1 - i];
      fixtures.push(
        round % 2 === 0
          ? { homeTeamId: home, awayTeamId: away }
          : { homeTeamId: away, awayTeamId: home },
      );
    }
    rounds.push(fixtures);

    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop()!);
    rotation.splice(0, rotation.length, fixed, ...rest);
  }

  return [
    ...rounds,
    ...rounds.map((fixtures) =>
      fixtures.map((fixture) => ({
        homeTeamId: fixture.awayTeamId,
        awayTeamId: fixture.homeTeamId,
      })),
    ),
  ];
}

function valueAround(base: number, variance: number) {
  const delta = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
  return Math.max(48, Math.min(99, base + delta));
}

function generatePlayer(teamIndex: number, rosterIndex: number, position: Position) {
  const base =
    67 +
    Math.floor(Math.random() * 14) +
    (rosterIndex < 5 ? 4 : 0) +
    (teamIndex === 0 ? 2 : 0);
  const scoringBias = position === "SG" || position === "SF" ? 4 : 0;
  const playmakingBias = position === "PG" ? 6 : 0;
  const reboundingBias = position === "PF" || position === "C" ? 6 : 0;
  const defenseBias = rosterIndex % 2 === 0 ? 3 : 0;

  return {
    firstName: firstNames[(teamIndex * 2 + rosterIndex) % firstNames.length],
    lastName: lastNames[(teamIndex * 3 + rosterIndex) % lastNames.length],
    age: 20 + ((teamIndex + rosterIndex) % 12),
    position,
    overall: valueAround(base, 5),
    scoring: valueAround(base + scoringBias, 8),
    playmaking: valueAround(base + playmakingBias, 9),
    rebounding: valueAround(base + reboundingBias, 7),
    defense: valueAround(base + defenseBias, 7),
    stamina: valueAround(base + 2, 6),
    salary: 650 + base * 18 + rosterIndex * 20,
    morale: valueAround(74, 10),
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

export async function seedLeague(prisma: PrismaClient) {
  await prisma.match.deleteMany();
  await prisma.lineup.deleteMany();
  await prisma.player.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.team.deleteMany();
  await prisma.season.deleteMany();

  const season = await prisma.season.create({
    data: {
      name: "Fictional League Season 1",
      currentRound: 1,
      totalRounds: 14,
      status: "IN_PROGRESS",
    },
  });

  const createdTeams = [];

  for (const [teamIndex, [city, nickname, abbreviation]] of teams.entries()) {
    const team = await prisma.team.create({
      data: {
        city,
        name: `${city} ${nickname}`,
        abbreviation,
        budget: 18000,
      },
    });

    const players = [];
    for (const [rosterIndex, position] of rosterBlueprint.entries()) {
      const player = await prisma.player.create({
        data: {
          teamId: team.id,
          ...generatePlayer(teamIndex, rosterIndex, position),
        },
      });
      players.push(player);
    }

    await prisma.lineup.create({
      data: {
        teamId: team.id,
        slotsJson: stringifyLineupSlots(buildDefaultLineup(players.map((player) => player.id))),
      },
    });

    createdTeams.push(team);
  }

  const schedule = buildSchedule(createdTeams.map((team) => team.id));
  for (const [roundIndex, fixtures] of schedule.entries()) {
    await prisma.match.createMany({
      data: fixtures.map((fixture) => ({
        seasonId: season.id,
        round: roundIndex + 1,
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
      })),
    });
  }

  await prisma.userProfile.create({
    data: {
      managerName: "Solo Manager",
      favoriteTeamId: createdTeams[0].id,
      seasonId: season.id,
    },
  });
}
