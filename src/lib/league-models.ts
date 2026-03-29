export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export type TeamState = {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  budget: number;
  trainingLevel: number;
  medicalLevel: number;
  scoutingLevel: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
};

export type PlayerState = {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  age: number;
  position: Position;
  overall: number;
  scoring: number;
  playmaking: number;
  rebounding: number;
  defense: number;
  stamina: number;
  salary: number;
  contractYears: number;
  morale: number;
  rarity: "Bronze" | "Silver" | "Gold" | "Platinum";
  archetype: string;
  potential: number;
};

export type MatchState = {
  id: string;
  seasonId: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
  homeScore: number | null;
  awayScore: number | null;
  homeTopPerformer: string | null;
  awayTopPerformer: string | null;
  homeBoxScoreJson: string | null;
  awayBoxScoreJson: string | null;
  summary: string | null;
};

export type SeasonState = {
  id: string;
  name: string;
  currentRound: number;
  totalRounds: number;
  status: "IN_PROGRESS" | "COMPLETE";
};

export type UserProfileState = {
  id: string;
  managerName: string;
  favoriteTeamId: string;
  seasonId: string;
  credits: number;
};

export type LineupSlots = {
  pgId: string;
  sgId: string;
  sfId: string;
  pfId: string;
  cId: string;
  benchOneId: string;
  benchTwoId: string;
  benchThreeId: string;
};

export type LineupState = {
  id: string;
  teamId: string;
  slotsJson: string;
};

export type PlayerSeasonStatState = {
  playerId: string;
  games: number;
  points: number;
  rebounds: number;
  assists: number;
};

export type PackRevealState = {
  playerId: string;
  packType: "standard" | "elite";
  openedAt: string;
};

export type LeagueState = {
  season: SeasonState;
  profile: UserProfileState;
  teams: TeamState[];
  players: PlayerState[];
  marketPlayers: PlayerState[];
  reservePlayers: PlayerState[];
  playerStats: PlayerSeasonStatState[];
  lastPackReveal: PackRevealState | null;
  lineups: LineupState[];
  matches: MatchState[];
};

export const lineupOrder = [
  "pgId",
  "sgId",
  "sfId",
  "pfId",
  "cId",
  "benchOneId",
  "benchTwoId",
  "benchThreeId",
] as const;

export type LineupSlotKey = (typeof lineupOrder)[number];

export function parseLineupSlots(slotsJson: string): LineupSlots {
  return JSON.parse(slotsJson) as LineupSlots;
}

export function stringifyLineupSlots(slots: LineupSlots): string {
  return JSON.stringify(slots);
}

export const starterPositionBySlot: Record<
  keyof Pick<LineupSlots, "pgId" | "sgId" | "sfId" | "pfId" | "cId">,
  Position
> = {
  pgId: "PG",
  sgId: "SG",
  sfId: "SF",
  pfId: "PF",
  cId: "C",
};
