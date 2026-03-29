"use server";

import { revalidatePath } from "next/cache";
import { resetLeague, saveFavoriteLineup, simulateNextRound, upgradeStaffDepartment } from "@/lib/game-state";

function refreshLeaguePaths() {
  revalidatePath("/");
  revalidatePath("/roster");
  revalidatePath("/lineup");
  revalidatePath("/schedule");
  revalidatePath("/standings");
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
