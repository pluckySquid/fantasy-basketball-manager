"use client";

import { useActionState } from "react";
import {
  extendContractAction,
  openPackAction,
  resetLeagueAction,
  saveLineupAction,
  sellPlayerAction,
  signPlayerAction,
  simulateRoundAction,
  startNextSeasonAction,
  trainPlayerAction,
  upgradeStaffAction,
} from "@/app/actions";

const initialState = { ok: true, message: "" };

export function SimulateRoundButton({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(simulateRoundAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <button
        type="submit"
        disabled={disabled || pending}
        className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        {pending ? "Simulating..." : disabled ? "Season Complete" : "Simulate Next Round"}
      </button>
      {state.message ? <p className="text-xs text-slate-400">{state.message}</p> : null}
    </form>
  );
}

export function ResetLeagueButton() {
  const [state, action, pending] = useActionState(resetLeagueAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Resetting..." : "Reset League"}
      </button>
      {state.message ? <p className="text-xs text-slate-400">{state.message}</p> : null}
    </form>
  );
}

export function StartNextSeasonButton({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(startNextSeasonAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <button
        type="submit"
        disabled={disabled || pending}
        className="w-full rounded-2xl bg-sky-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        {pending ? "Rolling Over..." : disabled ? "Finish Season First" : "Start Next Season"}
      </button>
      {state.message ? <p className="text-xs text-slate-400">{state.message}</p> : null}
    </form>
  );
}

export function LineupForm({
  players,
  currentLineup,
}: {
  players: Array<{
    id: string;
    fullName: string;
    position: string;
    overall: number;
  }>;
  currentLineup: Record<string, string>;
}) {
  const [state, action, pending] = useActionState(saveLineupAction, initialState);

  const fieldLabels: Array<[string, string]> = [
    ["pgId", "Starting PG"],
    ["sgId", "Starting SG"],
    ["sfId", "Starting SF"],
    ["pfId", "Starting PF"],
    ["cId", "Starting C"],
    ["benchOneId", "Bench 1"],
    ["benchTwoId", "Bench 2"],
    ["benchThreeId", "Bench 3"],
  ];

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        {fieldLabels.map(([field, label]) => (
          <label key={field} className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">{label}</span>
            <select
              name={field}
              defaultValue={currentLineup[field]}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-amber-300/70"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.fullName} | {player.position} | OVR {player.overall}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        >
          {pending ? "Saving..." : "Save Lineup"}
        </button>
        <p className={`text-sm ${state.ok ? "text-slate-300" : "text-rose-300"}`}>{state.message}</p>
      </div>
    </form>
  );
}

export function StaffUpgradeButton({
  department,
  label,
  cost,
}: {
  department: "training" | "medical" | "scouting";
  label: string;
  cost: number;
}) {
  const [state, action, pending] = useActionState(upgradeStaffAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="department" value={department} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Upgrading..." : `Upgrade ${label} (${cost} cr)`}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function SignPlayerButton({
  playerId,
  price,
}: {
  playerId: string;
  price: number;
}) {
  const [state, action, pending] = useActionState(signPlayerAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        {pending ? "Signing..." : `Sign for ${price} cr`}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function TrainPlayerForm({ playerId }: { playerId: string }) {
  const [state, action, pending] = useActionState(trainPlayerAction, initialState);
  const options = [
    ["scoring", "Scoring Session"],
    ["playmaking", "Playmaking Session"],
    ["rebounding", "Rebounding Session"],
    ["defense", "Defense Session"],
    ["stamina", "Conditioning Session"],
  ] as const;

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="playerId" value={playerId} />
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-200">Training focus</span>
        <select
          name="focus"
          defaultValue="scoring"
          className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/70"
        >
          {options.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        {pending ? "Training..." : "Run Training"}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function ExtendContractButton({
  playerId,
  cost,
}: {
  playerId: string;
  cost: number;
}) {
  const [state, action, pending] = useActionState(extendContractAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-sky-300/25 bg-sky-300/12 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Negotiating..." : `Extend Contract (${cost} cr)`}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function SellPlayerButton({
  playerId,
  value,
}: {
  playerId: string;
  value: number;
}) {
  const [state, action, pending] = useActionState(sellPlayerAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-rose-300/25 bg-rose-300/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Selling..." : `Sell for ${value} cr`}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}

export function OpenPackButton({
  packType,
  label,
  cost,
}: {
  packType: "standard" | "elite";
  label: string;
  cost: number;
}) {
  const [state, action, pending] = useActionState(openPackAction, initialState);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="packType" value={packType} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl border border-cyan-300/25 bg-cyan-300/12 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Opening..." : `${label} (${cost} cr)`}
      </button>
      {state.message ? <p className={`text-xs ${state.ok ? "text-slate-400" : "text-rose-300"}`}>{state.message}</p> : null}
    </form>
  );
}
