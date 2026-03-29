export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export type TeamState = {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  budget: number;
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
  morale: number;
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

export type LeagueState = {
  season: SeasonState;
  profile: UserProfileState;
  teams: TeamState[];
  players: PlayerState[];
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
