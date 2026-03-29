"use server";

import { revalidatePath } from "next/cache";
import {
  openPack,
  resetLeague,
  saveFavoriteLineup,
  sellRosterPlayer,
  signMarketPlayer,
  simulateNextRound,
  trainPlayer,
  upgradeStaffDepartment,
} from "@/lib/game-state";

function refreshLeaguePaths() {
  revalidatePath("/");
  revalidatePath("/roster");
  revalidatePath("/lineup");
  revalidatePath("/market");
  revalidatePath("/schedule");
  revalidatePath("/standings");
  revalidatePath("/players/[id]", "page");
}

export async function saveLineupAction(_: { ok: boolean; message: string }, formData: FormData) {
  const result = await saveFavoriteLineup(formData);
  refreshLeaguePaths();
  return result;
}

export async function simulateRoundAction(previousState: { ok: boolean; message: string }) {
  void previousState;
  const result = await simulateNextRound();
  refreshLeaguePaths();
  return result;
}

export async function resetLeagueAction(previousState: { ok: boolean; message: string }) {
  void previousState;
  const result = await resetLeague();
  refreshLeaguePaths();
  return result;
}

export async function upgradeStaffAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const department = String(formData.get("department") ?? "");
  if (department !== "training" && department !== "medical" && department !== "scouting") {
    return { ok: false as const, message: "Unknown staff department." };
  }

  const result = await upgradeStaffDepartment(department);
  refreshLeaguePaths();
  return result;
}

export async function signPlayerAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const playerId = String(formData.get("playerId") ?? "");
  const result = await signMarketPlayer(playerId);
  refreshLeaguePaths();
  return result;
}

export async function sellPlayerAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const playerId = String(formData.get("playerId") ?? "");
  const result = await sellRosterPlayer(playerId);
  refreshLeaguePaths();
  return result;
}

export async function openPackAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const packType = String(formData.get("packType") ?? "");
  if (packType !== "standard" && packType !== "elite") {
    return { ok: false as const, message: "Unknown pack type." };
  }

  const result = await openPack(packType);
  refreshLeaguePaths();
  return result;
}

export async function trainPlayerAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const playerId = String(formData.get("playerId") ?? "");
  const focus = String(formData.get("focus") ?? "");
  if (
    focus !== "scoring" &&
    focus !== "playmaking" &&
    focus !== "rebounding" &&
    focus !== "defense" &&
    focus !== "stamina"
  ) {
    return { ok: false as const, message: "Unknown training focus." };
  }

  const result = await trainPlayer(playerId, focus);
  refreshLeaguePaths();
  return result;
}
