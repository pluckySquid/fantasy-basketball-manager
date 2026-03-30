"use server";

import { revalidatePath } from "next/cache";
import {
  extendContract,
  executeTrade,
  openPack,
  resetLeague,
  saveFavoriteLineup,
  sellRosterPlayer,
  signMarketPlayer,
  simulateNextRound,
  startNextSeason,
  trainPlayer,
  upgradeStaffDepartment,
} from "@/lib/game-state";
import { getLocale, isLocale, setLocaleCookie, translateServerMessage } from "@/lib/i18n";

function refreshLeaguePaths() {
  revalidatePath("/");
  revalidatePath("/roster");
  revalidatePath("/lineup");
  revalidatePath("/market");
  revalidatePath("/schedule");
  revalidatePath("/standings");
  revalidatePath("/stats");
  revalidatePath("/players/[id]", "page");
}

export async function saveLineupAction(_: { ok: boolean; message: string }, formData: FormData) {
  const result = await saveFavoriteLineup(formData);
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
}

export async function simulateRoundAction(previousState: { ok: boolean; message: string }) {
  void previousState;
  const result = await simulateNextRound();
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
}

export async function startNextSeasonAction(previousState: { ok: boolean; message: string }) {
  void previousState;
  const result = await startNextSeason();
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
}

export async function resetLeagueAction(previousState: { ok: boolean; message: string }) {
  void previousState;
  const result = await resetLeague();
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
}

export async function upgradeStaffAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const department = String(formData.get("department") ?? "");
  if (department !== "training" && department !== "medical" && department !== "scouting") {
    const locale = await getLocale();
    return { ok: false as const, message: translateServerMessage("Unknown staff department.", locale) };
  }

  const result = await upgradeStaffDepartment(department);
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
}

export async function signPlayerAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const playerId = String(formData.get("playerId") ?? "");
  const result = await signMarketPlayer(playerId);
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
}

export async function sellPlayerAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const playerId = String(formData.get("playerId") ?? "");
  const result = await sellRosterPlayer(playerId);
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
}

export async function openPackAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const packType = String(formData.get("packType") ?? "");
  if (packType !== "standard" && packType !== "elite") {
    const locale = await getLocale();
    return { ok: false as const, message: translateServerMessage("Unknown pack type.", locale) };
  }

  const result = await openPack(packType);
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
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
    const locale = await getLocale();
    return { ok: false as const, message: translateServerMessage("Unknown training focus.", locale) };
  }

  const result = await trainPlayer(playerId, focus);
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
}

export async function extendContractAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const playerId = String(formData.get("playerId") ?? "");
  const result = await extendContract(playerId);
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
}

export async function executeTradeAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const givePlayerId = String(formData.get("givePlayerId") ?? "");
  const receivePlayerId = String(formData.get("receivePlayerId") ?? "");
  const result = await executeTrade(givePlayerId, receivePlayerId);
  const locale = await getLocale();
  refreshLeaguePaths();
  return { ...result, message: translateServerMessage(result.message, locale) };
}

export async function setLanguageAction(
  _: { ok: boolean; message: string },
  formData: FormData,
) {
  const locale = String(formData.get("locale") ?? "");
  if (!isLocale(locale)) {
    const currentLocale = await getLocale();
    return { ok: false as const, message: translateServerMessage("Unknown language.", currentLocale) };
  }
  await setLocaleCookie(locale);
  refreshLeaguePaths();
  return { ok: true as const, message: "" };
}
