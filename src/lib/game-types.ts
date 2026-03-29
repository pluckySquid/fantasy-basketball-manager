import type { Position } from "@prisma/client";

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
