"use server";

import { revalidatePath } from "next/cache";
import { resetLeague, saveFavoriteLineup, simulateNextRound } from "@/lib/game-state";

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
